package main

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"encoding/xml"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
	"unicode"
	"unicode/utf8"
)

type Settings struct {
	DailyMinutesLimit int      `json:"daily_minutes_limit"`
	EnabledThemes     []string `json:"enabled_themes"`
	ImageGeneration   bool     `json:"image_generation_enabled"`
	VoiceEnabled      bool     `json:"voice_enabled"`
	MusicEnabled      bool     `json:"music_enabled"`
	SaveAudioEnabled  bool     `json:"save_audio_enabled"`
	MemoryEnabled     bool     `json:"memory_enabled"`
	UpdatedAt         string   `json:"updated_at"`
}

type DinoProfile struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Species     string `json:"species"`
	Personality string `json:"personality"`
	Catchphrase string `json:"catchphrase"`
	VoiceStyle  string `json:"voice_style"`
	Color       string `json:"color"`
}

type Theme struct {
	Code  string `json:"code"`
	Name  string `json:"name"`
	Scene string `json:"scene"`
	Goal  string `json:"goal"`
}

type CardSeed struct {
	Dino   string `json:"dino"`
	Color  string `json:"color"`
	Action string `json:"action"`
	Object string `json:"object"`
}

type StoryState struct {
	Theme                 string   `json:"theme"`
	Scene                 string   `json:"scene"`
	Goal                  string   `json:"goal"`
	ActiveDino            string   `json:"active_dino"`
	ActiveDinoName        string   `json:"active_dino_name,omitempty"`
	ActiveDinoSpecies     string   `json:"active_dino_species,omitempty"`
	ActiveDinoPersonality string   `json:"active_dino_personality,omitempty"`
	ArtifactID            string   `json:"artifact_id,omitempty"`
	CustomDino            bool     `json:"custom_dino,omitempty"`
	TurnIndex             int      `json:"turn_index"`
	Mood                  string   `json:"mood"`
	Choices               []string `json:"choices"`
	CardSeed              CardSeed `json:"card_seed"`
}

type StoryTurn struct {
	ID          string   `json:"id"`
	SessionID   string   `json:"session_id"`
	Speaker     string   `json:"speaker"`
	Role        string   `json:"role"`
	Text        string   `json:"text"`
	Expression  string   `json:"expression"`
	Choices     []string `json:"choices"`
	SafetyFlags []string `json:"safety_flags"`
	CreatedAt   string   `json:"created_at"`
}

type PlaySession struct {
	ID        string      `json:"id"`
	Theme     string      `json:"theme"`
	Status    string      `json:"status"`
	State     StoryState  `json:"state"`
	Turns     []StoryTurn `json:"turns"`
	StartedAt string      `json:"started_at"`
	EndedAt   string      `json:"ended_at,omitempty"`
}

type Artifact struct {
	ID             string          `json:"id"`
	SessionID      string          `json:"session_id,omitempty"`
	IdempotencyKey string          `json:"idempotency_key,omitempty"`
	Type           string          `json:"type"`
	Title          string          `json:"title"`
	Prompt         json.RawMessage `json:"prompt_json"`
	FilePath       string          `json:"file_path"`
	SourceFilePath string          `json:"source_file_path,omitempty"`
	URL            string          `json:"url"`
	Status         string          `json:"status"`
	Provider       string          `json:"provider"`
	CreatedAt      string          `json:"created_at"`
}

type HatchRequest struct {
	Prompt         string
	IdempotencyKey string
	ImageName      string
	ImagePath      string
	ImageData      []byte
	Profile        *HatchProfile
}

type StoreData struct {
	Settings  Settings                `json:"settings"`
	Sessions  map[string]*PlaySession `json:"sessions"`
	Artifacts map[string]*Artifact    `json:"artifacts"`
	Hatches   map[string]*HatchJob    `json:"hatches"`
}

type Repository struct {
	mu       sync.Mutex
	path     string
	mediaDir string
	data     StoreData
}

func NewRepository(dataDir string) (*Repository, error) {
	if err := os.MkdirAll(dataDir, 0o755); err != nil {
		return nil, err
	}
	mediaDir := filepath.Join(dataDir, "media")
	if err := os.MkdirAll(mediaDir, 0o755); err != nil {
		return nil, err
	}
	repo := &Repository{
		path:     filepath.Join(dataDir, "store.json"),
		mediaDir: mediaDir,
		data: StoreData{
			Settings:  defaultSettings(),
			Sessions:  map[string]*PlaySession{},
			Artifacts: map[string]*Artifact{},
			Hatches:   map[string]*HatchJob{},
		},
	}
	_ = repo.load()
	return repo, nil
}

func defaultSettings() Settings {
	now := time.Now().Format(time.RFC3339)
	return Settings{
		DailyMinutesLimit: 15,
		EnabledThemes:     []string{"adventure", "colors", "numbers", "sleep"},
		ImageGeneration:   true,
		VoiceEnabled:      true,
		MusicEnabled:      false,
		SaveAudioEnabled:  false,
		MemoryEnabled:     false,
		UpdatedAt:         now,
	}
}

func (r *Repository) load() error {
	r.mu.Lock()
	defer r.mu.Unlock()
	f, err := os.Open(r.path)
	if errors.Is(err, os.ErrNotExist) {
		return r.saveLocked()
	}
	if err != nil {
		return err
	}
	defer f.Close()
	var data StoreData
	if err := json.NewDecoder(f).Decode(&data); err != nil {
		return err
	}
	if data.Sessions == nil {
		data.Sessions = map[string]*PlaySession{}
	}
	if data.Artifacts == nil {
		data.Artifacts = map[string]*Artifact{}
	}
	if data.Hatches == nil {
		data.Hatches = map[string]*HatchJob{}
	}
	if data.Settings.EnabledThemes == nil {
		data.Settings = defaultSettings()
	}
	r.data = data
	return nil
}

func (r *Repository) saveLocked() error {
	tmp := r.path + ".tmp"
	f, err := os.Create(tmp)
	if err != nil {
		return err
	}
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	if err := enc.Encode(r.data); err != nil {
		_ = f.Close()
		return err
	}
	if err := f.Close(); err != nil {
		return err
	}
	return os.Rename(tmp, r.path)
}

func (r *Repository) Settings() Settings {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.data.Settings
}

func (r *Repository) SaveSettings(s Settings) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	s.UpdatedAt = time.Now().Format(time.RFC3339)
	if s.DailyMinutesLimit <= 0 {
		s.DailyMinutesLimit = 15
	}
	if len(s.EnabledThemes) == 0 {
		s.EnabledThemes = defaultSettings().EnabledThemes
	}
	r.data.Settings = s
	return r.saveLocked()
}

func (r *Repository) SaveSession(s *PlaySession) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data.Sessions[s.ID] = s
	return r.saveLocked()
}

func (r *Repository) Session(id string) (*PlaySession, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	s, ok := r.data.Sessions[id]
	return s, ok
}

