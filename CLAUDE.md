# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Harper Super sMath!" — a single-page arithmetic flashcard game for a child, built as plain static HTML/CSS/JS with no framework, no build step, and no backend. Deployed as a static site (see `CNAME`, pointing to `fli.ink`, implying GitHub Pages).

## Running locally

There is no build/install step. Serve the directory with any static file server and open it in a browser, e.g.:

```
python -m http.server 8000
```

then visit `http://localhost:8000`. There are no automated tests, linting, or build commands in this repo — verification is manual (click through the quiz in a browser).

## Architecture

Three files make up the entire app:

- `index.html` — page shell/DOM: session counter, theme buttons, question card, parent-reset link.
- `app.js` — all logic, in one file:
  - **State**: a single `session = { current, correct }` object persisted to `localStorage` under the key `"session"`. This is the only persistence layer; there is no database or server.
  - **Problem generation**: `newProblem()` picks a random operation (+, −, ×, ÷) and generates operands; `renderAnswers()` builds 4 multiple-choice buttons (1 correct + distractors near the correct value).
  - **Session flow**: each answer increments `session.current` (and `session.correct` if right) and writes back to `localStorage`. After `SESSION_SIZE` (100) questions, `endSession()` locks the quiz and shows a summary + "Parent Reset" panel.
  - **Parent gate**: the `PARENTS` array (name/PIN pairs) at the top of `app.js` is checked client-side in the reset panel to allow starting a new session. This is a plaintext, client-visible speed bump for a child — not real access control. Do not treat it as a security boundary, and don't add sensitive data near it.
- `style.css` — plain CSS, no preprocessor.
- `sounds/` — currently empty; no audio is wired up in `app.js` yet despite the directory existing.

## Working conventions

- Keep the no-build-step, single-file-per-concern structure — don't introduce bundlers/frameworks unless explicitly asked.
- `SESSION_SIZE` and the `PARENTS` list live as constants at the top of `app.js`; change them there rather than hardcoding values elsewhere.
