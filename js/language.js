import { pick, weightedPick } from "./core.js";

const BOS = "<BOS>";
const EOS = "<EOS>";
const SEP = "\u241f";
const PUNCT = new Set(["。", "！", "？", "!", "?", "、", "…"]);
const STOP = new Set(["これ", "それ", "あれ", "ここ", "そこ", "こと", "もの", "よう", "そう", "です", "ます"]);

let segmenter = null;
try { segmenter = new Intl.Segmenter("ja", { granularity: "word" }); } catch { /* fallback below */ }

export function tokenize(text) {
  if (segmenter) {
    const out = [];
    for (const item of segmenter.segment(text.normalize("NFKC"))) {
      const value = item.segment.trim();
      if (!value) continue;
      if (item.isWordLike || /[。！？!?、…]/.test(value)) out.push(value);
    }
    return out;
  }
  return text.normalize("NFKC").match(/[一-龯々]+|[ぁ-んー]+|[ァ-ヶー]+|[A-Za-z0-9]+|[。！？!?、…]/g) || [];
}

function bump(map, key, next) {
  map[key] ||= {};
  map[key][next] = (map[key][next] || 0) + 1;
}

export function learn(model, text, weight = 1) {
  const tokens = tokenize(text).slice(0, 80);
  if (!tokens.length) return;
  const seq = [BOS, BOS, ...tokens, EOS];
  for (let w = 0; w < weight; w += 1) {
    for (let i = 1; i < seq.length - 1; i += 1) {
      bump(model.bigram, seq[i], seq[i + 1]);
      bump(model.trigram, `${seq[i - 1]}${SEP}${seq[i]}`, seq[i + 1]);
    }
  }
  model.learned += 1;
}

export function seedModel(state) {
  if (state.model.seeded) return;
  const seeds = [
    "そうかのう。", "なるほどのう。", "まあ、そういう日もある。", "よう分からんが、聞いとるよ。",
    "昔はなあ、こうして茶を飲んだもんじゃ。", "雨の音は悪くないのう。", "風が少し入ってきた。",
    "茶が冷めてしもうた。", "わしも少し眠くなってきた。", "それは気になる話じゃのう。",
    "うむ、もう少し考えてみるか。", "たぶん、そういうことなんじゃろな。", "それでええんじゃないかの。"
  ];
  seeds.forEach((line) => learn(state.model, line, 4));
  state.model.seeded = true;
}

export function keywords(text) {
  return tokenize(text)
    .filter((token) => token.length >= 2 && !PUNCT.has(token) && !STOP.has(token) && !/^[ぁ-んー]{1,2}$/.test(token))
    .sort((a, b) => b.length - a.length)
    .slice(0, 4);
}

function choicesFor(model, a, b) {
  return model.trigram[`${a}${SEP}${b}`] || model.bigram[b] || null;
}

export function generateMarkov(state, cueTokens = []) {
  const model = state.model;
  let a = BOS;
  let b = BOS;
  const usableCues = cueTokens.filter((cue) => model.bigram[cue]);
  if (usableCues.length) {
    b = pick(state, usableCues);
    a = BOS;
  }

  const out = b === BOS ? [] : [b];
  for (let i = 0; i < 22; i += 1) {
    const choices = choicesFor(model, a, b);
    if (!choices) break;
    const entries = Object.entries(choices).map(([token, count]) => {
      let weight = count;
      if (token === out.at(-1)) weight *= .35;
      if (PUNCT.has(token) && out.length < 3) weight *= .2;
      return [token, weight];
    });
    const next = weightedPick(state, entries);
    if (!next || next === EOS) break;
    out.push(next);
    if (["。", "！", "？", "!", "?"].includes(next) && out.length >= 4) break;
    a = b;
    b = next;
  }
  return join(out);
}

function join(tokens) {
  let text = "";
  for (const token of tokens) {
    if (PUNCT.has(token)) text += token;
    else text += token;
  }
  return text.trim();
}