func (r *Repository) SaveArtifact(a *Artifact) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.data.Artifacts[a.ID] = a
	return r.saveLocked()
}

func (r *Repository) Artifacts() []*Artifact {
	r.mu.Lock()
	defer r.mu.Unlock()
	items := make([]*Artifact, 0, len(r.data.Artifacts))
	for _, item := range r.data.Artifacts {
		items = append(items, item)
	}
	sort.Slice(items, func(i, j int) bool {
		return items[i].CreatedAt > items[j].CreatedAt
	})
	return items
}

func (r *Repository) Artifact(id string) (*Artifact, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	a, ok := r.data.Artifacts[id]
	return a, ok
}

func (r *Repository) ArtifactByIdempotencyKey(key string) (*Artifact, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if key == "" {
		return nil, false
	}
	for _, artifact := range r.data.Artifacts {
		if artifact.IdempotencyKey == key {
			return artifact, true
		}
	}
	return nil, false
}

func (r *Repository) ArtifactBySessionID(sessionID string) (*Artifact, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if sessionID == "" {
		return nil, false
	}
	for _, artifact := range r.data.Artifacts {
		if artifact.SessionID == sessionID {
			return artifact, true
		}
	}
	return nil, false
}

func (r *Repository) DeleteArtifact(id string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	a, ok := r.data.Artifacts[id]
	if !ok {
		return false
	}
	delete(r.data.Artifacts, id)
	_ = r.saveLocked()
	if a.FilePath != "" {
		_ = os.Remove(filepath.Join(r.mediaDir, filepath.Base(a.FilePath)))
	}
	if a.SourceFilePath != "" {
		_ = os.Remove(filepath.Join(r.mediaDir, filepath.Base(a.SourceFilePath)))
	}
	return true
}

type SafetyGuard struct {
	unsafeKeywords []string
	privateWords   []string
}

func NewSafetyGuard() SafetyGuard {
	return SafetyGuard{
		unsafeKeywords: []string{"死", "血", "打架", "杀", "害怕", "怪物", "受伤", "疼", "危险", "knife", "blood", "kill", "hurt", "scary"},
		privateWords:   []string{"地址", "电话", "学校", "姓名", "住在", "手机号", "address", "phone", "school"},
	}
}

func (g SafetyGuard) CheckInput(text string) []string {
	return g.check(text)
}

func (g SafetyGuard) SafeOutput(text string) (string, []string) {
	flags := g.check(text)
	if len(flags) > 0 || utf8.RuneCountInString(text) > 120 {
		return "我们先停一下，去找爸爸妈妈一起看。", append(flags, "output_replaced")
	}
	return text, nil
}

func (g SafetyGuard) SafePrompt(prompt string) (string, []string) {
	flags := g.check(prompt)
	safe := prompt + ", cute cartoon dinosaur, bright warm colors, friendly, nonviolent, child safe"
	if len(flags) > 0 {
		safe = "cute friendly cartoon dinosaur card, bright warm colors, stars, fruit, rainbow, child safe"
		flags = append(flags, "prompt_rewritten")
	}
	return safe, flags
}

func guardContains(text, word string) bool {
	if word == "" {
		return false
	}
	asciiWord := true
	for _, r := range word {
		if r > unicode.MaxASCII || !unicode.IsLetter(r) {
			asciiWord = false
			break
		}
	}
	if !asciiWord {
		return strings.Contains(text, word)
	}
	for _, token := range strings.FieldsFunc(text, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	}) {
		if token == word {
			return true
		}
	}
	return false
}

func (g SafetyGuard) check(text string) []string {
	lower := strings.ToLower(text)
	flags := []string{}
	for _, word := range g.unsafeKeywords {
		if guardContains(lower, strings.ToLower(word)) {
			flags = append(flags, "safety")
			break
		}
	}
	for _, word := range g.privateWords {
		if guardContains(lower, strings.ToLower(word)) {
			flags = append(flags, "privacy")
			break
		}
	}
	return flags
}

type StoryEngine struct {
	guard     SafetyGuard
	generator StoryGenerator
}

func NewStoryEngine(guard SafetyGuard, generators ...StoryGenerator) StoryEngine {
	var generator StoryGenerator
	if len(generators) > 0 {
		generator = generators[0]
	}
	return StoryEngine{guard: guard, generator: generator}
}

func dinos() []DinoProfile {
	return []DinoProfile{
		{Code: "xiaobao", Name: "小暴", Species: "小霸王龙", Personality: "勇敢好奇但不凶", Catchphrase: "小脚丫，出发啦！", VoiceStyle: "bright", Color: "#f97316"},
		{Code: "adai", Name: "阿呆", Species: "小三角龙", Personality: "呆萌勇敢、爱帮忙的男孩子", Catchphrase: "阿呆来啦，我们一起试试。", VoiceStyle: "warm", Color: "#fb7185"},
		{Code: "gulu", Name: "咕噜", Species: "腕龙", Personality: "慢吞吞爱水果", Catchphrase: "咕噜咕噜，我看到啦。", VoiceStyle: "soft", Color: "#8b5cf6"},
	}
}

func themes() []Theme {
	return []Theme{
		{Code: "adventure", Name: "彩虹森林", Scene: "彩虹森林", Goal: "找到会发光的恐龙蛋"},
		{Code: "colors", Name: "颜色乐园", Scene: "颜色山谷", Goal: "帮星星找到喜欢的颜色"},
		{Code: "numbers", Name: "数字小路", Scene: "数字小路", Goal: "一起数到三颗亮亮星"},
		{Code: "sleep", Name: "晚安山洞", Scene: "晚安山洞", Goal: "把月亮毯子送回家"},
	}
}

func findDino(code string) DinoProfile {
	for _, dino := range dinos() {
		if dino.Code == code {
			return dino
		}
	}
	return dinos()[0]
}

func (e StoryEngine) Start(ctx context.Context, themeCode string, dinoCode string) (*PlaySession, error) {
	return e.start(ctx, themeCode, findDino(dinoCode), "", false)
}

func (e StoryEngine) StartWithDino(ctx context.Context, themeCode string, dino DinoProfile, artifactID string) (*PlaySession, error) {
	return e.start(ctx, themeCode, normalizeWorkDino(dino), artifactID, true)
}

