package main

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

type hatchResponse struct {
	Artifact *Artifact `json:"artifact"`
	Replayed bool      `json:"replayed"`
}

type hatchSubmitResponse struct {
	Job      HatchJobResponse `json:"job"`
	Replayed bool             `json:"replayed"`
}

type fakeHatchProfileGenerator struct {
	err error
}

func (g fakeHatchProfileGenerator) Generate(context.Context, string) (HatchProfile, error) {
	if g.err != nil {
		return HatchProfile{}, g.err
	}
	return HatchProfile{
		Name:        "Little Star",
		Description: "A friendly singing baby dinosaur.",
		ImagePrompt: "One friendly full-body blue baby dinosaur singing in a clean preschool game scene.",
	}, nil
}

func newTestHandler(t *testing.T) (*App, http.Handler) {
	t.Helper()
	t.Setenv("OPENAI_API_KEY", "")
	t.Setenv("DINODOO_IMAGE_PROVIDER", "")
	dataDir := t.TempDir()
	repo, err := NewRepository(dataDir)
	if err != nil {
		t.Fatalf("NewRepository: %v", err)
	}
	guard := NewSafetyGuard()
	app := &App{
		repo:         repo,
		story:        NewStoryEngine(guard),
		media:        NewMediaService(repo.mediaDir, guard),
		static:       t.TempDir(),
		hatchClaims:  map[string]bool{},
		hatchProfile: fakeHatchProfileGenerator{},
	}
	app.hatchGenerate = func(_ context.Context, req HatchRequest) (*Artifact, error) {
		filename := newID("generated") + ".png"
		if err := os.WriteFile(filepath.Join(repo.mediaDir, filename), []byte{0x89, 0x50, 0x4e, 0x47}, 0o644); err != nil {
			return nil, err
		}
		promptJSON, _ := json.Marshal(map[string]interface{}{"text": req.Prompt, "profile": req.Profile})
		return &Artifact{
			ID:             newID("art"),
			IdempotencyKey: req.IdempotencyKey,
			Type:           "hatched_dino",
			Title:          req.Profile.Name,
			Prompt:         promptJSON,
			FilePath:       filename,
			SourceFilePath: req.ImagePath,
			URL:            "/media/" + filename,
			Status:         "ready",
			Provider:       "fake-image",
			CreatedAt:      time.Now().Format(time.RFC3339),
		}, nil
	}
	mux := http.NewServeMux()
	app.routes(mux)
	return app, mux
}

func requestJSON(t *testing.T, handler http.Handler, method, target string, body interface{}) *httptest.ResponseRecorder {
	t.Helper()
	payload, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("json.Marshal: %v", err)
	}
	req := httptest.NewRequest(method, target, bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	return rec
}

func decodeHatchResponse(t *testing.T, rec *httptest.ResponseRecorder) hatchResponse {
	t.Helper()
	var response hatchResponse
	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Fatalf("decode response: %v; body=%s", err, rec.Body.String())
	}
	return response
}
func decodeHatchSubmitResponse(t *testing.T, rec *httptest.ResponseRecorder) hatchSubmitResponse {
	t.Helper()
	var response hatchSubmitResponse
	if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
		t.Fatalf("decode hatch submit response: %v; body=%s", err, rec.Body.String())
	}
	return response
}

func waitForHatchJob(t *testing.T, handler http.Handler, statusURL, wantStatus string) HatchJobResponse {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		req := httptest.NewRequest(http.MethodGet, statusURL, nil)
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("job status=%d body=%s", rec.Code, rec.Body.String())
		}
		var response struct {
			Job HatchJobResponse `json:"job"`
		}
		if err := json.NewDecoder(rec.Body).Decode(&response); err != nil {
			t.Fatal(err)
		}
		if response.Job.Status == wantStatus {
			return response.Job
		}
		if response.Job.Status == hatchJobFailed && wantStatus != hatchJobFailed {
			t.Fatalf("job failed: %#v", response.Job.Error)
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for hatch status %s", wantStatus)
	return HatchJobResponse{}
}

