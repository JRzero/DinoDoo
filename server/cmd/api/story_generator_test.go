package main

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

type scriptedStoryGenerator struct {
	turns    []GeneratedStoryTurn
	err      error
	requests []StoryGenerationRequest
}

func (g *scriptedStoryGenerator) Generate(_ context.Context, request StoryGenerationRequest) (GeneratedStoryTurn, error) {
	g.requests = append(g.requests, request)
	if g.err != nil {
		return GeneratedStoryTurn{}, g.err
	}
	if len(g.turns) == 0 {
		return GeneratedStoryTurn{}, errors.New("no scripted story turn")
	}
	turn := g.turns[0]
	g.turns = g.turns[1:]
	return turn, nil
}

func TestStoryEngineUsesGeneratedOpeningAndContextualNextTurn(t *testing.T) {
	generator := &scriptedStoryGenerator{turns: []GeneratedStoryTurn{
		{Text: "彩虹森林亮起小灯，小暴发现一串金色脚印。要从哪里找起呢？", Choices: []string{"看看树洞", "跟着脚印", "问问萤火虫"}, Expression: "curious"},
		{Text: "脚印带小暴来到会唱歌的小溪，三块石头正轻轻发光。下一步怎么办？", Choices: []string{"踩蓝石头", "听小溪唱歌", "请鱼儿帮忙"}, Expression: "happy"},
	}}
	engine := NewStoryEngine(NewSafetyGuard(), generator)
	session, err := engine.Start(context.Background(), "adventure", "xiaobao")
	if err != nil {
		t.Fatal(err)
	}
	if session.Turns[0].Text != "彩虹森林亮起小灯，小暴发现一串金色脚印。要从哪里找起呢？" {
		t.Fatalf("opening did not use generated text: %q", session.Turns[0].Text)
	}
	if len(session.State.Choices) != 3 || session.State.Choices[1] != "跟着脚印" {
		t.Fatalf("opening choices were not generated: %v", session.State.Choices)
	}
	session.Turns = append(session.Turns, StoryTurn{Role: "user", Text: "跟着脚印"})
	next := engine.Next(context.Background(), session, "跟着脚印")
	if next.Text != "脚印带小暴来到会唱歌的小溪，三块石头正轻轻发光。下一步怎么办？" || len(next.Choices) != 3 {
		t.Fatalf("next turn did not use generated story: %#v", next)
	}
	if len(generator.requests) != 2 || !generator.requests[0].Initial {
		t.Fatalf("unexpected generation requests: %#v", generator.requests)
	}
	if generator.requests[0].CreativeSeed == "" || generator.requests[1].CreativeSeed == "" || generator.requests[0].CreativeSeed == generator.requests[1].CreativeSeed {
		t.Fatalf("story requests must use distinct creative seeds: %#v", generator.requests)
	}
	request := generator.requests[1]
	if request.Input != "跟着脚印" || len(request.RecentTurns) < 2 {
		t.Fatalf("next request is missing story context: %#v", request)
	}
}

func TestStoryEngineFallsBackForInvalidAndUnavailableGeneration(t *testing.T) {
	invalid := &scriptedStoryGenerator{turns: []GeneratedStoryTurn{{
		Text:    "小暴来到彩虹桥边，准备继续寻找亮晶晶的恐龙蛋。",
		Choices: []string{"走上彩虹桥", "走上彩虹桥", "看看小河"},
	}}}
	engine := NewStoryEngine(NewSafetyGuard(), invalid)
	session, err := engine.Start(context.Background(), "adventure", "xiaobao")
	if err != nil {
		t.Fatal(err)
	}
	if session.State.Choices[0] == session.State.Choices[1] {
		t.Fatalf("invalid duplicate model choices were accepted: %v", session.State.Choices)
	}

	timedOut := &scriptedStoryGenerator{err: context.DeadlineExceeded}
	engine = NewStoryEngine(NewSafetyGuard(), timedOut)
	session, err = engine.Start(context.Background(), "adventure", "xiaobao")
	if err != nil {
		t.Fatal(err)
	}
	next := engine.Next(context.Background(), session, session.State.Choices[0])
	if next.Text == "" || len(next.Choices) != 3 {
		t.Fatalf("provider timeout did not return a usable fallback: %#v", next)
	}
}