func (e StoryEngine) start(ctx context.Context, themeCode string, dino DinoProfile, artifactID string, custom bool) (*PlaySession, error) {
	t := findTheme(themeCode)
	state := StoryState{
		Theme:                 t.Code,
		Scene:                 t.Scene,
		Goal:                  t.Goal,
		ActiveDino:            dino.Code,
		ActiveDinoName:        dino.Name,
		ActiveDinoSpecies:     dino.Species,
		ActiveDinoPersonality: dino.Personality,
		ArtifactID:            artifactID,
		CustomDino:            custom,
		TurnIndex:             0,
		Mood:                  "curious",
		Choices:               []string{"走近一点看看发光的恐龙蛋", "请阿呆陪我们一起去森林深处", "先安静听听树叶后面的声音"},
		CardSeed: CardSeed{
			Dino:   dino.Species,
			Color:  "蓝色",
			Action: "举着小星星",
			Object: "彩虹蛋",
		},
	}
	session := &PlaySession{
		ID:        newID("ps"),
		Theme:     t.Code,
		Status:    "active",
		State:     state,
		StartedAt: time.Now().Format(time.RFC3339),
	}
	text := fmt.Sprintf("%s的树叶忽然闪起金色小光点，草丛里传来轻轻的叮咚声，一颗发光的恐龙蛋正在等朋友。我们先做什么呢？", t.Scene)
	expression := "happy"
	if e.generator != nil {
		generated, err := e.generator.Generate(ctx, StoryGenerationRequest{Initial: true, Dino: dino, Theme: t, State: state, CreativeSeed: newStoryCreativeSeed()})
		if err == nil {
			if normalized, normalizeErr := normalizeGeneratedStory(generated, e.guard); normalizeErr == nil {
				text = normalized.Text
				state.Choices = normalized.Choices
				session.State.Choices = normalized.Choices
				expression = normalized.Expression
			} else {
				log.Printf("story provider output fallback: %v", normalizeErr)
			}
		} else {
			log.Printf("story provider fallback: %v", err)
		}
	}
	text, flags := e.guard.SafeOutput(text)
	session.Turns = append(session.Turns, StoryTurn{
		ID:          newID("turn"),
		SessionID:   session.ID,
		Speaker:     dino.Name,
		Role:        "assistant",
		Text:        text,
		Expression:  expression,
		Choices:     state.Choices,
		SafetyFlags: flags,
		CreatedAt:   time.Now().Format(time.RFC3339),
	})
	return session, nil
}

func normalizeWorkDino(dino DinoProfile) DinoProfile {
	dino.Code = truncateRunes(strings.TrimSpace(dino.Code), 80)
	dino.Name = truncateRunes(strings.TrimSpace(dino.Name), 16)
	dino.Species = truncateRunes(strings.TrimSpace(dino.Species), 32)
	dino.Personality = truncateRunes(strings.TrimSpace(dino.Personality), 80)
	if dino.Code == "" {
		dino.Code = "work-dino"
	}
	if dino.Name == "" {
		dino.Name = "新小恐龙"
	}
	if dino.Species == "" {
		dino.Species = "小恐龙"
	}
	if dino.Personality == "" {
		dino.Personality = "勇敢、好奇、喜欢交朋友"
	}
	if dino.Catchphrase == "" {
		dino.Catchphrase = "一起出发吧！"
	}
	if dino.VoiceStyle == "" {
		dino.VoiceStyle = "warm"
	}
	return dino
}

func storyDinoFromState(state StoryState) DinoProfile {
	return normalizeWorkDino(DinoProfile{
		Code:        state.ActiveDino,
		Name:        state.ActiveDinoName,
		Species:     state.ActiveDinoSpecies,
		Personality: state.ActiveDinoPersonality,
	})
}

func (e StoryEngine) Next(ctx context.Context, session *PlaySession, input string) StoryTurn {
	flags := e.guard.CheckInput(input)
	if len(flags) > 0 {
		session.State.Choices = []string{"找爸爸妈妈", "轻轻抱抱", "回到首页"}
		return StoryTurn{
			ID:          newID("turn"),
			SessionID:   session.ID,
			Speaker:     "阿呆",
			Role:        "assistant",
			Text:        "我们先停一下，找爸爸妈妈一起看。",
			Expression:  "gentle",
			Choices:     session.State.Choices,
			SafetyFlags: flags,
			CreatedAt:   time.Now().Format(time.RFC3339),
		}
	}

	session.State.TurnIndex++
	var nextDino DinoProfile
	if session.State.CustomDino {
		nextDino = storyDinoFromState(session.State)
	} else {
		nextDino = dinos()[session.State.TurnIndex%len(dinos())]
		session.State.ActiveDino = nextDino.Code
		session.State.ActiveDinoName = nextDino.Name
		session.State.ActiveDinoSpecies = nextDino.Species
		session.State.ActiveDinoPersonality = nextDino.Personality
	}
	session.State.CardSeed.Dino = nextDino.Species
	session.State.CardSeed.Action = pick([]string{"挥挥小手", "抱着草莓", "数星星", "戴着小帽子"}, session.State.TurnIndex)
	session.State.CardSeed.Object = pick([]string{"彩虹蛋", "草莓篮子", "亮亮星", "月亮毯子"}, session.State.TurnIndex)
	session.State.CardSeed.Color = pick([]string{"蓝色", "黄色", "绿色", "粉色"}, session.State.TurnIndex)

	choiceA := pick([]string{"沿着彩虹桥寻找发光的脚印", "抬头找一找藏在树梢的亮星", "轻轻敲门问问树洞里的朋友", "把刚刚找到的小花送给新朋友"}, session.State.TurnIndex)
	choiceB := pick([]string{"去小河边看看是谁在唱歌", "一起数一数路边的彩色石头", "请咕噜帮忙看看远处的山谷", "给怕冷的恐龙蛋盖上小毯子"}, session.State.TurnIndex+1)
	choiceC := pick([]string{"问问阿呆有没有发现新线索", "唱一首轻轻的歌给森林听", "仔细看看草地上的小脚印", "轻轻抱一抱发光的恐龙蛋"}, session.State.TurnIndex+2)
	session.State.Choices = []string{choiceA, choiceB, choiceC}

	line := storyLine(nextDino.Name, input, session.State)
	expression := pick([]string{"happy", "curious", "gentle", "sleepy"}, session.State.TurnIndex)
	if e.generator != nil {
		generated, err := e.generator.Generate(ctx, StoryGenerationRequest{
			Dino:         nextDino,
			Theme:        findTheme(session.State.Theme),
			State:        session.State,
			Input:        input,
			CreativeSeed: newStoryCreativeSeed(),
			RecentTurns:  session.Turns,
		})
		if err == nil {
			if normalized, normalizeErr := normalizeGeneratedStory(generated, e.guard); normalizeErr == nil {
				line = normalized.Text
				session.State.Choices = normalized.Choices
				expression = normalized.Expression
			} else {
				log.Printf("story provider output fallback: %v", normalizeErr)
			}
		} else {
			log.Printf("story provider fallback: %v", err)
		}
	}
	line, outFlags := e.guard.SafeOutput(line)
	return StoryTurn{
		ID:          newID("turn"),
		SessionID:   session.ID,
		Speaker:     nextDino.Name,
		Role:        "assistant",
		Text:        line,
		Expression:  expression,
		Choices:     session.State.Choices,
		SafetyFlags: outFlags,
		CreatedAt:   time.Now().Format(time.RFC3339),
	}
}

