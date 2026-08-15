# GGPT-3 Design Notes

## What this is

GGPT-3 is not an attempt to make the smallest possible LLM. It is an experiment in the opposite direction:

> How little language intelligence is required before a persistent, situated agent begins to feel like someone is there?

The implementation deliberately separates **world truth** from **language output**.

```text
real time
   ↓
world state ──→ perception cues
   ↓                 ↓
body state       agent intent
                     ↓
small memory ──→ language layer
                     ↓
                  utterance
```

A rainy day is not generated as prose first. `world.weather.type === "rain"` exists first; a sentence may or may not mention it later.

## Changes from GGPT-2.1

GGPT-2.1 remains archived unchanged at <https://ggpt.pages.dev/> and <https://github.com/yo4e/ggpt>.

GGPT-3 revisits the implementation while keeping the original compact constraints:

- `Intl.Segmenter` for browser-native Japanese tokenization, with fallback
- variable-order Markov generation (bigram + trigram)
- seeded xorshift PRNG persisted per browser installation
- bounded episodic/topic memory instead of unbounded conversational accumulation
- real-time world catch-up after the page has been closed
- world / memory / language / agent layers separated into tiny modules
- spontaneous monologues still come from world state, not from a generic random quote pool

## Non-goals

- factual question answering
- general knowledge
- semantic embeddings
- cloud synchronization
- personal profiling
- long-term autobiographical memory
- making the agent appear more capable than it is

## Why keep Markov generation?

Markov text is not competitive with modern language models. That is precisely why it is useful here. It forces the experiment to ask whether continuity, embodiment, timing, forgetting, and environmental causality can create presence even when language generation is primitive.

## Future experiments

The modules are intentionally small enough to transplant into other environments. A later experiment can put the same agent loop into a 3D world such as Mintwhirl Island, where multiple residents share an external world but have separate perception, memory, trust, goals, and language state.

The interesting threshold is not “the NPC sounds smart.” It is:

> I was only watching, and they started doing something.

Design: 月野テンプレクス / Tsukino Templex
