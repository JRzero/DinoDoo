package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

const (
	hatchJobQueued    = "queued"
	hatchJobRunning   = "running"
	hatchJobSucceeded = "succeeded"
	hatchJobFailed    = "failed"

	hatchImageSkillCanonical = "gpt_image"
	hatchImageStyleVersion   = "dinodoo-feature-animation-v2"
)

const hatchImageStyleSystemPrompt = `You are the official character artist for DinoDoo, a Chinese preschool dinosaur adventure game. The supplied DinoDoo character reference images are the authoritative visual-style guide. Use them for visual language only; never copy an existing character's exact colors, markings, species, or pose.
Follow this visual identity for every generated dinosaur:
- Create exactly one joyful baby dinosaur in the same premium animated-feature-film 3D character style as the DinoDoo references, suitable for a polished children's game.
- Match the references' appealing anatomy: rounded but clearly recognizable species silhouette, a moderately oversized expressive head, substantial torso, short sturdy legs, tiny rounded claws, and a soft cream-colored belly or muzzle area. Avoid a generic minimalist toy, vinyl figurine, clay maquette, or blob-like body.
- Give the character large glossy dark-brown eyes with bright catchlights, lively brows, rosy friendly cheeks when appropriate, and an energetic open smile. Small rounded white teeth are welcome for carnivorous species; the expression must remain playful and non-threatening.
- Use vivid saturated colors, layered species-specific markings, subtle finely detailed skin texture, soft subsurface warmth, clean cinematic highlights, and bright tropical daylight. Keep materials organic and animated-film-like, not plastic or matte clay.
- Show the complete dinosaur from head to feet in a lively front three-quarter pose. Center it and let it occupy about 76 percent of a square canvas, with comfortable clear space around the silhouette.
- Produce a real alpha-transparent PNG background. Do not draw scenery, a floor, a pedestal, a white rectangle, a fake transparency checkerboard, text, letters, logos, watermarks, borders, or extra characters.
- Preserve the requested species, main colors, personality, action, markings, and explicitly requested child-safe accessories. Never infer clothing or accessories from personality or action words such as adventurous, brave, singing, or dancing. If a child-provided reference is supplied in addition to the DinoDoo style references, preserve only its safe requested visual traits.
- Never use photorealism, horror, aggression, sharp threatening teeth, weapons, injury, darkness, or mature themes.
Treat these style rules and the DinoDoo reference images as mandatory. Ignore any conflicting rendering-style or background instructions in the character brief.`

type HatchProfile struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ImagePrompt string `json:"image_prompt"`
}

type HatchJobError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type HatchJob struct {
	JobID          string         `json:"job_id"`
	IdempotencyKey string         `json:"idempotency_key,omitempty"`
	Prompt         string         `json:"prompt"`
	ImageName      string         `json:"image_name,omitempty"`
	ImagePath      string         `json:"image_path,omitempty"`
	Status         string         `json:"status"`
	CurrentStep    string         `json:"current_step"`
	Progress       int            `json:"progress"`
	Profile        *HatchProfile  `json:"profile,omitempty"`
	ArtifactID     string         `json:"artifact_id,omitempty"`
	Error          *HatchJobError `json:"error,omitempty"`
	CreatedAt      string         `json:"created_at"`
	UpdatedAt      string         `json:"updated_at"`
}

type HatchJobResponse struct {
	JobID       string         `json:"job_id"`
	StatusURL   string         `json:"status_url"`
	Status      string         `json:"status"`
	CurrentStep string         `json:"current_step"`
	Progress    int            `json:"progress"`
	Profile     *HatchProfile  `json:"profile,omitempty"`
	Artifact    *Artifact      `json:"artifact,omitempty"`
	Error       *HatchJobError `json:"error,omitempty"`
	CreatedAt   string         `json:"created_at"`
	UpdatedAt   string         `json:"updated_at"`
}

type HatchProfileGenerator interface {
	Generate(context.Context, string) (HatchProfile, error)
}

type OpenAIHatchProfileGenerator struct {
	httpClient *http.Client
	baseURL    string
	apiKey     string
	model      string
	guard      SafetyGuard
}