func storyLine(speaker, input string, state StoryState) string {
	clean := strings.TrimSpace(input)
	if clean == "" {
		clean = "我们一起走"
	}
	if utf8.RuneCountInString(clean) > 12 {
		rs := []rune(clean)
		clean = string(rs[:12])
	}
	lines := []string{
		fmt.Sprintf("%s点点头，和我们一起%s。前方的树叶沙沙作响，露出三条铺着彩色石头的小路。接下来走哪一条呢？", speaker, clean),
		fmt.Sprintf("我们刚刚选择了“%s”。%s的远处亮起温柔的星光，一串小脚印一直延伸到瀑布旁边。现在要怎样寻找新线索？", clean, state.Scene),
		fmt.Sprintf("大家慢慢向前走，终于离“%s”更近了一点。草丛里有铃铛声、花香和闪光的小石头，我们先去看看什么？", state.Goal),
		fmt.Sprintf("%s高兴地说：“这个办法真不错！”一只小鸟从树梢飞下来，告诉大家前面还有新的秘密。我们想先做哪件事？", speaker),
	}
	return lines[state.TurnIndex%len(lines)]
}

func findTheme(code string) Theme {
	for _, t := range themes() {
		if t.Code == code {
			return t
		}
	}
	return themes()[0]
}

func pick(items []string, idx int) string {
	return items[idx%len(items)]
}

type MediaService struct {
	httpClient *http.Client
	mediaDir   string
	guard      SafetyGuard
}

func NewMediaService(mediaDir string, guard SafetyGuard) MediaService {
	return MediaService{
		httpClient: &http.Client{Timeout: 90 * time.Second},
		mediaDir:   mediaDir,
		guard:      guard,
	}
}

func (m MediaService) SynthesizeSpeech(ctx context.Context, text, voiceStyle string) ([]byte, string, bool, error) {
	key := os.Getenv("OPENAI_API_KEY")
	if key == "" {
		return nil, "", true, nil
	}
	model := env("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
	voice := env("OPENAI_TTS_VOICE", "nova")
	body := map[string]string{
		"model":           model,
		"voice":           voice,
		"input":           text,
		"response_format": "mp3",
	}
	payload, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, env("OPENAI_BASE_URL", "https://api.openai.com/v1")+"/audio/speech", bytes.NewReader(payload))
	if err != nil {
		return nil, "", false, err
	}
	req.Header.Set("Authorization", "Bearer "+key)
	req.Header.Set("Content-Type", "application/json")
	res, err := m.httpClient.Do(req)
	if err != nil {
		return nil, "", false, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return nil, "", false, fmt.Errorf("tts provider status %d", res.StatusCode)
	}
	audio, err := io.ReadAll(res.Body)
	return audio, "audio/mpeg", false, err
}

func (m MediaService) Transcribe(ctx context.Context, header *multipart.FileHeader) (string, bool, error) {
	key := os.Getenv("OPENAI_API_KEY")
	if key == "" {
		return "", true, nil
	}
	file, err := header.Open()
	if err != nil {
		return "", false, err
	}
	defer file.Close()
	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	part, err := writer.CreateFormFile("file", header.Filename)
	if err != nil {
		return "", false, err
	}
	if _, err := io.Copy(part, file); err != nil {
		return "", false, err
	}
	_ = writer.WriteField("model", env("OPENAI_STT_MODEL", "gpt-4o-transcribe"))
	_ = writer.Close()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, env("OPENAI_BASE_URL", "https://api.openai.com/v1")+"/audio/transcriptions", &buf)
	if err != nil {
		return "", false, err
	}
	req.Header.Set("Authorization", "Bearer "+key)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	res, err := m.httpClient.Do(req)
	if err != nil {
		return "", false, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return "", false, fmt.Errorf("stt provider status %d", res.StatusCode)
	}
	var out struct {
		Text string `json:"text"`
	}
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return "", false, err
	}
	return out.Text, false, nil
}

func (m MediaService) GenerateHatch(ctx context.Context, req HatchRequest) (*Artifact, error) {
	if req.Profile == nil {
		return nil, errors.New("hatch profile is required")
	}
	if imageAPIKey() == "" {
		return nil, errors.New("image provider is not configured")
	}
	provider := strings.TrimSpace(os.Getenv("DINODOO_IMAGE_PROVIDER"))
	if provider != "" && provider != "openai" {
		return nil, fmt.Errorf("unsupported image provider %q", provider)
	}
	imageSkill, err := configuredHatchImageSkill()
	if err != nil {
		return nil, err
	}
	safePrompt, flags := m.guard.SafePrompt(req.Profile.ImagePrompt)
	styledPrompt := buildHatchImagePrompt(safePrompt)
	referencePaths := resolveHatchImageReferencePaths(m.mediaDir, req.ImagePath)
	imageModel := env("OPENAI_IMAGE_MODEL", "gpt-image-2")
	promptJSON, _ := json.Marshal(map[string]interface{}{
		"text":                   req.Prompt,
		"name":                   req.Profile.Name,
		"description":            req.Profile.Description,
		"image_prompt":           safePrompt,
		"generated_image_prompt": styledPrompt,
		"image_skill":            imageSkill,
		"image_style_version":    hatchImageStyleVersion,
		"image_model":            imageModel,
		"style_reference_count":  len(referencePaths),
		"image_name":             req.ImageName,
		"safety_flags":           flags,
		"idempotency_key":        req.IdempotencyKey,
	})
	artifact := &Artifact{
		ID:             newID("art"),
		IdempotencyKey: req.IdempotencyKey,
		Type:           "hatched_dino",
		Title:          req.Profile.Name,
		Prompt:         promptJSON,
		SourceFilePath: req.ImagePath,
		Status:         "ready",
		Provider:       imageSkill,
		CreatedAt:      time.Now().Format(time.RFC3339),
	}
	filename, err := m.generateOpenAIHatchImage(ctx, styledPrompt, referencePaths, artifact.ID)
	if err != nil {
		return nil, err
	}
	artifact.FilePath = filename
	artifact.URL = "/media/" + filename
	return artifact, nil
}

