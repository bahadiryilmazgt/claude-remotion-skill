// ElevenLabs voiceover — the single source of truth for the house voice.
//
//   node scripts/elevenlabs.mjs "<text>" public/vo/<name>.mp3
//   import { synthesize } from "./elevenlabs.mjs"
//
// House rules (see CLAUDE.md, "Ev sesi"):
// - Voice Atakan, model eleven_v4, output mp3_44100_128.
// - Never send voice_settings (stability, similarity, style, speed). The voice
//   reads with the settings saved on it in ElevenLabs.
// - If the text-to-speech endpoint rejects the model, fall back to
//   text-to-dialogue with a single input in the same voice.
//
// Overrides go through env only: ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL_ID,
// ELEVENLABS_OUTPUT_FORMAT. The key comes from ELEVENLABS_API_KEY; in the cloud
// sandbox the network proxy injects it, so a placeholder is sent instead.
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const VO_DEFAULTS = Object.freeze({
  voiceId: process.env.ELEVENLABS_VOICE_ID || "e9a1KJ0kRpwPORrz92UT", // Atakan (tr, Istanbul)
  modelId: process.env.ELEVENLABS_MODEL_ID || "eleven_v4",
  outputFormat: process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128",
});

const API = "https://api.elevenlabs.io/v1";

function headers() {
  return {
    "Content-Type": "application/json",
    Accept: "audio/mpeg",
    "xi-api-key": process.env.ELEVENLABS_API_KEY || "proxy-injected",
  };
}

async function post(path, body) {
  const res = await fetch(`${API}${path}`, { method: "POST", headers: headers(), body: JSON.stringify(body) });
  const buf = Buffer.from(await res.arrayBuffer());
  return { ok: res.ok, status: res.status, buf };
}

// The model was refused by text-to-speech (not a quota, auth or voice error).
function rejectsModel({ status, buf }) {
  if (status !== 400 && status !== 422) return false;
  return /model/i.test(buf.toString("utf8"));
}

export async function synthesize(text, outPath, { voiceId, modelId, outputFormat } = {}) {
  const voice = voiceId || VO_DEFAULTS.voiceId;
  const model = modelId || VO_DEFAULTS.modelId;
  const format = outputFormat || VO_DEFAULTS.outputFormat;
  const q = `?output_format=${encodeURIComponent(format)}`;

  // No voice_settings on purpose.
  let res = await post(`/text-to-speech/${voice}${q}`, { text, model_id: model });
  let endpoint = "text-to-speech";
  if (!res.ok && rejectsModel(res)) {
    res = await post(`/text-to-dialogue${q}`, { inputs: [{ text, voice_id: voice }], model_id: model });
    endpoint = "text-to-dialogue";
  }
  if (!res.ok) {
    throw new Error(`ElevenLabs ${endpoint} ${res.status}: ${res.buf.toString("utf8").slice(0, 400)}`);
  }
  mkdirSync(dirname(resolve(outPath)), { recursive: true });
  writeFileSync(outPath, res.buf);
  return { outPath, endpoint, voiceId: voice, modelId: model, outputFormat: format, bytes: res.buf.length };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  // Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY is set at startup;
  // without the proxy the request goes out with no key. Re-run once with it on.
  if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
    const r = spawnSync(process.execPath, process.argv.slice(1), {
      stdio: "inherit",
      env: { ...process.env, NODE_USE_ENV_PROXY: "1", NODE_NO_WARNINGS: "1" },
    });
    process.exit(r.status ?? 1);
  }
  const [text, out] = process.argv.slice(2);
  if (!text || !out) {
    console.error('usage: node scripts/elevenlabs.mjs "<text>" public/vo/<name>.mp3');
    process.exit(2);
  }
  const info = await synthesize(text, out);
  console.log(JSON.stringify(info));
}
