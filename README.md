# 🎁 Fake Nitro Proof

Discord üzerinde gerçekçi Nitro hediye ekran görüntüsü oluşturan bir bot.

---

## ✨ Özellikler

- `/proof` komutu ile modal açılır
- İki kullanıcının ID'si, mesajları ve nitro türü girilir
- Puppeteer ile gerçekçi Discord arayüzü render edilir
- Screenshot alınarak Component v2 ile gönderilir
- Sadece bot sahibi kullanabilir (`ownerId`)

---

## 📋 Gereksinimler

- [Node.js](https://nodejs.org) v18+
- [npm](https://npmjs.com)

---

## 🚀 Kurulum

**1. Repoyu klonla**
```bash
git clone https://github.com/nowdizzyDev/fake-nitro-proof
cd fake-nitro-proof
```

**2. Paketleri yükle**
```bash
npm install
```

**3. Chrome'u indir** *(ilk kurulumda tek seferlik, ~160MB)*
```bash
npx puppeteer browsers install chrome
```

**4. `config.json` dosyasını doldur**
```json
{
  "token": "BOT_TOKEN",
  "clientId": "BOT_CLIENT_ID",
  "guildId": "SUNUCU_ID",
  "ownerId": "OWNER_ID",
  "presence": "Nitro Proof Generator"
}
```

| Alan | Açıklama |
|------|----------|
| `token` | [Discord Developer Portal](https://discord.com/developers/applications) → Bot → Token |
| `clientId` | General Information → Application ID |
| `guildId` | Sunucuya sağ tıkla → Copy Server ID |
| `ownerId` | Kendi Discord ID'n |
| `presence` | Botun durum yazısı |

**5. Slash komutu kaydet**
```bash
node deploy-commands.js
```

**6. Botu başlat**
```bash
node .
```

---

## 🎮 Kullanım

Discord'da `/proof` yaz → Modal açılır:

| Alan | Açıklama |
|------|----------|
| 1. Kullanıcı ID | Nitroyu gönderen kişinin ID'si (boş = kendin) |
| 2. Kullanıcı ID | Nitroyu alan kişinin ID'si (boş = rastgele) |
| Nitro Türü | `1 month`, `3 months`, `1 year` (varsayılan: `1 month`) |
| 1. Kullanıcı Mesajı | Gönderenin mesajı (boş bırakılabilir) |
| 2. Kullanıcı Mesajı | Alanın mesajı (zorunlu) |

Modal doldurulduktan sonra bot screenshot alır ve Component v2 ile yanıt verir.

---

## ⚙️ emoji.json

Botun kullandığı emojileri özelleştirebilirsin:

```json
{
  "success": "✅",
  "error": "❌",
  "noPerms": "🚫"
}
```

---

## 📁 Dosya Yapısı

```
fake-nitro-proof/
├── assets/
│   ├── nitroproof.html          # Proof HTML şablonu
│   └── nitro_banner_cropped_2.png  # Sağ banner görseli
├── index.js                     # Ana bot dosyası
├── deploy-commands.js           # Slash komut kaydı
├── config.json                  # Bot ayarları (gitignore'da)
├── emoji.json                   # Emoji ayarları
└── package.json
```

---

## 📝 Notlar

- `config.json` gizli tutulur, GitHub'a pushlanmaz
- Bot sadece `ownerId`'de tanımlı kullanıcı tarafından kullanılabilir
- Chrome ilk kurulumda otomatik indirilir

---

<div align="center">
  Made by <a href="https://github.com/nowdizzyDev">nowdizzyDev</a>
</div>