func hatchSeed(prompt string, hasImage bool) CardSeed {
	seed := CardSeed{
		Dino:   "小恐龙",
		Color:  "蓝色",
		Action: "开心地挥手",
		Object: "闪亮恐龙蛋",
	}
	for _, candidate := range []string{"蓝色", "粉色", "绿色", "黄色", "橙色", "紫色"} {
		if strings.Contains(prompt, candidate) {
			seed.Color = candidate
			break
		}
	}
	switch {
	case strings.Contains(prompt, "三角"):
		seed.Dino = "小三角龙"
	case strings.Contains(prompt, "腕龙") || strings.Contains(prompt, "长颈"):
		seed.Dino = "小腕龙"
	case strings.Contains(prompt, "霸王"):
		seed.Dino = "小霸王龙"
	}
	switch {
	case strings.Contains(prompt, "唱歌"):
		seed.Action = "拿着麦克风唱歌"
	case strings.Contains(prompt, "跳舞"):
		seed.Action = "开心地跳舞"
	case strings.Contains(prompt, "飞"):
		seed.Action = "张开小翅膀"
	case strings.Contains(prompt, "长角"):
		seed.Action = "顶着圆圆的小角"
	}
	if hasImage {
		seed.Object = "参考图片里的可爱元素"
	}
	return seed
}

func hatchStyleReferencePaths() []string {
	raw := strings.TrimSpace(os.Getenv("DINODOO_HATCH_STYLE_REFERENCES"))
	if strings.EqualFold(raw, "none") || raw == "-" {
		return nil
	}
	if raw != "" {
		return existingImagePaths(filepath.SplitList(raw))
	}

	assetNames := []string{"homeV2DinoXiaobao.png", "homeV2DinoAdai.png", "homeV2DinoGulu.png"}
	assetRoots := []string{
		filepath.Join("apps", "h5", "assets", "game-elements", "runtime-current"),
		filepath.Join("..", "apps", "h5", "assets", "game-elements", "runtime-current"),
	}
	if executable, err := os.Executable(); err == nil {
		assetRoots = append(assetRoots, filepath.Join(filepath.Dir(executable), "..", "apps", "h5", "assets", "game-elements", "runtime-current"))
	}
	for _, root := range assetRoots {
		paths := make([]string, 0, len(assetNames))
		for _, name := range assetNames {
			paths = append(paths, filepath.Join(root, name))
		}
		if existing := existingImagePaths(paths); len(existing) == len(assetNames) {
			return existing
		}
	}
	return nil
}

func existingImagePaths(paths []string) []string {
	existing := make([]string, 0, len(paths))
	seen := map[string]bool{}
	for _, path := range paths {
		path = strings.TrimSpace(path)
		if path == "" {
			continue
		}
		abs, err := filepath.Abs(path)
		if err != nil || seen[abs] {
			continue
		}
		info, err := os.Stat(abs)
		if err != nil || info.IsDir() {
			continue
		}
		ext := strings.ToLower(filepath.Ext(abs))
		if ext != ".png" && ext != ".jpg" && ext != ".jpeg" && ext != ".webp" {
			continue
		}
		seen[abs] = true
		existing = append(existing, abs)
	}
	return existing
}

func resolveHatchImageReferencePaths(mediaDir, sourcePath string) []string {
	paths := hatchStyleReferencePaths()
	if strings.TrimSpace(sourcePath) != "" {
		paths = append(paths, filepath.Join(mediaDir, filepath.Base(sourcePath)))
	}
	return existingImagePaths(paths)
}

func (m MediaService) generateOpenAIHatchImage(ctx context.Context, prompt string, referencePaths []string, id string) (string, error) {
	if len(referencePaths) == 0 {
		return m.generateOpenAIImage(ctx, prompt, id)
	}

	var buf bytes.Buffer
	writer := multipart.NewWriter(&buf)
	for _, referencePath := range referencePaths {
		source, err := os.Open(referencePath)
		if err != nil {
			return "", err
		}
		part, err := writer.CreateFormFile("image", filepath.Base(referencePath))
		if err == nil {
			_, err = io.Copy(part, source)
		}
		closeErr := source.Close()
		if err != nil {
			return "", err
		}
		if closeErr != nil {
			return "", closeErr
		}
	}
	_ = writer.WriteField("model", env("OPENAI_IMAGE_MODEL", "gpt-image-2"))
	_ = writer.WriteField("prompt", prompt)
	_ = writer.WriteField("size", env("OPENAI_IMAGE_SIZE", "1024x1024"))
	_ = writer.WriteField("quality", env("OPENAI_IMAGE_QUALITY", "high"))
	_ = writer.WriteField("background", env("OPENAI_IMAGE_BACKGROUND", "transparent"))
	_ = writer.WriteField("output_format", "png")
	if err := writer.Close(); err != nil {
		return "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, imageBaseURL()+"/images/edits", &buf)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+imageAPIKey())
	req.Header.Set("Content-Type", writer.FormDataContentType())
	res, err := m.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(res.Body, 512))
		return "", fmt.Errorf("image edit provider status %d: %s", res.StatusCode, string(body))
	}
	var out struct {
		Data []struct {
			B64JSON string `json:"b64_json"`
			URL     string `json:"url"`
		} `json:"data"`
	}
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return "", err
	}
	if len(out.Data) == 0 {
		return "", errors.New("image edit provider returned no data")
	}
	filename := id + ".png"
	full := filepath.Join(m.mediaDir, filename)
	if out.Data[0].B64JSON != "" {
		imageBytes, err := base64.StdEncoding.DecodeString(out.Data[0].B64JSON)
		if err != nil {
			return "", err
		}
		return filename, writeRasterImage(full, imageBytes)
	}
	if out.Data[0].URL == "" {
		return "", errors.New("image edit provider returned no image payload")
	}
	imgReq, err := http.NewRequestWithContext(ctx, http.MethodGet, out.Data[0].URL, nil)
	if err != nil {
		return "", err
	}
	imgRes, err := m.httpClient.Do(imgReq)
	if err != nil {
		return "", err
	}
	defer imgRes.Body.Close()
	if imgRes.StatusCode >= 300 {
		return "", fmt.Errorf("image download status %d", imgRes.StatusCode)
	}
	return filename, writeRasterImageFromReader(full, imgRes.Body)
}
func (m MediaService) GenerateCard(ctx context.Context, session *PlaySession) (*Artifact, error) {
	seed := session.State.CardSeed
	rawPrompt := fmt.Sprintf("%s%s，%s，旁边有%s，竖版儿童恐龙卡片", seed.Color, seed.Dino, seed.Action, seed.Object)
	safePrompt, flags := m.guard.SafePrompt(rawPrompt)
	promptJSON, _ := json.Marshal(map[string]interface{}{
		"seed":        seed,
		"prompt":      safePrompt,
		"safetyFlags": flags,
	})
	artifact := &Artifact{
		ID:        newID("art"),
		SessionID: session.ID,
		Type:      "dino_card",
		Title:     "今日恐龙卡片",
		Prompt:    promptJSON,
		Status:    "ready",
		Provider:  "local-svg",
		CreatedAt: time.Now().Format(time.RFC3339),
	}
	if os.Getenv("OPENAI_API_KEY") != "" && os.Getenv("DINODOO_IMAGE_PROVIDER") == "openai" {
		if filename, err := m.generateOpenAIImage(ctx, safePrompt, artifact.ID); err == nil {
			artifact.FilePath = filename
			artifact.URL = "/media/" + filename
			artifact.Provider = "openai"
			return artifact, nil
		} else {
			log.Printf("image provider fallback: %v", err)
		}
	}
	filename, err := m.generateSVGCard(seed, artifact.ID)
	if err != nil {
		return nil, err
	}
	artifact.FilePath = filename
	artifact.URL = "/media/" + filename
	return artifact, nil
}

