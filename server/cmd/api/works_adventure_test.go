package main

import (
	"encoding/json"
	"net/http"
	"testing"
	"time"
)

func TestWorkArtifactStartsAndKeepsCustomDinoStory(t *testing.T) {
	app, handler := newTestHandler(t)
	prompt, err := json.Marshal(map[string]string{
		"text": "橙色、爱冒险、开心大笑的小霸王龙",
	})
	if err != nil {
		t.Fatal(err)
	}
	artifact := &Artifact{
		ID:        "art-work-story",
		Type:      "hatched_dino",
		Title:     "小橙",
		Prompt:    prompt,
		Status:    "ready",
		CreatedAt: time.Now().Format(time.RFC3339),
	}
	if err := app.repo.SaveArtifact(artifact); err != nil {
		t.Fatalf("SaveArtifact: %v", err)
	}

	created := requestJSON(t, handler, http.MethodPost, "/api/v1/play-sessions", map[string]string{
		"theme":       "adventure",
		"artifact_id": artifact.ID,
	})
	if created.Code != http.StatusCreated {
		t.Fatalf("create status=%d body=%s", created.Code, created.Body.String())
	}
	var session PlaySession
	if err := json.NewDecoder(created.Body).Decode(&session); err != nil {
		t.Fatal(err)
	}
	if !session.State.CustomDino || session.State.ArtifactID != artifact.ID {
		t.Fatalf("custom work state missing: %#v", session.State)
	}
	if session.State.ActiveDinoName != artifact.Title {
		t.Fatalf("active dino name=%q want %q", session.State.ActiveDinoName, artifact.Title)
	}
	if len(session.Turns) == 0 || session.Turns[0].Speaker != artifact.Title {
		t.Fatalf("first turn does not use work dino: %#v", session.Turns)
	}

	next := requestJSON(t, handler, http.MethodPost, "/api/v1/play-sessions/"+session.ID+"/turns", map[string]string{
		"input":  "沿着发光脚印向前走",
		"source": "choice",
	})
	if next.Code != http.StatusOK {
		t.Fatalf("turn status=%d body=%s", next.Code, next.Body.String())
	}
	var response struct {
		Session PlaySession `json:"session"`
		Turn    StoryTurn   `json:"turn"`
	}
	if err := json.NewDecoder(next.Body).Decode(&response); err != nil {
		t.Fatal(err)
	}
	if response.Turn.Speaker != artifact.Title {
		t.Fatalf("next speaker=%q want %q", response.Turn.Speaker, artifact.Title)
	}
	if response.Session.State.ActiveDinoName != artifact.Title || !response.Session.State.CustomDino {
		t.Fatalf("custom dino was not retained: %#v", response.Session.State)
	}
}

func TestLocalWorkProfileCanStartStoryWithoutArtifact(t *testing.T) {
	_, handler := newTestHandler(t)
	created := requestJSON(t, handler, http.MethodPost, "/api/v1/play-sessions", map[string]string{
		"theme":            "adventure",
		"dino_name":        "小星",
		"dino_description": "蓝色、会唱歌、喜欢帮助朋友",
	})
	if created.Code != http.StatusCreated {
		t.Fatalf("create status=%d body=%s", created.Code, created.Body.String())
	}
	var session PlaySession
	if err := json.NewDecoder(created.Body).Decode(&session); err != nil {
		t.Fatal(err)
	}
	if !session.State.CustomDino || session.State.ActiveDinoName != "小星" {
		t.Fatalf("local profile was not used: %#v", session.State)
	}
}
