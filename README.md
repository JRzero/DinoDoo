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

## Optional Provider Configuration

The H5 app works without provider keys by using browser speech fallback and local SVG dino cards.

To enable server-side media providers:

```powershell
$env:OPENAI_API_KEY="..."
$env:DINODOO_IMAGE_PROVIDER="openai"
$env:OPENAI_TTS_MODEL="gpt-4o-mini-tts"
$env:OPENAI_STT_MODEL="gpt-4o-transcribe"
$env:OPENAI_IMAGE_MODEL="gpt-image-1"
scripts\start-local.ps1
```

Provider keys stay on the backend. The H5 app never stores provider credentials.