func (m MediaService) generateOpenAIImage(ctx context.Context, prompt, id string) (string, error) {
	body := map[string]interface{}{
		"model":         env("OPENAI_IMAGE_MODEL", "gpt-image-2"),
		"prompt":        prompt,
		"size":          env("OPENAI_IMAGE_SIZE", "1024x1024"),
		"quality":       env("OPENAI_IMAGE_QUALITY", "high"),
		"background":    env("OPENAI_IMAGE_BACKGROUND", "transparent"),
		"output_format": "png",
	}
	payload, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, imageBaseURL()+"/images/generations", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+imageAPIKey())
	req.Header.Set("Content-Type", "application/json")
	res, err := m.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		b, _ := io.ReadAll(io.LimitReader(res.Body, 512))
		return "", fmt.Errorf("image provider status %d: %s", res.StatusCode, string(b))
	}
	var out struct {
		Data []struct {
			B64JSON string `json:"b64_json"`
			URL     string `json:"url"`
		} `json:"data"`
	}
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return "", err
	}
	if len(out.Data) == 0 {
		return "", errors.New("image provider returned no data")
	}
	filename := id + ".png"
	full := filepath.Join(m.mediaDir, filename)
	if out.Data[0].B64JSON != "" {
		bytes, err := base64.StdEncoding.DecodeString(out.Data[0].B64JSON)
		if err != nil {
			return "", err
		}
		return filename, writeRasterImage(full, bytes)
	}
	if out.Data[0].URL != "" {
		imgReq, _ := http.NewRequestWithContext(ctx, http.MethodGet, out.Data[0].URL, nil)
		imgRes, err := m.httpClient.Do(imgReq)
		if err != nil {
			return "", err
		}
		defer imgRes.Body.Close()
		if imgRes.StatusCode >= 300 {
			return "", fmt.Errorf("image download status %d", imgRes.StatusCode)
		}
		return filename, writeRasterImageFromReader(full, imgRes.Body)
	}
	return "", errors.New("image provider returned no image payload")
}

func (m MediaService) generateSVGCard(seed CardSeed, id string) (string, error) {
	filename := id + ".svg"
	full := filepath.Join(m.mediaDir, filename)
	card := fmt.Sprintf(`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fee2e2"/>
      <stop offset="0.5" stop-color="#d9f99d"/>
      <stop offset="1" stop-color="#bfdbfe"/>
    </linearGradient>
  </defs>
  <rect width="720" height="960" rx="42" fill="url(#bg)"/>
  <circle cx="560" cy="150" r="70" fill="#fde68a"/>
  <path d="M118 680 C210 540 340 520 500 635" stroke="#22c55e" stroke-width="26" stroke-linecap="round" fill="none"/>
  <ellipse cx="360" cy="466" rx="170" ry="125" fill="#34d399"/>
  <circle cx="480" cy="410" r="88" fill="#34d399"/>
  <circle cx="512" cy="385" r="10" fill="#111827"/>
  <path d="M535 420 q28 18 0 36" stroke="#111827" stroke-width="8" stroke-linecap="round" fill="none"/>
  <path d="M250 350 l-22 -52 l62 28 l22 -58 l34 61 l60 -28 l-24 58" fill="#6ee7b7"/>
  <circle cx="306" cy="598" r="30" fill="#059669"/>
  <circle cx="428" cy="602" r="30" fill="#059669"/>
  <text x="360" y="110" text-anchor="middle" font-size="46" font-family="Arial,'Microsoft YaHei',sans-serif" fill="#14532d" font-weight="700">今日恐龙卡片</text>
  <text x="360" y="780" text-anchor="middle" font-size="38" font-family="Arial,'Microsoft YaHei',sans-serif" fill="#111827">%s%s</text>
  <text x="360" y="835" text-anchor="middle" font-size="32" font-family="Arial,'Microsoft YaHei',sans-serif" fill="#374151">%s，旁边有%s</text>
</svg>`, xmlEscape(seed.Color), xmlEscape(seed.Dino), xmlEscape(seed.Action), xmlEscape(seed.Object))
	return filename, os.WriteFile(full, []byte(card), 0o644)
}

type App struct {
	repo          *Repository
	story         StoryEngine
	media         MediaService
	static        string
	hatchMu       sync.Mutex
	hatchClaims   map[string]bool
	hatchProfile  HatchProfileGenerator
	hatchGenerate func(context.Context, HatchRequest) (*Artifact, error)
}

func main() {
	root, err := findProjectRoot()
	if err != nil {
		log.Fatal(err)
	}
	dataDir := env("DINODOO_DATA_DIR", filepath.Join(root, "data"))
	staticDir := env("DINODOO_H5_DIR", filepath.Join(root, "apps", "h5"))
	repo, err := NewRepository(dataDir)
	if err != nil {
		log.Fatal(err)
	}
	guard := NewSafetyGuard()
	app := &App{
		repo:         repo,
		story:        NewStoryEngine(guard, NewOpenAIStoryGeneratorFromEnv()),
		media:        NewMediaService(repo.mediaDir, guard),
		static:       staticDir,
		hatchClaims:  map[string]bool{},
		hatchProfile: NewOpenAIHatchProfileGeneratorFromEnv(guard),
	}
	app.hatchGenerate = app.media.GenerateHatch
	mux := http.NewServeMux()
	app.routes(mux)
	app.resumeHatchJobs()
	addr := ":" + env("PORT", "8080")
	log.Printf("DinoDoo API listening on http://localhost%s", addr)
	log.Fatal(http.ListenAndServe(addr, logRequest(mux)))
}

func (a *App) routes(mux *http.ServeMux) {
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("GET /ready", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]interface{}{"status": "ready", "store": true})
	})
	mux.Handle("GET /media/", http.StripPrefix("/media/", http.FileServer(http.Dir(a.repo.mediaDir))))
	mux.HandleFunc("GET /api/v1/dinos", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]interface{}{"dinos": dinos()})
	})
	mux.HandleFunc("GET /api/v1/themes", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, map[string]interface{}{"themes": themes()})
	})
	mux.HandleFunc("GET /api/v1/parent/settings", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, a.repo.Settings())
	})
	mux.HandleFunc("PUT /api/v1/parent/settings", a.updateSettings)
	mux.HandleFunc("POST /api/v1/hatches", a.createHatch)
	mux.HandleFunc("GET /api/v1/hatches/{id}", a.getHatchJob)
	mux.HandleFunc("POST /api/v1/play-sessions", a.createSession)
	mux.HandleFunc("GET /api/v1/play-sessions/{id}", a.getSession)
	mux.HandleFunc("POST /api/v1/play-sessions/{id}/turns", a.createTurn)
	mux.HandleFunc("POST /api/v1/play-sessions/{id}/finish", a.finishSession)
	mux.HandleFunc("POST /api/v1/audio/speech", a.speech)
	mux.HandleFunc("POST /api/v1/audio/transcriptions", a.transcribe)
	mux.HandleFunc("GET /api/v1/artifacts", a.listArtifacts)
	mux.HandleFunc("GET /api/v1/artifacts/{id}", a.getArtifact)
	mux.HandleFunc("DELETE /api/v1/artifacts/{id}", a.deleteArtifact)
	mux.Handle("/", http.FileServer(http.Dir(a.static)))
}