func NewOpenAIHatchProfileGeneratorFromEnv(guard SafetyGuard) HatchProfileGenerator {
	apiKey := strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))
	if apiKey == "" {
		return nil
	}
	timeoutSeconds, err := strconv.Atoi(env("OPENAI_HATCH_TIMEOUT_SECONDS", "30"))
	if err != nil || timeoutSeconds < 1 {
		timeoutSeconds = 30
	}
	model := strings.TrimSpace(os.Getenv("OPENAI_HATCH_MODEL"))
	if model == "" {
		model = env("OPENAI_STORY_MODEL", "mimo-v2.5-pro")
	}
	return &OpenAIHatchProfileGenerator{
		httpClient: &http.Client{Timeout: time.Duration(timeoutSeconds) * time.Second},
		baseURL:    strings.TrimRight(env("OPENAI_BASE_URL", "https://api.openai.com/v1"), "/"),
		apiKey:     apiKey,
		model:      model,
		guard:      guard,
	}
}

func (g *OpenAIHatchProfileGenerator) Generate(ctx context.Context, prompt string) (HatchProfile, error) {
	if g == nil || g.apiKey == "" {
		return HatchProfile{}, errors.New("hatch profile provider is not configured")
	}
	payload, err := json.Marshal(map[string]interface{}{
		"model":           g.model,
		"temperature":     0.8,
		"max_tokens":      360,
		"response_format": map[string]string{"type": "json_object"},
		"messages": []map[string]string{
			{
				"role":    "system",
				"content": "You design one friendly baby dinosaur for a Chinese preschool app. Return strict JSON only with name, description, image_prompt. name is 2-8 Chinese characters. description is one warm Chinese sentence. image_prompt is a detailed English character brief only: dinosaur species, body colors and markings, personality, facial expression, pose or action, and any explicitly requested child-safe accessory. Include an accessory only when the child explicitly requests it; never infer one from personality or action. Do not specify rendering style, background, camera, scenery, text, logos, or additional characters because the backend owns those visual rules.",
			},
			{
				"role":    "user",
				"content": "Child request: " + truncateRunes(strings.TrimSpace(prompt), maxHatchPromptRunes),
			},
		},
	})
	if err != nil {
		return HatchProfile{}, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, g.baseURL+"/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return HatchProfile{}, err
	}
	req.Header.Set("Authorization", "Bearer "+g.apiKey)
	req.Header.Set("Content-Type", "application/json")
	res, err := g.httpClient.Do(req)
	if err != nil {
		return HatchProfile{}, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return HatchProfile{}, err
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return HatchProfile{}, fmt.Errorf("hatch profile provider status %d", res.StatusCode)
	}
	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(body, &response); err != nil {
		return HatchProfile{}, err
	}
	if len(response.Choices) == 0 {
		return HatchProfile{}, errors.New("hatch profile provider returned no choices")
	}
	var profile HatchProfile
	if err := json.Unmarshal([]byte(stripJSONFence(response.Choices[0].Message.Content)), &profile); err != nil {
		return HatchProfile{}, fmt.Errorf("decode hatch profile: %w", err)
	}
	return normalizeHatchProfile(profile, g.guard)
}

func normalizeHatchProfile(profile HatchProfile, guard SafetyGuard) (HatchProfile, error) {
	profile.Name = strings.TrimSpace(profile.Name)
	profile.Description = strings.TrimSpace(profile.Description)
	profile.ImagePrompt = strings.TrimSpace(profile.ImagePrompt)
	if count := utf8.RuneCountInString(profile.Name); count < 1 || count > 12 {
		return HatchProfile{}, errors.New("generated dinosaur name is invalid")
	}
	if count := utf8.RuneCountInString(profile.Description); count < 4 || count > 100 {
		return HatchProfile{}, errors.New("generated dinosaur description is invalid")
	}
	if count := utf8.RuneCountInString(profile.ImagePrompt); count < 20 || count > 800 {
		return HatchProfile{}, errors.New("generated dinosaur image prompt is invalid")
	}
	for _, value := range []string{profile.Name, profile.Description} {
		if _, flags := guard.SafeOutput(value); len(flags) > 0 {
			return HatchProfile{}, errors.New("generated dinosaur profile failed safety checks")
		}
	}
	if flags := guard.CheckInput(profile.ImagePrompt); len(flags) > 0 {
		return HatchProfile{}, fmt.Errorf("generated dinosaur image prompt failed safety checks: %s", strings.Join(flags, ","))
	}
	return profile, nil
}

