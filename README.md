# 恐龙咚咚岛

恐龙咚咚岛 is a mobile-first H5 dinosaur theater MVP for young children. It follows the OpenSpec change `add-h5-voice-image-mvp`.

## Run Locally

```powershell
scripts\start-local.ps1
```

Then open:

```text
http://localhost:8080
```

Pixel QA states can be opened directly with:

```text
http://localhost:8080/#home
http://localhost:8080/#story
http://localhost:8080/#hatch
http://localhost:8080/#works
http://localhost:8080/#parent
```

Run all non-browser checks with:

```powershell
.\scripts\run-h5-static-checks.ps1
```

After Playwright use is explicitly approved for Product Design QA, browser captures can be generated with:

```powershell
node scripts\capture-h5-pixel-playwright.mjs
```

The script writes `qa/browser/comparison.png`, `qa/browser/comparison.html`, and per-screen screenshots for the five QA states.

Then verify the capture evidence with:

```powershell
.\scripts\verify-h5-browser-captures.ps1
.\scripts\compare-h5-browser-captures.ps1
```

The diff step writes `qa/browser/diff-report.json`, `qa/browser/diff-summary.html`, and per-screen diff PNGs.

See `qa\README.md` for the full pixel QA evidence and pass criteria.

## Backend API

The H5 and API are served from the same Go process. Core routes:

- `POST /api/v1/hatches`: hatch from JSON (`prompt`, `idempotency_key`) or multipart form data with an optional `image`.
- `GET /api/v1/artifacts`: list persisted works.
- `DELETE /api/v1/artifacts/{id}`: delete a work and its owned media.
- `POST /api/v1/play-sessions`, `/turns`, and `/finish`: run the bounded story flow.
- `POST /api/v1/audio/transcriptions`: server-side speech-to-text.
- `POST /api/v1/audio/speech`: server-side text-to-speech, with browser fallback signaled by `204`.
- `GET /health` and `GET /ready`: liveness and storage readiness.

Text-only hatch example:

```powershell
$body = @{
  prompt = "蓝色会唱歌的小三角龙"
  idempotency_key = "demo-hatch-1"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri http://localhost:8080/api/v1/hatches `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

Without provider configuration, hatch and story-finish requests create local SVG artifacts. Request retries with the same idempotency key return the existing hatch result.

## Optional Provider Configuration

The H5 app works without provider keys by using deterministic child-safe story turns, hatch speech fallback, and local SVG dino cards.

To enable server-side media providers:

```powershell
$env:OPENAI_API_KEY="..."
$env:OPENAI_BASE_URL="https://agentllm.linkyun.co/v1"
$env:OPENAI_STORY_MODEL="mimo-v2.5-pro"
$env:OPENAI_STORY_TIMEOUT_SECONDS="30"
$env:DINODOO_IMAGE_PROVIDER="openai"
$env:OPENAI_TTS_MODEL="gpt-4o-mini-tts"
$env:OPENAI_STT_MODEL="gpt-4o-transcribe"
$env:OPENAI_IMAGE_MODEL="gpt-image-1"
scripts\start-local.ps1
```

Provider keys stay on the backend. The H5 app never stores provider credentials. `scripts/start-local.ps1` also loads an ignored `.env.local` file from the repository root for local-only provider configuration.

When OPENAI_API_KEY is configured, the initial story question and each next turn are generated from the selected dinosaur, story goal, current choice, and the six most recent turns. The backend accepts only short safe text with exactly three distinct choices; malformed, unsafe, or timed-out responses fall back to the deterministic local story engine.
