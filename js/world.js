import { chance, clamp, pick, range } from "./core.js";

const STEP_MS = 10 * 60_000;
const PHASES = ["morning", "day", "evening", "night"];

export function phaseAt(date = new Date()) {
  const hour = date.getHours();
  if (hour < 6) return "night";
  if (hour < 11) return "morning";
  if (hour < 18) return "day";
  if (hour < 22) return "evening";
  return "night";
}

function step(state, date) {
  const world = state.world;
  const phase = phaseAt(date);

  if (chance(state, 0.025)) {
    const transitions = {
      clear: ["clear", "clear", "wind", "rain"],
      rain: ["rain", "rain", "clear", "wind"],
      wind: ["wind", "clear", "clear", "rain"]
    };
    world.weather.type = pick(state, transitions[world.weather.type] || transitions.clear);
    world.weather.strength = world.weather.type === "clear" ? 0 : Math.floor(range(state, 1, 3));
  }

  if (phase === "night" && world.room.windowOpen && chance(state, 0.16)) world.room.windowOpen = false;
  if (["morning", "day"].includes(phase) && !world.room.windowOpen && chance(state, 0.035)) world.room.windowOpen = true;
  if (phase === "night" && !world.room.lightOn && chance(state, 0.16)) world.room.lightOn = true;
  if (phase !== "night" && world.room.lightOn && chance(state, 0.12)) world.room.lightOn = false;
  if (phase === "night" && chance(state, 0.08)) world.room.futonOut = true;
  if (phase === "morning" && chance(state, 0.12)) world.room.futonOut = false;
  if (chance(state, 0.05)) world.room.clutter = clamp(world.room.clutter + (chance(state, .5) ? 1 : -1), 0, 4);

  const teaAge = date.getTime() - world.tea.brewedAt;
  if (world.tea.hasTea) {
    world.tea.temperature = teaAge < 8 * 60_000 ? "hot" : teaAge < 24 * 60_000 ? "warm" : "cold";
    if (chance(state, 0.045)) world.tea.hasTea = false;
  } else if (chance(state, 0.03)) {
    world.tea.hasTea = true;
    world.tea.temperature = "hot";
    world.tea.brewedAt = date.getTime();
  }

  const body = world.body;
  const sleepTarget = phase === "night" ? .78 : phase === "morning" ? .28 : .42;
  body.sleepiness = clamp(body.sleepiness + (sleepTarget - body.sleepiness) * .09 + range(state, -.025, .025));
  body.coldHands = clamp(body.coldHands + ((world.weather.type !== "clear" || world.room.windowOpen) ? .025 : -.018));
  body.backPain = clamp(body.backPain + range(state, -.018, .025));
  body.clarity = clamp(body.clarity * .94 + range(state, -.02, .025), .04, .68);
  if (chance(state, .018)) body.clarity = range(state, .72, .94);
}

export function advanceWorld(state, now = Date.now()) {
  const last = Number(state.world.lastUpdate) || now;
  const elapsed = Math.max(0, now - last);
  const steps = Math.min(144, Math.floor(elapsed / STEP_MS));
  for (let i = steps; i > 0; i -= 1) {
    const at = new Date(now - (i - 1) * STEP_MS);
    step(state, at);
  }
  if (!steps && elapsed > 60_000) step(state, new Date(now));
  state.world.lastUpdate = now;
  return state.world;
}

export function worldCue(state) {
  const { weather, room, tea, body } = state.world;
  const phase = phaseAt();
  const cues = [];
  if (weather.type === "rain") cues.push("雨");
  if (weather.type === "wind") cues.push("風");
  if (tea.hasTea && tea.temperature === "cold") cues.push("冷めた茶");
  if (!tea.hasTea) cues.push("空の湯呑");
  if (room.windowOpen) cues.push("開いた窓");
  if (body.coldHands > .62) cues.push("冷たい手");
  if (body.sleepiness > .68) cues.push("眠気");
  if (!cues.length) cues.push(phase === "night" ? "静かな夜" : "静かな和室");
  return cues[0];
}

export function describeWorld(state) {
  const weather = { clear: "晴れ", rain: "雨", wind: "風" }[state.world.weather.type];
  const phase = { morning: "朝", day: "昼", evening: "夕方", night: "夜" }[phaseAt()];
  const tea = !state.world.tea.hasTea ? "湯呑は空" : state.world.tea.temperature === "cold" ? "茶は冷めた" : "茶あり";
  return `小さな和室 · ${phase} · ${weather} · ${tea}`;
}