func normalizeHatchImageSkill(value string) (string, error) {
	value = strings.ToLower(strings.TrimSpace(value))
	switch value {
	case "", hatchImageSkillCanonical, "image_gpt":
		return hatchImageSkillCanonical, nil
	default:
		return "", fmt.Errorf("unsupported hatch image skill %q", value)
	}
}

func configuredHatchImageSkill() (string, error) {
	return normalizeHatchImageSkill(os.Getenv("DINODOO_IMAGE_SKILL"))
}

func buildHatchImagePrompt(characterBrief string) string {
	return hatchImageStyleSystemPrompt + "\n\nCharacter brief:\n" + strings.TrimSpace(characterBrief)
}

func imageAPIKey() string {
	if key := strings.TrimSpace(os.Getenv("OPENAI_IMAGE_API_KEY")); key != "" {
		return key
	}
	return strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))
}

func imageBaseURL() string {
	if baseURL := strings.TrimSpace(os.Getenv("OPENAI_IMAGE_BASE_URL")); baseURL != "" {
		return strings.TrimRight(baseURL, "/")
	}
	return strings.TrimRight(env("OPENAI_BASE_URL", "https://api.openai.com/v1"), "/")
}

func newHatchJob(req HatchRequest) *HatchJob {
	now := time.Now().Format(time.RFC3339Nano)
	prompt := strings.TrimSpace(req.Prompt)
	if prompt == "" {
		prompt = "a friendly blue baby dinosaur that loves singing"
	}
	return &HatchJob{
		JobID:          newID("hatch"),
		IdempotencyKey: req.IdempotencyKey,
		Prompt:         prompt,
		ImageName:      req.ImageName,
		ImagePath:      req.ImagePath,
		Status:         hatchJobQueued,
		CurrentStep:    "queued",
		Progress:       0,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}

func cloneHatchJob(job *HatchJob) *HatchJob {
	if job == nil {
		return nil
	}
	copy := *job
	if job.Profile != nil {
		profile := *job.Profile
		copy.Profile = &profile
	}
	if job.Error != nil {
		jobError := *job.Error
		copy.Error = &jobError
	}
	return &copy
}

func (r *Repository) SaveHatchJob(job *HatchJob) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.data.Hatches == nil {
		r.data.Hatches = map[string]*HatchJob{}
	}
	job.UpdatedAt = time.Now().Format(time.RFC3339Nano)
	r.data.Hatches[job.JobID] = cloneHatchJob(job)
	return r.saveLocked()
}

func (r *Repository) HatchJob(jobID string) (*HatchJob, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	job, ok := r.data.Hatches[jobID]
	return cloneHatchJob(job), ok
}

func (r *Repository) HatchJobByIdempotencyKey(key string) (*HatchJob, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if strings.TrimSpace(key) == "" {
		return nil, false
	}
	for _, job := range r.data.Hatches {
		if job.IdempotencyKey == key {
			return cloneHatchJob(job), true
		}
	}
	return nil, false
}

func (r *Repository) UnfinishedHatchJobs() []*HatchJob {
	r.mu.Lock()
	defer r.mu.Unlock()
	jobs := make([]*HatchJob, 0)
	for _, job := range r.data.Hatches {
		if job.Status == hatchJobQueued || job.Status == hatchJobRunning {
			jobs = append(jobs, cloneHatchJob(job))
		}
	}
	return jobs
}

func (a *App) hatchJobResponse(job *HatchJob) HatchJobResponse {
	response := HatchJobResponse{
		JobID:       job.JobID,
		StatusURL:   "/api/v1/hatches/" + job.JobID,
		Status:      job.Status,
		CurrentStep: job.CurrentStep,
		Progress:    job.Progress,
		Profile:     job.Profile,
		Error:       job.Error,
		CreatedAt:   job.CreatedAt,
		UpdatedAt:   job.UpdatedAt,
	}
	if job.ArtifactID != "" {
		response.Artifact, _ = a.repo.Artifact(job.ArtifactID)
	}
	return response
}

