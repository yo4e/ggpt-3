import { chance, pick } from "./core.js";
import { advanceWorld, worldCue } from "./world.js";
import { generateMarkov, keywords, learn, seedModel } from "./language.js";
import { familiarTopic, remember } from "./memory.js";

const T = {
  greeting: ["おう、来たかの。", "おはようさん。", "うむ、ここにおるよ。", "おや、今日はどうした。"],
  nod: ["そうかのう。", "なるほどなあ。", "うむ、聞いとるよ。", "そういうこともあるもんじゃ。"],
  question: ["うーむ、どうじゃろな。", "わしには断言できんが、気になる話じゃのう。", "たぶん一つには決まらん話じゃな。"],
  negative: ["それはちょっとしんどいのう。", "うむ、嫌になることもあるわな。", "そうか。それは参ったのう。"],
  familiar: ["その話、前にも少し聞いた気がするのう。", "またその話じゃな。なんとなく覚えとる。"],
  ask: ["もう少し聞かせてくれるかの。", "それで、そのあとどうなった。", "そこがちょっと気になるのう。"]
};

function isGreeting(text) { return /^(おは|こんにちは|こんばんは|やあ|ただいま|おーい)/.test(text.trim()); }
function isQuestion(text) { return /[？?]$/.test(text.trim()) || /(かな|かね|の？|ですか|ますか)/.test(text); }
function isNegative(text) { return /(つら|しんど|嫌|いや|だめ|無理|疲れ|かなしい|悲し|困っ)/.test(text); }

function environmentLine(state) {
  const cue = worldCue(state);
  const table = {
    "雨": ["……雨の音がしとる。", "雨じゃのう。窓の外が静かじゃ。"],
    "風": ["風が入ってきたのう。", "今日は風の音がする。"],
    "冷めた茶": ["いかん、茶が冷めた。", "話しとるうちに茶が冷めてしもうた。"],
    "空の湯呑": ["茶がなくなったのう。", "あとで茶を淹れるか。"],
    "開いた窓": ["窓を開けたままじゃった。", "外の空気が入ってくるのう。"],
    "冷たい手": ["手が冷えるのう。", "ちょっと手が冷たくなってきた。"],
    "眠気": ["わしもちょっと眠い。", "眠気がきたのう。"],
    "静かな夜": ["今夜は静かじゃのう。"],
    "静かな和室": ["今日は妙に静かじゃ。"]
  };
  return pick(state, table[cue] || ["うむ。"]);
}

export function initializeAgent(state) {
  seedModel(state);
  advanceWorld(state);
}

export function reply(state, userText) {
  advanceWorld(state);
  const keys = keywords(userText);
  const familiar = familiarTopic(state, keys);
  learn(state.model, userText, 1);
  remember(state, userText);
  state.runtime.lastUserAt = Date.now();

  let main = "";
  if (isGreeting(userText)) main = pick(state, T.greeting);
  else if (isNegative(userText)) main = pick(state, T.negative);
  else if (familiar && chance(state, .42)) main = pick(state, T.familiar);
  else if (isQuestion(userText)) main = pick(state, T.question);
  else if (state.model.learned > 12 && chance(state, .27)) main = generateMarkov(state, keys) || pick(state, T.nod);
  else main = pick(state, T.nod);

  if (!isQuestion(userText) && userText.length > 8 && chance(state, .18)) main += ` ${pick(state, T.ask)}`;
  if (chance(state, .22)) main = `${environmentLine(state)} ${main}`;
  if (state.world.body.clarity > .72 && keys[0] && chance(state, .45)) {
    main += ` 「${keys[0]}」ってのは、案外あとから効いてくる話かもしれんな。`;
  }
  return main.replace(/\s+/g, " ").trim();
}

export function maybeMonologue(state) {
  advanceWorld(state);
  const now = Date.now();
  const sinceUser = now - state.runtime.lastUserAt;
  const sinceMonologue = now - state.runtime.lastMonologueAt;

  // Keep a short conversational pause, but make the resident noticeably present.
  if (sinceUser < 15_000) return "";
  if (sinceMonologue < 45_000) return "";

  // Usually speak when checked; after 90 seconds of user silence, almost always speak.
  const probability = sinceUser >= 90_000 ? .95 : .70;
  if (!chance(state, probability)) return "";

  state.runtime.lastMonologueAt = now;
  return environmentLine(state);
}
