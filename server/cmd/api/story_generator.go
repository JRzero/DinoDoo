package main

import (
	"bytes"
	"context"
	crand "crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

type GeneratedStoryTurn struct {
	Text       string   `json:"text"`
	Choices    []string `json:"choices"`
	Expression string   `json:"expression"`
}

type StoryGenerationRequest struct {
	Initial      bool
	Dino         DinoProfile
	Theme        Theme
	State        StoryState
	Input        string
	RecentTurns  []StoryTurn
	CreativeSeed string
}

type StoryGenerator interface {
	Generate(context.Context, StoryGenerationRequest) (GeneratedStoryTurn, error)
}

type OpenAIStoryGenerator struct {
	httpClient *http.Client
	baseURL    string
	apiKey     string
	model      string
}

func NewOpenAIStoryGeneratorFromEnv() StoryGenerator {
	apiKey := strings.TrimSpace(os.Getenv("OPENAI_API_KEY"))
	if apiKey == "" {
		return nil
	}
	timeoutSeconds, err := strconv.Atoi(env("OPENAI_STORY_TIMEOUT_SECONDS", "12"))
	if err != nil || timeoutSeconds < 1 {
		timeoutSeconds = 12
	}
	return &OpenAIStoryGenerator{
		httpClient: &http.Client{Timeout: time.Duration(timeoutSeconds) * time.Second},
		baseURL:    strings.TrimRight(env("OPENAI_BASE_URL", "https://api.openai.com/v1"), "/"),
		apiKey:     apiKey,
		model:      env("OPENAI_STORY_MODEL", "gpt-4o-mini"),
	}
}

func (g *OpenAIStoryGenerator) Generate(ctx context.Context, input StoryGenerationRequest) (GeneratedStoryTurn, error) {
	if g == nil || g.apiKey == "" {
		return GeneratedStoryTurn{}, errors.New("story provider is not configured")
	}
	systemPrompt := `你是面向3岁儿童的互动恐龙故事编剧。故事必须温暖、简单、有连续剧情、无暴力、无恐怖、无隐私询问。每轮只输出JSON对象：{"text":"2到5句故事，120个汉字以内，最后形成选择点","choices":["2到20字的完整选项","2到20字的完整选项","2到20字的完整选项"],"expression":"happy|curious|gentle|sleepy"}。三个选项必须不同、能推进同一个故事，可以使用完整短句，禁止Markdown和额外说明。`
	payload, err := json.Marshal(map[string]interface{}{
		"model":             g.model,
		"temperature":       1.05,
		"presence_penalty":  0.55,
		"frequency_penalty": 0.25,
		"max_tokens":        320,
		"response_format":   map[string]string{"type": "json_object"},
		"messages": []map[string]string{
			{"role": "system", "content": systemPrompt},
			{"role": "user", "content": buildStoryPrompt(input)},
		},
	})
	if err != nil {
		return GeneratedStoryTurn{}, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, g.baseURL+"/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return GeneratedStoryTurn{}, err
	}
	req.Header.Set("Authorization", "Bearer "+g.apiKey)
	req.Header.Set("Content-Type", "application/json")
	res, err := g.httpClient.Do(req)
	if err != nil {
		return GeneratedStoryTurn{}, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return GeneratedStoryTurn{}, err
	}
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return GeneratedStoryTurn{}, fmt.Errorf("story provider status %d", res.StatusCode)
	}
	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	if err := json.Unmarshal(body, &response); err != nil {
		return GeneratedStoryTurn{}, err
	}
	if len(response.Choices) == 0 {
		return GeneratedStoryTurn{}, errors.New("story provider returned no choices")
	}
	var generated GeneratedStoryTurn
	if err := json.Unmarshal([]byte(stripJSONFence(response.Choices[0].Message.Content)), &generated); err != nil {
		return GeneratedStoryTurn{}, fmt.Errorf("decode story provider output: %w", err)
	}
	return generated, nil
}

func newStoryCreativeSeed() string {
	var randomBytes [8]byte
	if _, err := crand.Read(randomBytes[:]); err == nil {
		return hex.EncodeToString(randomBytes[:])
	}
	return strconv.FormatInt(time.Now().UnixNano(), 36)
}

func buildStoryPrompt(input StoryGenerationRequest) string {
	recent := input.RecentTurns
	if len(recent) > 6 {
		recent = recent[len(recent)-6:]
	}
	lines := make([]string, 0, len(recent))
	for _, turn := range recent {
		text := truncateRunes(strings.TrimSpace(turn.Text), 120)
		if text != "" {
			lines = append(lines, fmt.Sprintf("%s: %s", turn.Role, text))
		}
	}
	phase := "continue the story"
	if input.Initial {
		phase = "open a new story"
	}
	creativeSeed := strings.TrimSpace(input.CreativeSeed)
	if creativeSeed == "" {
		creativeSeed = newStoryCreativeSeed()
	}
	return fmt.Sprintf("Creative seed: %s\nVariation rule: use the seed to invent a fresh child-safe event, place, clue, and wording. Do not repeat the recent plot or choices.\nPhase: %s\nMain character: %s, %s, %s\nScene: %s\nGoal: %s\nCurrent choice: %s\nRecent plot:\n%s",
		creativeSeed, phase, input.Dino.Name, input.Dino.Species, input.Dino.Personality,
		input.State.Scene, input.State.Goal, truncateRunes(strings.TrimSpace(input.Input), 20), strings.Join(lines, "\n"))
}

func normalizeGeneratedStory(generated GeneratedStoryTurn, guard SafetyGuard) (GeneratedStoryTurn, error) {
	generated.Text = strings.TrimSpace(generated.Text)
	if count := utf8.RuneCountInString(generated.Text); count < 8 || count > 120 {
		return GeneratedStoryTurn{}, errors.New("generated story text length is invalid")
	}
	if _, flags := guard.SafeOutput(generated.Text); len(flags) > 0 {
		return GeneratedStoryTurn{}, errors.New("generated story text failed safety checks")
	}
	if len(generated.Choices) != 3 {
		return GeneratedStoryTurn{}, errors.New("generated story must contain exactly three choices")
	}
	seen := map[string]struct{}{}
	for index, choice := range generated.Choices {
		choice = strings.TrimSpace(choice)
		count := utf8.RuneCountInString(choice)
		if count < 2 || count > 20 || len(guard.CheckInput(choice)) > 0 {
			return GeneratedStoryTurn{}, errors.New("generated story choice is invalid")
		}
		if _, exists := seen[choice]; exists {
			return GeneratedStoryTurn{}, errors.New("generated story choices must be distinct")
		}
		seen[choice] = struct{}{}
		generated.Choices[index] = choice
	}
	allowedExpressions := map[string]bool{"happy": true, "curious": true, "gentle": true, "sleepy": true}
	if !allowedExpressions[generated.Expression] {
		generated.Expression = "curious"
	}
	return generated, nil
}

func stripJSONFence(content string) string {
	content = strings.TrimSpace(content)
	if strings.HasPrefix(content, "```") {
		content = strings.TrimPrefix(content, "```json")
		content = strings.TrimPrefix(content, "```")
		content = strings.TrimSuffix(content, "```")
	}
	return strings.TrimSpace(content)
}

func truncateRunes(text string, limit int) string {
	runes := []rune(text)
	if len(runes) <= limit {
		return text
	}
	return string(runes[:limit])
}