const (
	maxHatchUploadBytes  = 8 << 20
	maxHatchRequestBytes = maxHatchUploadBytes + (1 << 20)
	maxHatchPromptRunes  = 200
)

type requestError struct {
	status int
	err    error
}

func (e requestError) Error() string {
	return e.err.Error()
}

func (a *App) createHatch(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxHatchRequestBytes)
	hatchReq, err := parseHatchRequest(r)
	if err != nil {
		status := http.StatusBadRequest
		var reqErr requestError
		if errors.As(err, &reqErr) {
			status = reqErr.status
		}
		writeError(w, status, err)
		return
	}

	if existing, ok := a.repo.HatchJobByIdempotencyKey(hatchReq.IdempotencyKey); ok {
		writeJSON(w, http.StatusAccepted, map[string]interface{}{"job": a.hatchJobResponse(existing), "replayed": true})
		return
	}

	if len(hatchReq.ImageData) > 0 {
		filename, err := saveHatchReference(a.repo.mediaDir, hatchReq.ImageData)
		if err != nil {
			writeError(w, http.StatusInternalServerError, err)
			return
		}
		hatchReq.ImagePath = filename
	}

	job := newHatchJob(hatchReq)
	if err := a.repo.SaveHatchJob(job); err != nil {
		removeMediaFile(a.repo.mediaDir, hatchReq.ImagePath)
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	a.enqueueHatchJob(job.JobID)
	writeJSON(w, http.StatusAccepted, map[string]interface{}{"job": a.hatchJobResponse(job), "replayed": false})
}