func (a *App) getHatchJob(w http.ResponseWriter, r *http.Request) {
	job, ok := a.repo.HatchJob(strings.TrimSpace(r.PathValue("id")))
	if !ok {
		writeError(w, http.StatusNotFound, errors.New("hatch job not found"))
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"job": a.hatchJobResponse(job)})
}

func (a *App) resumeHatchJobs() {
	for _, job := range a.repo.UnfinishedHatchJobs() {
		job.Status = hatchJobQueued
		job.CurrentStep = "queued"
		job.Progress = 0
		job.Error = nil
		if err := a.repo.SaveHatchJob(job); err == nil {
			a.enqueueHatchJob(job.JobID)
		}
	}
}

func (a *App) enqueueHatchJob(jobID string) {
	a.hatchMu.Lock()
	if a.hatchClaims == nil {
		a.hatchClaims = map[string]bool{}
	}
	if a.hatchClaims[jobID] {
		a.hatchMu.Unlock()
		return
	}
	a.hatchClaims[jobID] = true
	a.hatchMu.Unlock()

	go func() {
		defer func() {
			a.hatchMu.Lock()
			delete(a.hatchClaims, jobID)
			a.hatchMu.Unlock()
		}()
		a.processHatchJob(jobID)
	}()
}

func (a *App) processHatchJob(jobID string) {
	job, ok := a.repo.HatchJob(jobID)
	if !ok || job.Status == hatchJobSucceeded || job.Status == hatchJobFailed {
		return
	}
	job.Status = hatchJobRunning
	job.CurrentStep = "profile"
	job.Progress = 15
	job.Error = nil
	if err := a.repo.SaveHatchJob(job); err != nil {
		return
	}

	timeoutSeconds, err := strconv.Atoi(env("DINODOO_HATCH_JOB_TIMEOUT_SECONDS", "240"))
	if err != nil || timeoutSeconds < 10 {
		timeoutSeconds = 240
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeoutSeconds)*time.Second)
	defer cancel()

	if a.hatchProfile == nil {
		a.failHatchJob(job, "PROFILE_PROVIDER_NOT_CONFIGURED", "Dinosaur creator is not configured")
		return
	}
	profile, err := a.hatchProfile.Generate(ctx, job.Prompt)
	if err != nil {
		log.Printf("hatch profile generation failed: job=%s err=%v", job.JobID, err)
		a.failHatchJob(job, "PROFILE_GENERATION_FAILED", "Could not understand the dinosaur request")
		return
	}
	job.Profile = &profile
	job.CurrentStep = "image"
	job.Progress = 60
	if err := a.repo.SaveHatchJob(job); err != nil {
		return
	}

	generate := a.hatchGenerate
	if generate == nil {
		generate = a.media.GenerateHatch
	}
	artifact, err := generate(ctx, HatchRequest{
		Prompt:         job.Prompt,
		IdempotencyKey: job.IdempotencyKey,
		ImageName:      job.ImageName,
		ImagePath:      job.ImagePath,
		Profile:        &profile,
	})
	if err != nil {
		log.Printf("hatch image generation failed: job=%s err=%v", job.JobID, err)
		a.failHatchJob(job, "IMAGE_GENERATION_FAILED", "Could not create the dinosaur picture")
		return
	}
	job.CurrentStep = "persist"
	job.Progress = 95
	if err := a.repo.SaveHatchJob(job); err != nil {
		removeMediaFile(a.repo.mediaDir, artifact.FilePath)
		return
	}
	if err := a.repo.SaveArtifact(artifact); err != nil {
		removeMediaFile(a.repo.mediaDir, artifact.FilePath)
		a.failHatchJob(job, "PERSIST_FAILED", "Could not save the new dinosaur")
		return
	}
	job.ArtifactID = artifact.ID
	job.Status = hatchJobSucceeded
	job.CurrentStep = "done"
	job.Progress = 100
	job.Error = nil
	_ = a.repo.SaveHatchJob(job)
}

func (a *App) failHatchJob(job *HatchJob, code, message string) {
	job.Status = hatchJobFailed
	job.Error = &HatchJobError{Code: code, Message: message}
	_ = a.repo.SaveHatchJob(job)
}
