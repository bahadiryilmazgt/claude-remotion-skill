# Proje kuralları

## Ev sesi

Tüm seslendirme ve dublaj tek bir sesle yapılır. Kullanıcı açıkça başka bir şey
istemedikçe bu ayarlar değişmez.

- **Ses:** Atakan, `e9a1KJ0kRpwPORrz92UT` (Türkçe, İstanbul aksanı, kütüphane sesi).
- **Model:** `eleven_v4`. Text-to-speech uç noktası modeli reddederse
  `POST /v1/text-to-dialogue` tek input (aynı ses) ile kullanılır.
- **Ses ayarları gönderilmez:** `voice_settings` (stability, similarity, style,
  speed) yok. Ses ElevenLabs'te kayıtlı kendi ayarlarıyla okur. Eski
  varsayılanlar (`eleven_multilingual_v2`, stability 0.85) düz ve robotik Türkçe
  üretiyordu, geri dönülmez.
- **Çıktı:** `mp3_44100_128`.
- **Metin:** Konuşma dilinde, tam cümlelerle yazılır. Ekrandaki slogan
  parçaları ("Peki ya mesajlar?" gibi) olduğu gibi okutulmaz, tonlamayı bozar.
- **Kod:** Tüm çağrılar `examples/scripts/elevenlabs.mjs` üzerinden yapılır
  (`npm run vo -- "<metin>" public/vo/<ad>.mp3` ya da `import { synthesize }`).
  Varsayılanlar yalnızca orada durur; geçersiz kılmak için env:
  `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MODEL_ID`, `ELEVENLABS_OUTPUT_FORMAT`.
- **Kredi:** Aynı metni birden fazla sesle ya da gereksiz yere tekrar üretme.

## Seslendirme (voiceover / narration / TTS) — her zaman ElevenLabs

Bu depoda yapılan her seslendirme ElevenLabs API'si ile üretilir. Kullanıcı açıkça
başka bir yol istemedikçe başka bir TTS kullanılmaz (OpenAI TTS, `edge-tts`,
`say`/`espeak`, tarayıcı TTS, sentezlenmiş placeholder ses vb. yok).

- **Anahtar:** API anahtarı ortamın ağ proxy'sinde saklıdır ve
  `api.elevenlabs.io` isteklerine `xi-api-key` başlığı olarak otomatik eklenir.
  Anahtarı asla koda, `.env` dosyasına, commit'e veya sohbete yazma. Bir SDK/CLI
  anahtar olmadan çalışmıyorsa sahte bir değer ver (ör. `xi-api-key: dummy`);
  proxy gerçek anahtarla değiştirir.
- **Erişim kontrolü:** İşe başlamadan `GET https://api.elevenlabs.io/v1/user`
  ile erişimi ve `subscription.character_count` / `character_limit` kotasını
  kontrol et. 401/403 alırsan anahtarı kullanıcıdan güvenli form
  (`request_credential`, host `api.elevenlabs.io`, başlık `xi-api-key`) ile iste.
- **Kota:** Hesap karakter kotası sınırlı. Metni üretmeden önce kesinleştir,
  aynı metni gereksiz yere yeniden üretme, üretilen dosyaları yeniden kullan.
- **Ses/model seçimi:** Varsayılan her zaman "Ev sesi" bölümündeki ses ve
  modeldir. Başka bir ses ancak kullanıcı açıkça isterse kullanılır.
- **Altyazı senkronu:** Kelime senkronlu altyazı gerekiyorsa
  `POST /v1/text-to-speech/{voice_id}/with-timestamps` kullan (aynı ses ve
  model, `voice_settings` yok); dönen
  `alignment` zamanlamasını frame'e çevir (`Math.round(sn * fps)`), sabit frame
  numarası yazma.
- **Dosyalar:** Üretilen sesi Remotion projesinin `public/vo/` klasörüne koy ve
  `staticFile("vo/...")` + `<Audio>` ile bağla. Müzik yatağını VO altında kıs
  (bkz. `remotion-motion-graphics/references/design-rules.md`, Sound design).
- **Doğrulama:** Render'dan önce `ffprobe` ile VO süresini ölç ve kompozisyon
  süresini/sahne zamanlamasını buna göre ayarla.
