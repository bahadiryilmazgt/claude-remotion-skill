# Proje kuralları

## Seslendirme (voiceover / narration / TTS) — her zaman ElevenLabs

Bu depoda yapılan her seslendirme ElevenLabs API'si ile üretilir. Kullanıcı açıkça
başka bir yol istemedikçe başka bir TTS kullanılmaz (OpenAI TTS, `say`/`espeak`,
tarayıcı TTS, sentezlenmiş placeholder ses vb. yok).

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
- **Ses/model seçimi:** Sesleri `GET /v1/voices`, modelleri `GET /v1/models` ile
  listele. Türkçe metin için çok dilli bir model seç. Kullanıcı bir ses
  belirttiyse onu kullan; belirtmediyse seçtiğin sesi söyle.
- **Altyazı senkronu:** Kelime senkronlu altyazı gerekiyorsa
  `POST /v1/text-to-speech/{voice_id}/with-timestamps` kullan; dönen
  `alignment` zamanlamasını frame'e çevir (`Math.round(sn * fps)`), sabit frame
  numarası yazma.
- **Dosyalar:** Üretilen sesi Remotion projesinin `public/vo/` klasörüne koy ve
  `staticFile("vo/...")` + `<Audio>` ile bağla. Müzik yatağını VO altında kıs
  (bkz. `remotion-motion-graphics/references/design-rules.md`, Sound design).
- **Doğrulama:** Render'dan önce `ffprobe` ile VO süresini ölç ve kompozisyon
  süresini/sahne zamanlamasını buna göre ayarla.
