package main

import (
	"bytes"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type hatchResponse struct {
	Artifact *Artifact `json:"artifact"`
	Replayed bool      `json:"replayed"`
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
		repo:   repo,
		story:  NewStoryEngine(guard),
		media:  NewMediaService(repo.mediaDir, guard),
		static: t.TempDir(),
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

func TestCreateHatchJSONUsesFallbackAndPersists(t *testing.T) {
	app, handler := newTestHandler(t)
	rec := requestJSON(t, handler, http.MethodPost, "/api/v1/hatches", map[string]string{
		"prompt":          "蓝色 会唱歌的三角龙",
		"idempotency_key": "json-hatch-1",
	})
	if rec.Code != http.StatusCreated {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
	response := decodeHatchResponse(t, rec)
	if response.Replayed {
		t.Fatal("new hatch unexpectedly replayed")
	}
	if response.Artifact == nil || response.Artifact.Type != "hatched_dino" {
		t.Fatalf("unexpected artifact: %#v", response.Artifact)
	}
	if response.Artifact.Provider != "local-svg" || response.Artifact.Status != "ready" {
		t.Fatalf("unexpected fallback artifact: %#v", response.Artifact)
	}
	if response.Artifact.URL == "" {
		t.Fatal("artifact URL is empty")
	}
	if _, err := os.Stat(filepath.Join(app.repo.mediaDir, response.Artifact.FilePath)); err != nil {
		t.Fatalf("generated media missing: %v", err)
	}
	if got := len(app.repo.Artifacts()); got != 1 {
		t.Fatalf("artifact count=%d, want 1", got)
	}
	var promptData map[string]interface{}
	if err := json.Unmarshal(response.Artifact.Prompt, &promptData); err != nil {
		t.Fatalf("prompt metadata: %v", err)
	}
	if promptData["text"] != "蓝色 会唱歌的三角龙" {
		t.Fatalf("prompt text=%v", promptData["text"])
	}
}

func TestCreateHatchIsIdempotent(t *testing.T) {
	app, handler := newTestHandler(t)
	body := map[string]string{"prompt": "粉色小腕龙", "idempotency_key": "same-hatch"}
	first := requestJSON(t, handler, http.MethodPost, "/api/v1/hatches", body)
	if first.Code != http.StatusCreated {
		t.Fatalf("first status=%d body=%s", first.Code, first.Body.String())
	}
	firstResponse := decodeHatchResponse(t, first)

	second := requestJSON(t, handler, http.MethodPost, "/api/v1/hatches", body)
	if second.Code != http.StatusOK {
		t.Fatalf("second status=%d body=%s", second.Code, second.Body.String())
	}
	secondResponse := decodeHatchResponse(t, second)
	if !secondResponse.Replayed {
		t.Fatal("second hatch should be replayed")
	}
	if secondResponse.Artifact.ID != firstResponse.Artifact.ID {
		t.Fatalf("ids differ: %s != %s", secondResponse.Artifact.ID, firstResponse.Artifact.ID)
	}
	if got := len(app.repo.Artifacts()); got != 1 {
		t.Fatalf("artifact count=%d, want 1", got)
	}
}

func TestCreateHatchMultipartAndDeleteCleansMedia(t *testing.T) {
	app, handler := newTestHandler(t)
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	if err := writer.WriteField("prompt", "绿色会跳舞的小恐龙"); err != nil {
		t.Fatal(err)
	}
	if err := writer.WriteField("idempotency_key", "multipart-hatch"); err != nil {
		t.Fatal(err)
	}
	part, err := writer.CreateFormFile("image", "reference.png")
	if err != nil {
		t.Fatal(err)
	}
	png := []byte{0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d}
	if _, err := part.Write(png); err != nil {
		t.Fatal(err)
	}
	if err := writer.Close(); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/hatches", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
	response := decodeHatchResponse(t, rec)
	artifact := response.Artifact
	if artifact.SourceFilePath == "" {
		t.Fatal("source image was not persisted")
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
