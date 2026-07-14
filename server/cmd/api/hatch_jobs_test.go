package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestHatchJobFailureDoesNotPersistArtifact(t *testing.T) {
	app, handler := newTestHandler(t)
	app.hatchProfile = fakeHatchProfileGenerator{err: errors.New("provider failed")}

	rec := requestJSON(t, handler, http.MethodPost, "/api/v1/hatches", map[string]string{
		"prompt":          "a cheerful green baby dinosaur",
		"idempotency_key": "failed-hatch",
	})
	if rec.Code != http.StatusAccepted {
		t.Fatalf("status=%d body=%s", rec.Code, rec.Body.String())
	}
	submit := decodeHatchSubmitResponse(t, rec)
	job := waitForHatchJob(t, handler, submit.Job.StatusURL, hatchJobFailed)
	if job.Error == nil || job.Error.Code != "PROFILE_GENERATION_FAILED" {
		t.Fatalf("unexpected job error: %#v", job.Error)
	}
	if job.Artifact != nil || len(app.repo.Artifacts()) != 0 {
		t.Fatalf("failed job persisted an artifact: %#v", job.Artifact)
	}
}

func TestResumeHatchJobsProcessesPersistedQueue(t *testing.T) {
	app, handler := newTestHandler(t)
	job := newHatchJob(HatchRequest{
		Prompt:         "a gentle yellow baby dinosaur",
		IdempotencyKey: "resume-hatch",
	})
	if err := app.repo.SaveHatchJob(job); err != nil {
		t.Fatal(err)
	}

	app.resumeHatchJobs()
	completed := waitForHatchJob(t, handler, "/api/v1/hatches/"+job.JobID, hatchJobSucceeded)
	if completed.Progress != 100 || completed.Artifact == nil {
		t.Fatalf("resumed job did not complete: %#v", completed)
	}
}

func TestGenerateHatchRequiresConfiguredImageProvider(t *testing.T) {
	app, _ := newTestHandler(t)
	app.hatchGenerate = nil
	profile := &HatchProfile{
		Name:        "Little Star",
		Description: "A friendly baby dinosaur.",
		ImagePrompt: "One friendly full-body baby dinosaur in a clean child-safe scene.",
	}
	_, err := app.media.GenerateHatch(context.Background(), HatchRequest{Prompt: "blue dino", Profile: profile})
	if err == nil {
		t.Fatal("expected missing image provider to fail")
	}
}

func TestHatchImagePromptUsesCanonicalSkillAndStableStyle(t *testing.T) {
	t.Setenv("DINODOO_IMAGE_SKILL", "image_gpt")
	skill, err := configuredHatchImageSkill()
	if err != nil {
		t.Fatal(err)
	}
	if skill != hatchImageSkillCanonical {
		t.Fatalf("skill=%q, want %q", skill, hatchImageSkillCanonical)
	}

	brief := "One mint-green baby triceratops who loves singing."
	prompt := buildHatchImagePrompt(brief)
	for _, required := range []string{
		"official character artist for DinoDoo",
		"exactly one joyful baby dinosaur",
		"animated-feature-film 3D character style",
		"real alpha-transparent PNG background",
		"fake transparency checkerboard",
		"Character brief:\n" + brief,
	} {
		if !strings.Contains(prompt, required) {
			t.Fatalf("styled prompt missing %q: %s", required, prompt)
		}
	}
}

func TestGenerateHatchSendsGPTImageStyleContract(t *testing.T) {
	const tinyPNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
	var requestFields map[string]string
	var referenceCount int
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/images/edits" {
			t.Errorf("path=%q", r.URL.Path)
		}
		if err := r.ParseMultipartForm(8 << 20); err != nil {
			t.Errorf("parse multipart request: %v", err)
		}
		requestFields = map[string]string{
			"model": r.FormValue("model"), "prompt": r.FormValue("prompt"),
			"background": r.FormValue("background"), "output_format": r.FormValue("output_format"),
			"quality": r.FormValue("quality"),
		}
		referenceCount = len(r.MultipartForm.File["image"])
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"data": []map[string]string{{"b64_json": tinyPNG}},
		})
	}))
	defer server.Close()

	styleReference := filepath.Join(t.TempDir(), "dinodoo-style.png")
	styleBytes, err := base64.StdEncoding.DecodeString(tinyPNG)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(styleReference, styleBytes, 0o644); err != nil {
		t.Fatal(err)
	}

	t.Setenv("OPENAI_IMAGE_API_KEY", "test-key")
	t.Setenv("OPENAI_IMAGE_BASE_URL", server.URL)
	t.Setenv("DINODOO_IMAGE_PROVIDER", "openai")
	t.Setenv("DINODOO_IMAGE_SKILL", "image_gpt")
	t.Setenv("DINODOO_HATCH_STYLE_REFERENCES", styleReference)
	media := NewMediaService(t.TempDir(), NewSafetyGuard())
	artifact, err := media.GenerateHatch(context.Background(), HatchRequest{
		Prompt: "mint singing triceratops",
		Profile: &HatchProfile{
			Name:        "Little Mint",
			Description: "A gentle singing baby dinosaur.",
			ImagePrompt: "One mint-green baby triceratops who loves singing.",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if artifact.Provider != hatchImageSkillCanonical {
		t.Fatalf("provider=%q", artifact.Provider)
	}
	prompt := requestFields["prompt"]
	if !strings.Contains(prompt, hatchImageStyleSystemPrompt) || !strings.Contains(prompt, "mint-green baby triceratops") {
		t.Fatalf("image prompt missing style or brief: %q", prompt)
	}
	if requestFields["model"] != "gpt-image-2" || requestFields["background"] != "transparent" || requestFields["output_format"] != "png" || requestFields["quality"] != "high" {
		t.Fatalf("unexpected image options: %#v", requestFields)
	}
	if referenceCount != 1 {
		t.Fatalf("reference image count=%d, want 1", referenceCount)
	}
	var metadata map[string]interface{}
	if err := json.Unmarshal(artifact.Prompt, &metadata); err != nil {
		t.Fatal(err)
	}
	if metadata["image_skill"] != hatchImageSkillCanonical || metadata["image_style_version"] != hatchImageStyleVersion || metadata["image_model"] != "gpt-image-2" || metadata["style_reference_count"] != float64(1) {
		t.Fatalf("unexpected metadata: %#v", metadata)
	}
}

func TestHatchImageSkillRejectsUnknownSkill(t *testing.T) {
	if _, err := normalizeHatchImageSkill("other_image_skill"); err == nil {
		t.Fatal("expected unsupported skill to fail")
	}
}

func TestNormalizeHatchProfileRejectsUnsafeOrIncompleteData(t *testing.T) {
	guard := NewSafetyGuard()
	if _, err := normalizeHatchProfile(HatchProfile{Name: "A", Description: "tiny", ImagePrompt: "short"}, guard); err == nil {
		t.Fatal("expected incomplete image prompt to fail")
	}
}
