# GGPT-3 — Generative Grandpa Pattern Talker

GGPT-3 is a tiny, serverless conversational agent that tries to feel like **someone who is there**, rather than a miniature general-purpose AI.

It uses no LLM, no API, no login, no backend, and no build step. The whole app runs in the browser and keeps its small world, memory, and language model in `localStorage`.

## Lineage

GGPT-3 is a clean reimplementation of the ideas explored in [GGPT-2.1](https://github.com/yo4e/ggpt), whose archived live version remains at <https://ggpt.pages.dev/>.

GGPT-2.1 is intentionally left untouched as the original work. GGPT-3 keeps its compact spirit while revisiting the implementation.

## Core idea

The agent is split into small layers:

- **world** — time, weather, room, tea, body state
- **memory** — a few recent episodes/topics, with forgetting
- **language** — templates + variable-order Markov generation
- **agent** — perception → internal state → intent → utterance
- **UI** — a minimal chat surface

The world exists outside the language generator. Rain is a state before it becomes a sentence. Tea cools whether or not the user mentions it.

## Design constraints

- static files only
- no server / API / account
- no LLM
- no framework or dependency
- browser-native `Intl.Segmenter` when available, with a tiny fallback
- local persistence and bounded forgetting
- real-time offline catch-up
- deterministic seeded randomness per installation

## Run

Open `index.html` directly, or serve the directory with any static server.

## GitHub Pages

A Pages workflow is included in `.github/workflows/pages.yml`. Enable **Settings → Pages → Source: GitHub Actions** once for the repository, then pushes to `main` deploy automatically.

## Status

Experimental. The goal is not factual correctness or intelligence. The goal is a tiny situated agent with enough continuity and environmental causality to feel present.

Design: 月野テンプレクス / Tsukino Templex
