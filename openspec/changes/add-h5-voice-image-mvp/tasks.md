## 1. Project Structure

- [x] 1.1 Add H5, server, data, and script directories for the simplified DinoDoo workspace.
- [x] 1.2 Add local startup and documentation entry points for running the H5 MVP.

## 2. Backend API

- [x] 2.1 Implement the Go API service with health, ready, static H5 serving, and JSON helpers.
- [x] 2.2 Implement local repository persistence for parent settings, play sessions, story turns, and artifacts.
- [x] 2.3 Implement story engine state, dinosaur profiles, template turn generation, and card seed creation.
- [x] 2.4 Implement child safety guards for input, output, and image prompts.
- [x] 2.5 Implement voice and image media endpoints with server-side provider abstractions and demo fallbacks.

## 3. H5 App

- [x] 3.1 Implement the mobile-first baby play screen with dinosaur speaker, voice controls, and two choices.
- [x] 3.2 Implement parent settings and artifact gallery screens.
- [x] 3.3 Wire the H5 app to backend play-session, turn, finish, audio, and artifact APIs.
- [x] 3.4 Add graceful browser fallbacks for speech recognition and speech synthesis.

## 4. Verification

- [x] 4.1 Run OpenSpec validation after implementation updates.
- [x] 4.2 Run backend compile/static checks.
- [x] 4.3 Start the local H5/API server and verify the core story, voice fallback, and card generation flow.
