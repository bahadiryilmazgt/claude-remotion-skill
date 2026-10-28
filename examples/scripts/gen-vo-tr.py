"""Turkish voiceover for CplReel via Microsoft Edge neural TTS (edge-tts).

One clip per phrase so the composition places each line exactly on its beat.
Marketing terms are spelled phonetically so the Turkish voice says them the
way a marketer would: "si pi el" (CPL), "lid" (lead), "yuro" (euro).

  pip install edge-tts && python3 scripts/gen-vo-tr.py
Writes public/vo/<id>.wav (silence-trimmed) and public/vo/lines.json.
"""
import asyncio, json, os, ssl, subprocess, sys

import edge_tts
import edge_tts.communicate as communicate

# behind a TLS-inspecting proxy, trust its CA instead of certifi's bundle
if os.environ.get("TTS_CA_BUNDLE"):
    communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ["TTS_CA_BUNDLE"])

VOICE = "tr-TR-EmelNeural"
RATE, PITCH = "+16%", "+4Hz"  # lively social-media delivery, not documentary pace
FAST = {"c1", "c2", "c3", "end"}  # the payoff runs hotter so the outro lands by 30s
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "vo")

LINES = {
    "hook1": "Düşük si pi el, başarılı reklam mı demek?",
    "hook2": "Her zaman değil!",
    "a1": "Bir kampanya, on yuroya yüz lid getiriyor.",
    "a2": "Harika, değil mi?",
    "a3": "Ama sadece iki satış!",
    "b1": "Diğer kampanyada si pi el, on sekiz yuro! Daha az lid getiriyor,",
    "b2": "ama tam sekiz satış yapıyor!",
    "b3": "Dört kat daha fazla!",
    "c1": "Önemli olan; lid kalitesi, satış oranı ve gerçek müşteri maliyeti.",
    "c2": "Si pi el, sadece başlangıç.",
    "c3": "Asıl soru: bu lidler satışa dönüşüyor mu?",
    "end": "Reklam performansını lid ile değil, sonuçla ölç!",
}


async def synth(key, text):
    mp3 = os.path.join(OUT, f"{key}.mp3")
    wav = os.path.join(OUT, f"{key}.wav")
    com = edge_tts.Communicate(text, VOICE, rate="+22%" if key in FAST else RATE, pitch=PITCH)
    with open(mp3, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
    # trim leading/trailing silence, keep a 40ms pad
    af = ("silenceremove=start_periods=1:start_threshold=-45dB,"
          "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
          "adelay=40,apad=pad_dur=0.04")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-af", af,
                    "-ar", "48000", "-ac", "1", wav], check=True)
    os.remove(mp3)
    dur = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", wav]).decode())
    return key, round(dur, 3)


async def main():
    os.makedirs(OUT, exist_ok=True)
    keys = sys.argv[1:] or list(LINES)
    durs = {}
    path = os.path.join(OUT, "lines.json")
    if os.path.exists(path):
        durs = json.load(open(path))
    for k in keys:
        key, d = await synth(k, LINES[k])
        durs[key] = d
        print(f"{key:6s} {d:5.2f}s  {LINES[key]}")
    json.dump(durs, open(path, "w"), indent=1)


asyncio.run(main())
