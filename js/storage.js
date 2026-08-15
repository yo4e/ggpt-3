const KEY = "ggpt3.state";

function freshSeed() {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return value[0] || 1;
  }
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0 || 1;
}

export function createState() {
  const now = Date.now();
  const seed = freshSeed();
  return {
    version: 3,
    chat: [],
    model: { bigram: {}, trigram: {}, learned: 0, seeded: false },
    memory: { episodes: [], topics: {} },
    world: {
      lastUpdate: now,
      weather: { type: "clear", strength: 0 },
      room: { windowOpen: false, lightOn: false, futonOut: false, clutter: 0 },
      tea: { hasTea: true, temperature: "warm", brewedAt: now - 8 * 60_000 },
      body: { clarity: 0.32, sleepiness: 0.25, coldHands: 0.18, backPain: 0.12 }
    },
    runtime: { seed, rngState: seed, startedAt: now, lastUserAt: 0, lastMonologueAt: 0 }
  };
}

function normalize(value) {
  const base = createState();
  if (!value || value.version !== 3) return base;
  return {
    ...base,
    ...value,
    model: { ...base.model, ...value.model },
    memory: { ...base.memory, ...value.memory },
    world: {
      ...base.world,
      ...value.world,
      weather: { ...base.world.weather, ...value.world?.weather },
      room: { ...base.world.room, ...value.world?.room },
      tea: { ...base.world.tea, ...value.world?.tea },
      body: { ...base.world.body, ...value.world?.body }
    },
    runtime: { ...base.runtime, ...value.runtime }
  };
}

export function loadState() {
  try { return normalize(JSON.parse(localStorage.getItem(KEY))); }
  catch { return createState(); }
}

export function saveState(state) {
  state.chat = state.chat.slice(-120);
  state.memory.episodes = state.memory.episodes.slice(-12);
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { /* private mode / quota: the agent can still live for this session */ }
}

export function clearState() {
  localStorage.removeItem(KEY);
}
