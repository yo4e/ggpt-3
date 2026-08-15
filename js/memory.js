import { keywords } from "./language.js";

export function remember(state, text) {
  const keys = keywords(text);
  const episode = { at: Date.now(), text: text.slice(0, 180), keywords: keys };
  state.memory.episodes.push(episode);
  state.memory.episodes = state.memory.episodes.slice(-12);
  for (const key of keys) state.memory.topics[key] = (state.memory.topics[key] || 0) + 1;

  const entries = Object.entries(state.memory.topics);
  if (entries.length > 80) {
    entries.sort((a, b) => b[1] - a[1]);
    state.memory.topics = Object.fromEntries(entries.slice(0, 60).map(([key, value]) => [key, Math.max(1, value * .96)]));
  }
  return keys;
}

export function familiarTopic(state, keys) {
  return keys
    .map((key) => [key, state.memory.topics[key] || 0])
    .sort((a, b) => b[1] - a[1])
    .find(([, count]) => count >= 3)?.[0] || "";
}
