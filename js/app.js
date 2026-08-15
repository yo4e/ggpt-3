import { chance, range } from "./core.js";
import { clearState, loadState, saveState } from "./storage.js";
import { describeWorld, advanceWorld } from "./world.js";
import { initializeAgent, maybeMonologue, reply } from "./agent.js";

const state = loadState();
initializeAgent(state);
saveState(state);

const chat = document.querySelector("#chat");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#message-input");
const typing = document.querySelector("#typing");
const reset = document.querySelector("#reset-button");
const status = document.querySelector("#world-status");
const send = form.querySelector("button[type=submit]");

function updateStatus() {
  advanceWorld(state);
  status.textContent = describeWorld(state);
}

function bubble(message) {
  const node = document.createElement("div");
  node.className = `message ${message.role}${message.monologue ? " monologue" : ""}`;
  node.textContent = message.text;
  chat.appendChild(node);
}

function render() {
  chat.innerHTML = "";
  state.chat.forEach(bubble);
  chat.scrollTop = chat.scrollHeight;
  updateStatus();
}

function append(role, text, monologue = false) {
  const message = { role, text, monologue, at: Date.now() };
  state.chat.push(message);
  state.chat = state.chat.slice(-120);
  bubble(message);
  chat.scrollTop = chat.scrollHeight;
  saveState(state);
  updateStatus();
}

function resizeInput() {
  input.style.height = "auto";
  input.style.height = `${Math.min(140, input.scrollHeight)}px`;
}

if (!state.chat.length) {
  append("ai", "おや。はじめまして……だったかの。爺ぴーてぃーじゃ。ここで茶を飲んどるよ。");
} else {
  render();
}

input.addEventListener("input", resizeInput);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  append("user", text);
  input.value = "";
  resizeInput();
  input.disabled = true;
  send.disabled = true;
  typing.hidden = false;

  const answer = reply(state, text);
  saveState(state);
  const delay = Math.round(range(state, 520, 1250) + Math.min(answer.length * 14, 800));
  await new Promise((resolve) => setTimeout(resolve, delay));

  typing.hidden = true;
  input.disabled = false;
  send.disabled = false;
  append("ai", answer);
  input.focus();
});

reset.addEventListener("click", () => {
  if (!confirm("このブラウザにいる爺の会話・学習・世界状態を全部消します。よいですか？")) return;
  clearState();
  location.reload();
});

function scheduleMonologue() {
  const wait = 55_000 + Math.random() * 45_000;
  setTimeout(() => {
    if (!document.hidden && !input.disabled) {
      const line = maybeMonologue(state);
      if (line) append("ai", line, true);
      saveState(state);
      updateStatus();
    }
    scheduleMonologue();
  }, wait);
}

window.addEventListener("focus", updateStatus);
document.addEventListener("visibilitychange", () => { if (!document.hidden) updateStatus(); });
scheduleMonologue();
input.focus();