func TestOpenAIStoryGeneratorParsesJSONAndSendsBoundedContext(t *testing.T) {
	var requestBody map[string]interface{}
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Fatalf("authorization header=%q", r.Header.Get("Authorization"))
		}
		if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
			t.Fatal(err)
		}
		writeJSON(w, http.StatusOK, map[string]interface{}{
			"choices": []map[string]interface{}{{
				"message": map[string]string{"content": "```json\n{\"text\":\"小暴听见树洞里传来叮咚声，里面藏着一颗会发光的小种子。要怎么帮助它？\",\"choices\":[\"轻轻浇水\",\"唱首小歌\",\"找阳光来\"],\"expression\":\"gentle\"}\n```"},
			}},
		})
	}))
	defer server.Close()

	generator := &OpenAIStoryGenerator{
		httpClient: server.Client(),
		baseURL:    server.URL,
		apiKey:     "test-key",
		model:      "story-test-model",
	}
	recent := make([]StoryTurn, 0, 8)
	for i := 0; i < 8; i++ {
		recent = append(recent, StoryTurn{Role: "assistant", Text: "recent-story-beat"})
	}
	turn, err := generator.Generate(context.Background(), StoryGenerationRequest{
		Dino:         findDino("xiaobao"),
		Theme:        findTheme("adventure"),
		State:        StoryState{Scene: "彩虹森林", Goal: "找到发光的恐龙蛋"},
		Input:        "look-in-tree-hole",
		CreativeSeed: "seed-test-123",
		RecentTurns:  recent,
	})
	if err != nil {
		t.Fatal(err)
	}
	if turn.Text == "" || len(turn.Choices) != 3 || turn.Choices[2] != "找阳光来" {
		t.Fatalf("unexpected provider turn: %#v", turn)
	}
	if temperature, ok := requestBody["temperature"].(float64); !ok || temperature < 1 {
		t.Fatalf("story temperature must encourage variation: %#v", requestBody["temperature"])
	}
	if requestBody["presence_penalty"].(float64) <= 0 || requestBody["frequency_penalty"].(float64) <= 0 {
		t.Fatalf("story request must discourage repetition: %#v", requestBody)
	}
	messages, ok := requestBody["messages"].([]interface{})
	if !ok || len(messages) != 2 {
		t.Fatalf("provider messages missing: %#v", requestBody)
	}
	userMessage := messages[1].(map[string]interface{})["content"].(string)
	if !strings.Contains(userMessage, "look-in-tree-hole") || !strings.Contains(userMessage, "seed-test-123") || strings.Count(userMessage, "recent-story-beat") != 6 {
		t.Fatalf("context was not bounded or choice was omitted: %q", userMessage)
	}
	if !strings.Contains(userMessage, "Fixed protagonist rule") {
		t.Fatalf("story prompt does not lock the protagonist: %q", userMessage)
	}
}

func TestNormalizeGeneratedStoryAcceptsLongNarrativeAndCompleteAnswers(t *testing.T) {
	generated, err := normalizeGeneratedStory(GeneratedStoryTurn{
		Text: "彩虹森林的树叶一片片亮了起来，小暴顺着金色脚印走到会唱歌的小河边。河面漂着三只小船，每只船都通向不同的地方，我们接下来选择哪一条路呢？",
		Choices: []string{
			"坐上蓝色小船寻找发光的恐龙蛋",
			"请河边的小鱼告诉我们新的线索",
			"先和阿呆一起观察三只小船的图案",
		},
		Expression: "curious",
	}, NewSafetyGuard())
	if err != nil {
		t.Fatal(err)
	}
	if len(generated.Choices) != 3 || generated.Choices[2] != "先和阿呆一起观察三只小船的图案" {
		t.Fatalf("long generated story was not preserved: %#v", generated)
	}
}
