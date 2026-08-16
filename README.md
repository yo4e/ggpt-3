# GGPT-3 — Generative Grandpa Pattern Talker

[日本語](#日本語) / [English](#english)

Live: https://yo4e.github.io/ggpt-3/

## 日本語

GGPT-3は、汎用AIの小型版を目指すのではなく、**「誰かがそこにいる」と感じられるか**を試す、極小・サーバレスの会話エージェントです。

LLM、API、ログイン、バックエンド、ビルド工程は使いません。すべてブラウザ内で動作し、小さな世界、記憶、言語モデルを `localStorage` に保存します。

### 系譜

GGPT-3は、[GGPT-2.1](https://github.com/yo4e/ggpt) で試した発想を、コンパクトさを保ったまま再設計・再実装したものです。

GGPT-2.1は当時の作品としてそのまま保存しており、公開版も <https://ggpt.pages.dev/> に残しています。

### 核となる考え方

エージェントを小さな層に分けています。

- **world** — 時間、天気、部屋、茶、身体状態
- **memory** — 少数の最近の出来事・話題と忘却
- **language** — テンプレート + 可変長Markov生成
- **agent** — 知覚 → 内部状態 → 意図 → 発話
- **UI** — 最小限のチャット画面

重要なのは、**世界が言語生成の外側に存在すること**です。

「雨」という文章が先に生成されるのではなく、まず世界に雨が降っている。茶はユーザーが話題にしなくても冷める。その外在する状態を爺が知覚し、ときどき発話へ持ち込みます。

### 設計上の制約

- 静的ファイルのみ
- サーバ / API / アカウント不要
- LLMなし
- フレームワーク・依存ライブラリなし
- 利用可能ならブラウザ標準の `Intl.Segmenter` で日本語を分割
- ローカル保存と有限の忘却
- ページを閉じていた時間も考慮したworld stateの追従
- ブラウザごとに永続するseeded乱数

### GGPT-3で試していること

GGPT-3の目的は、事実に正しく答えることでも、高い知能を持つことでもありません。

知能がごく小さくても、時間、身体、環境、記憶、忘却、偶然性があれば、存在感は生まれるのか。その最小条件を探る実験です。

将来的には、この仕組みを複数の身体を持つ住民へ移植し、3D空間などで「人間が何もしなくても住民同士で何かが起きる」小さな人工世界へ発展させることも想定しています。

### ローカルで動かす

`index.html` を直接開くか、任意の静的Webサーバでこのディレクトリを配信してください。

### GitHub Pages

`.github/workflows/pages.yml` から `main` へのpushごとにGitHub Pagesへ自動デプロイします。

### Status

Experimental.

目標は「賢いNPC」ではなく、**継続性と環境的な因果によって、そこにいるように感じられる極小のsituated agent**です。

Design: 月野テンプレクス / Tsukino Templex

---

## English

GGPT-3 is a tiny, serverless conversational agent that tries to feel like **someone who is there**, rather than a miniature general-purpose AI.

It uses no LLM, no API, no login, no backend, and no build step. The whole app runs in the browser and keeps its small world, memory, and language model in `localStorage`.

### Lineage

GGPT-3 is a clean reimplementation of the ideas explored in [GGPT-2.1](https://github.com/yo4e/ggpt), whose archived live version remains at <https://ggpt.pages.dev/>.

GGPT-2.1 is intentionally left untouched as the original work. GGPT-3 keeps its compact spirit while revisiting the implementation.

### Core idea

The agent is split into small layers:

- **world** — time, weather, room, tea, body state
- **memory** — a few recent episodes/topics, with forgetting
- **language** — templates + variable-order Markov generation
- **agent** — perception → internal state → intent → utterance
- **UI** — a minimal chat surface

The world exists outside the language generator. Rain is a state before it becomes a sentence. Tea cools whether or not the user mentions it.

### Design constraints

- static files only
- no server / API / account
- no LLM
- no framework or dependency
- browser-native `Intl.Segmenter` when available, with a tiny fallback
- local persistence and bounded forgetting
- real-time offline catch-up
- deterministic seeded randomness per installation

### What GGPT-3 explores

The goal is not factual correctness or intelligence. GGPT-3 asks how little language intelligence is needed for continuity, embodiment, memory, forgetting, timing, and environmental causality to create a sense of presence.

The same compact agent loop is intended to be portable to future multi-resident environments, including small 3D artificial worlds in which things can happen between inhabitants even when the human does nothing.

### Run locally

Open `index.html` directly, or serve the directory with any static server.

### GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys pushes to `main` automatically.

### Status

Experimental. The goal is a tiny situated agent with enough continuity and environmental causality to feel present.

Design: 月野テンプレクス / Tsukino Templex
