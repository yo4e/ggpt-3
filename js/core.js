export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function random(state) {
  let x = state.runtime.rngState >>> 0;
  if (!x) x = 0x6d2b79f5;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  state.runtime.rngState = x >>> 0;
  return (state.runtime.rngState >>> 0) / 4294967296;
}

export const chance = (state, probability) => random(state) < probability;
export const range = (state, min, max) => min + random(state) * (max - min);
export const pick = (state, values) => values[Math.floor(random(state) * values.length)] ?? values[0];

export function weightedPick(state, entries) {
  const usable = entries.filter(([, weight]) => weight > 0);
  const total = usable.reduce((sum, [, weight]) => sum + weight, 0);
  if (!total) return null;
  let cursor = random(state) * total;
  for (const [value, weight] of usable) {
    cursor -= weight;
    if (cursor <= 0) return value;
  }
  return usable.at(-1)?.[0] ?? null;
}