func TestCreateHatchSubmitsJobAndPersistsGeneratedImage(t *testing.T) {
	app, handler := newTestHandler(t)
	rec := requestJSON(t, handler, http.MethodPost, "/api/v1/hatches", map[string]string{
		"prompt":          "blue singing triceratops",
		"idempotency_key": "json-hatch-1",
	})
	if rec.Code != http.StatusAccepted {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
	submit := decodeHatchSubmitResponse(t, rec)
	if submit.Replayed || submit.Job.JobID == "" || submit.Job.StatusURL == "" {
		t.Fatalf("unexpected submit response: %#v", submit)
	}
	job := waitForHatchJob(t, handler, submit.Job.StatusURL, hatchJobSucceeded)
	if job.Progress != 100 || job.Artifact == nil || job.Artifact.Provider != "fake-image" {
		t.Fatalf("unexpected completed job: %#v", job)
	}
	if _, err := os.Stat(filepath.Join(app.repo.mediaDir, job.Artifact.FilePath)); err != nil {
		t.Fatalf("generated image missing: %v", err)
	}
	if got := len(app.repo.Artifacts()); got != 1 {
		t.Fatalf("artifact count=%d, want 1", got)
	}
}

func TestCreateHatchIsIdempotentByJob(t *testing.T) {
	app, handler := newTestHandler(t)
	body := map[string]string{"prompt": "pink baby dinosaur", "idempotency_key": "same-hatch"}
	first := requestJSON(t, handler, http.MethodPost, "/api/v1/hatches", body)
	second := requestJSON(t, handler, http.MethodPost, "/api/v1/hatches", body)
	if first.Code != http.StatusAccepted || second.Code != http.StatusAccepted {
		t.Fatalf("statuses=%d,%d", first.Code, second.Code)
	}
	firstResponse := decodeHatchSubmitResponse(t, first)
	secondResponse := decodeHatchSubmitResponse(t, second)
	if secondResponse.Job.JobID != firstResponse.Job.JobID || !secondResponse.Replayed {
		t.Fatalf("idempotent replay mismatch: first=%#v second=%#v", firstResponse, secondResponse)
	}
	waitForHatchJob(t, handler, firstResponse.Job.StatusURL, hatchJobSucceeded)
	if got := len(app.repo.Artifacts()); got != 1 {
		t.Fatalf("artifact count=%d, want 1", got)
	}
}

func TestCreateHatchMultipartPassesReferenceAndDeleteCleansMedia(t *testing.T) {
	app, handler := newTestHandler(t)
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	_ = writer.WriteField("prompt", "green dancing baby dinosaur")
	_ = writer.WriteField("idempotency_key", "multipart-hatch")
	part, err := writer.CreateFormFile("image", "reference.png")
	if err != nil {
		t.Fatal(err)
	}
	_, _ = part.Write([]byte{0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d})
	_ = writer.Close()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/hatches", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusAccepted {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
	submit := decodeHatchSubmitResponse(t, rec)
	job := waitForHatchJob(t, handler, submit.Job.StatusURL, hatchJobSucceeded)
	artifact := job.Artifact
	if artifact == nil || artifact.SourceFilePath == "" {
		t.Fatalf("source image was not passed to artifact: %#v", artifact)
	}
	generatedPath := filepath.Join(app.repo.mediaDir, artifact.FilePath)
	sourcePath := filepath.Join(app.repo.mediaDir, artifact.SourceFilePath)
	for _, path := range []string{generatedPath, sourcePath} {
		if _, err := os.Stat(path); err != nil {
			t.Fatalf("media missing %s: %v", path, err)
		}
	}
	deleteReq := httptest.NewRequest(http.MethodDelete, "/api/v1/artifacts/"+artifact.ID, nil)
	deleteRec := httptest.NewRecorder()
	handler.ServeHTTP(deleteRec, deleteReq)
	if deleteRec.Code != http.StatusNoContent {
		t.Fatalf("delete status=%d body=%s", deleteRec.Code, deleteRec.Body.String())
	}
	for _, path := range []string{generatedPath, sourcePath} {
		if _, err := os.Stat(path); !os.IsNotExist(err) {
			t.Fatalf("media still exists %s: %v", path, err)
		}
	}
}

func TestCreateHatchRejectsInvalidImage(t *testing.T) {
	app, handler := newTestHandler(t)
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	_ = writer.WriteField("prompt", "蓝色小恐龙")
	part, err := writer.CreateFormFile("image", "notes.txt")
	if err != nil {
		t.Fatal(err)
	}
	_, _ = part.Write([]byte("not an image"))
	_ = writer.Close()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/hatches", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusUnsupportedMediaType {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
	if got := len(app.repo.Artifacts()); got != 0 {
		t.Fatalf("artifact count=%d, want 0", got)
	}
}

func TestCreateHatchRejectsLongPrompt(t *testing.T) {
	app, handler := newTestHandler(t)
	rec := requestJSON(t, handler, http.MethodPost, "/api/v1/hatches", map[string]string{
		"prompt":          strings.Repeat("龙", maxHatchPromptRunes+1),
		"idempotency_key": "too-long",
	})
	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
	if got := len(app.repo.Artifacts()); got != 0 {
		t.Fatalf("artifact count=%d, want 0", got)
	}
}

func TestEnforceStoryProtagonistRewritesOtherDinoNames(t *testing.T) {
	turn := enforceStoryProtagonist(GeneratedStoryTurn{
		Text: "阿呆轻轻捡起石头，咕噜在旁边点头。",
		Choices: []string{
			"问问阿呆发现了什么",
			"请咕噜看看远处",
			"和小暴继续向前走",
		},
	}, "小暴")
	combined := turn.Text + strings.Join(turn.Choices, "")
	if strings.Contains(combined, "阿呆") || strings.Contains(combined, "咕噜") {
		t.Fatalf("other dino names were not rewritten: %#v", turn)
	}
	if !strings.Contains(combined, "小暴") {
		t.Fatalf("protagonist name missing after rewrite: %#v", turn)
	}
}

func TestStorySettingsAndMediaFallbackAPIs(t *testing.T) {
	app, handler := newTestHandler(t)

	settings := defaultSettings()
	settings.DailyMinutesLimit = 25
	settings.EnabledThemes = []string{"adventure"}
	settingsRec := requestJSON(t, handler, http.MethodPut, "/api/v1/parent/settings", settings)
	if settingsRec.Code != http.StatusOK {
		t.Fatalf("settings status=%d body=%s", settingsRec.Code, settingsRec.Body.String())
	}

	sessionRec := requestJSON(t, handler, http.MethodPost, "/api/v1/play-sessions", map[string]string{
		"theme": "adventure",
		"dino":  "adai",
	})
	if sessionRec.Code != http.StatusCreated {
		t.Fatalf("session status=%d body=%s", sessionRec.Code, sessionRec.Body.String())
	}
	var session PlaySession
	if err := json.NewDecoder(sessionRec.Body).Decode(&session); err != nil {
		t.Fatal(err)
	}
	if session.ID == "" || len(session.Turns) != 1 {
		t.Fatalf("invalid session: %#v", session)
	}
	if len(session.State.Choices) != 3 || len(session.Turns[0].Choices) != 3 {
		t.Fatalf("initial choices must contain three items: state=%v turn=%v", session.State.Choices, session.Turns[0].Choices)
	}

	turnRec := requestJSON(t, handler, http.MethodPost, "/api/v1/play-sessions/"+session.ID+"/turns", map[string]string{
		"input":  "去看看",
		"source": "choice",
	})
	if turnRec.Code != http.StatusOK {
		t.Fatalf("turn status=%d body=%s", turnRec.Code, turnRec.Body.String())
	}
	var turnResponse struct {
		Session *PlaySession `json:"session"`
		Turn    *StoryTurn   `json:"turn"`
	}
	if err := json.NewDecoder(turnRec.Body).Decode(&turnResponse); err != nil {
		t.Fatal(err)
	}
	if turnResponse.Session == nil || turnResponse.Turn == nil || len(turnResponse.Session.State.Choices) != 3 || len(turnResponse.Turn.Choices) != 3 {
		t.Fatalf("next turn choices must contain three items: %#v", turnResponse)
	}
	if turnResponse.Turn.Speaker != session.Turns[0].Speaker {
		t.Fatalf("story protagonist changed: first=%q next=%q", session.Turns[0].Speaker, turnResponse.Turn.Speaker)
	}
	if turnResponse.Session.State.ActiveDino != session.State.ActiveDino {
		t.Fatalf("active dino changed: first=%q next=%q", session.State.ActiveDino, turnResponse.Session.State.ActiveDino)
	}

	finishRec := requestJSON(t, handler, http.MethodPost, "/api/v1/play-sessions/"+session.ID+"/finish", map[string]string{})
	if finishRec.Code != http.StatusOK {
		t.Fatalf("finish status=%d body=%s", finishRec.Code, finishRec.Body.String())
	}
	var firstFinish hatchResponse
	if err := json.NewDecoder(finishRec.Body).Decode(&firstFinish); err != nil {
		t.Fatal(err)
	}
	secondFinish := requestJSON(t, handler, http.MethodPost, "/api/v1/play-sessions/"+session.ID+"/finish", map[string]string{})
	if secondFinish.Code != http.StatusOK {
		t.Fatalf("second finish status=%d body=%s", secondFinish.Code, secondFinish.Body.String())
	}
	var replay struct {
		Artifact *Artifact `json:"artifact"`
		Replayed bool      `json:"replayed"`
	}
	if err := json.NewDecoder(secondFinish.Body).Decode(&replay); err != nil {
		t.Fatal(err)
	}
	if !replay.Replayed || replay.Artifact.ID != firstFinish.Artifact.ID {
		t.Fatalf("finish was not idempotent: %#v", replay)
	}
	if got := len(app.repo.Artifacts()); got != 1 {
		t.Fatalf("artifact count=%d, want 1", got)
	}

	speechRec := requestJSON(t, handler, http.MethodPost, "/api/v1/audio/speech", map[string]string{
		"text":        "你好呀",
		"voice_style": "warm",
	})
	if speechRec.Code != http.StatusNoContent {
		t.Fatalf("speech status=%d body=%s", speechRec.Code, speechRec.Body.String())
	}
	if speechRec.Header().Get("X-DinoDoo-Speech-Fallback") != "browser" {
		t.Fatal("speech fallback header missing")
	}

	var audioBody bytes.Buffer
	audioWriter := multipart.NewWriter(&audioBody)
	audioPart, err := audioWriter.CreateFormFile("file", "voice.webm")
	if err != nil {
		t.Fatal(err)
	}
	_, _ = audioPart.Write([]byte("demo audio"))
	_ = audioWriter.Close()
	audioReq := httptest.NewRequest(http.MethodPost, "/api/v1/audio/transcriptions", &audioBody)
	audioReq.Header.Set("Content-Type", audioWriter.FormDataContentType())
	audioRec := httptest.NewRecorder()
	handler.ServeHTTP(audioRec, audioReq)
	if audioRec.Code != http.StatusOK {
		t.Fatalf("transcription status=%d body=%s", audioRec.Code, audioRec.Body.String())
	}
	var transcription struct {
		Fallback bool `json:"fallback"`
	}
	if err := json.NewDecoder(audioRec.Body).Decode(&transcription); err != nil {
		t.Fatal(err)
	}
	if !transcription.Fallback {
		t.Fatal("transcription should report fallback without provider key")
	}
}