func parseHatchRequest(r *http.Request) (HatchRequest, error) {
	var req HatchRequest
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil {
		return req, requestError{status: http.StatusUnsupportedMediaType, err: errors.New("unsupported content type")}
	}

	switch mediaType {
	case "application/json":
		var body struct {
			Prompt         string `json:"prompt"`
			IdempotencyKey string `json:"idempotency_key"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&body); err != nil {
			return req, bodyReadError(err)
		}
		req.Prompt = body.Prompt
		req.IdempotencyKey = body.IdempotencyKey
	case "multipart/form-data":
		if err := r.ParseMultipartForm(maxHatchUploadBytes); err != nil {
			return req, bodyReadError(err)
		}
		if r.MultipartForm != nil {
			defer r.MultipartForm.RemoveAll()
		}
		req.Prompt = r.FormValue("prompt")
		req.IdempotencyKey = r.FormValue("idempotency_key")
		file, header, err := r.FormFile("image")
		if err != nil && !errors.Is(err, http.ErrMissingFile) {
			return req, requestError{status: http.StatusBadRequest, err: errors.New("invalid image upload")}
		}
		if err == nil {
			defer file.Close()
			imageData, err := io.ReadAll(io.LimitReader(file, maxHatchUploadBytes+1))
			if err != nil {
				return req, requestError{status: http.StatusBadRequest, err: errors.New("could not read image")}
			}
			if len(imageData) > maxHatchUploadBytes {
				return req, requestError{status: http.StatusRequestEntityTooLarge, err: errors.New("image exceeds 8 MiB")}
			}
			contentType := http.DetectContentType(imageData)
			if !supportedHatchImageType(contentType) {
				return req, requestError{status: http.StatusUnsupportedMediaType, err: errors.New("image must be PNG, JPEG, WebP, or GIF")}
			}
			req.ImageName = filepath.Base(header.Filename)
			req.ImageData = imageData
		}
	default:
		return req, requestError{status: http.StatusUnsupportedMediaType, err: errors.New("use application/json or multipart/form-data")}
	}

	if headerKey := strings.TrimSpace(r.Header.Get("Idempotency-Key")); req.IdempotencyKey == "" {
		req.IdempotencyKey = headerKey
	}
	req.Prompt = strings.TrimSpace(req.Prompt)
	req.IdempotencyKey = strings.TrimSpace(req.IdempotencyKey)
	if req.IdempotencyKey == "" {
		req.IdempotencyKey = newID("hatch")
	}
	if utf8.RuneCountInString(req.Prompt) > maxHatchPromptRunes {
		return req, requestError{status: http.StatusUnprocessableEntity, err: errors.New("prompt is too long")}
	}
	if len(req.IdempotencyKey) > 128 {
		return req, requestError{status: http.StatusUnprocessableEntity, err: errors.New("idempotency key is too long")}
	}
	return req, nil
}

func bodyReadError(err error) error {
	if strings.Contains(strings.ToLower(err.Error()), "request body too large") {
		return requestError{status: http.StatusRequestEntityTooLarge, err: errors.New("request exceeds upload limit")}
	}
	return requestError{status: http.StatusBadRequest, err: errors.New("invalid request body")}
}

func supportedHatchImageType(contentType string) bool {
	switch contentType {
	case "image/png", "image/jpeg", "image/webp", "image/gif":
		return true
	default:
		return false
	}
}

func saveHatchReference(mediaDir string, data []byte) (string, error) {
	contentType := http.DetectContentType(data)
	extension := map[string]string{
		"image/png":  ".png",
		"image/jpeg": ".jpg",
		"image/webp": ".webp",
		"image/gif":  ".gif",
	}[contentType]
	if extension == "" {
		return "", errors.New("unsupported reference image")
	}
	filename := newID("ref") + extension
	if err := os.WriteFile(filepath.Join(mediaDir, filename), data, 0o644); err != nil {
		return "", err
	}
	return filename, nil
}

func removeMediaFile(mediaDir, filename string) {
	if filename == "" {
		return
	}
	_ = os.Remove(filepath.Join(mediaDir, filepath.Base(filename)))
}
func (a *App) updateSettings(w http.ResponseWriter, r *http.Request) {
	var s Settings
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	if err := a.repo.SaveSettings(s); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, a.repo.Settings())
}

func artifactStoryDescription(artifact *Artifact) string {
	if artifact == nil || len(artifact.Prompt) == 0 {
		return ""
	}
	var payload map[string]interface{}
	if err := json.Unmarshal(artifact.Prompt, &payload); err != nil {
		return ""
	}
	for _, key := range []string{"text", "prompt", "safe_prompt"} {
		if value, ok := payload[key].(string); ok && strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func workDinoProfile(guard SafetyGuard, artifactID, name, description string) DinoProfile {
	name = truncateRunes(strings.TrimSpace(name), 16)
	description = truncateRunes(strings.TrimSpace(description), 80)
	if safe, flags := guard.SafeOutput(name); len(flags) == 0 {
		name = safe
	} else {
		name = "新小恐龙"
	}
	if safe, flags := guard.SafeOutput(description); len(flags) == 0 {
		description = safe
	} else {
		description = "勇敢、好奇、喜欢交朋友"
	}
	return normalizeWorkDino(DinoProfile{
		Code:        "work-" + truncateRunes(strings.TrimSpace(artifactID), 72),
		Name:        name,
		Species:     "小恐龙",
		Personality: description,
		Catchphrase: "一起出发吧！",
		VoiceStyle:  "warm",
	})
}

func (a *App) createSession(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Theme           string `json:"theme"`
		Dino            string `json:"dino"`
		ArtifactID      string `json:"artifact_id"`
		DinoName        string `json:"dino_name"`
		DinoDescription string `json:"dino_description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	var session *PlaySession
	var err error
	if req.ArtifactID != "" || req.DinoName != "" || req.DinoDescription != "" {
		name := req.DinoName
		description := req.DinoDescription
		if req.ArtifactID != "" {
			artifact, ok := a.repo.Artifact(req.ArtifactID)
			if !ok {
				writeError(w, http.StatusNotFound, errors.New("artifact not found"))
				return
			}
			name = artifact.Title
			if persisted := artifactStoryDescription(artifact); persisted != "" {
				description = persisted
			}
		}
		profile := workDinoProfile(a.story.guard, req.ArtifactID, name, description)
		session, err = a.story.StartWithDino(r.Context(), req.Theme, profile, req.ArtifactID)
	} else {
		session, err = a.story.Start(r.Context(), req.Theme, req.Dino)
	}
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	if err := a.repo.SaveSession(session); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusCreated, session)
}

func (a *App) getSession(w http.ResponseWriter, r *http.Request) {
	session, ok := a.repo.Session(r.PathValue("id"))
	if !ok {
		writeError(w, http.StatusNotFound, errors.New("session not found"))
		return
	}
	writeJSON(w, http.StatusOK, session)
}

func (a *App) createTurn(w http.ResponseWriter, r *http.Request) {
	session, ok := a.repo.Session(r.PathValue("id"))
	if !ok {
		writeError(w, http.StatusNotFound, errors.New("session not found"))
		return
	}
	var req struct {
		Input  string `json:"input"`
		Source string `json:"source"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	if session.Status != "active" {
		writeError(w, http.StatusConflict, errors.New("session is not active"))
		return
	}
	userTurn := StoryTurn{
		ID:        newID("turn"),
		SessionID: session.ID,
		Speaker:   "宝宝",
		Role:      "user",
		Text:      strings.TrimSpace(req.Input),
		CreatedAt: time.Now().Format(time.RFC3339),
	}
	session.Turns = append(session.Turns, userTurn)
	assistantTurn := a.story.Next(r.Context(), session, req.Input)
	session.Turns = append(session.Turns, assistantTurn)
	if err := a.repo.SaveSession(session); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"session": session, "turn": assistantTurn})
}

func (a *App) finishSession(w http.ResponseWriter, r *http.Request) {
	session, ok := a.repo.Session(r.PathValue("id"))
	if !ok {
		writeError(w, http.StatusNotFound, errors.New("session not found"))
		return
	}
	if session.Status == "finished" {
		if artifact, ok := a.repo.ArtifactBySessionID(session.ID); ok {
			writeJSON(w, http.StatusOK, map[string]interface{}{"session": session, "artifact": artifact, "replayed": true})
			return
		}
	}
	session.Status = "finished"
	session.EndedAt = time.Now().Format(time.RFC3339)
	artifact, err := a.media.GenerateCard(r.Context(), session)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	if err := a.repo.SaveSession(session); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	if err := a.repo.SaveArtifact(artifact); err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"session": session, "artifact": artifact})
}

func (a *App) speech(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Text       string `json:"text"`
		VoiceStyle string `json:"voice_style"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	audio, contentType, fallback, err := a.media.SynthesizeSpeech(r.Context(), req.Text, req.VoiceStyle)
	if err != nil || fallback {
		if err != nil {
			log.Printf("tts fallback: %v", err)
		}
		w.Header().Set("X-DinoDoo-Speech-Fallback", "browser")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.Header().Set("Content-Type", contentType)
	_, _ = w.Write(audio)
}

func (a *App) transcribe(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(8 << 20); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	_, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	text, fallback, err := a.media.Transcribe(r.Context(), header)
	if err != nil {
		writeError(w, http.StatusBadGateway, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"text": text, "fallback": fallback})
}

func (a *App) listArtifacts(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]interface{}{"artifacts": a.repo.Artifacts()})
}

func (a *App) getArtifact(w http.ResponseWriter, r *http.Request) {
	artifact, ok := a.repo.Artifact(r.PathValue("id"))
	if !ok {
		writeError(w, http.StatusNotFound, errors.New("artifact not found"))
		return
	}
	writeJSON(w, http.StatusOK, artifact)
}

func (a *App) deleteArtifact(w http.ResponseWriter, r *http.Request) {
	if !a.repo.DeleteArtifact(r.PathValue("id")) {
		writeError(w, http.StatusNotFound, errors.New("artifact not found"))
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func writeJSON(w http.ResponseWriter, status int, value interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeError(w http.ResponseWriter, status int, err error) {
	writeJSON(w, status, map[string]interface{}{"error": map[string]string{"message": err.Error()}})
}

func logRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start).Round(time.Millisecond))
	})
}

func newID(prefix string) string {
	var b [6]byte
	_, _ = rand.Read(b[:])
	return fmt.Sprintf("%s_%d_%s", prefix, time.Now().UnixMilli(), base64.RawURLEncoding.EncodeToString(b[:]))
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func findProjectRoot() (string, error) {
	wd, err := os.Getwd()
	if err != nil {
		return "", err
	}
	for {
		if _, err := os.Stat(filepath.Join(wd, "PRODUCT_PLAN.md")); err == nil {
			return wd, nil
		}
		parent := filepath.Dir(wd)
		if parent == wd {
			return "", errors.New("could not find DinoDoo project root")
		}
		wd = parent
	}
}

func xmlEscape(s string) string {
	var b bytes.Buffer
	_ = xml.EscapeText(&b, []byte(s))
	return b.String()
}

func atoi(value string, fallback int) int {
	if value == "" {
		return fallback
	}
	n, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}
	return n
}

var _ = atoi
