# SunExpress B2B eInvoice Data Process Bot

**SunExpress B2B Sistemi** için geliştirilmiş bot, biletlerin fatura verilerini otomatik olarak Excel dosyasına aktarır ve işlemleri hızlandırır. Muhasebe işlemlerini kolaylaştırarak zaman kazandırır.

## Özellikler

- **Fatura Verilerini Çekme:** SunExpress sitesinden fatura verilerini otomatik olarak alır.
- **Excel'e Aktarma:** Gereken muhasebe verilerini düzgün bir şekilde Excel dosyasına aktarır ve **faturalar** klasörüne yerleştirir.

## 🛠️ Gereksinimler

- **Node.js** bilgisayarınızda kurulu olması gerekli. Eğer kurulu değilse, [Node.js'in resmi web sitesinden](https://nodejs.org) yükleyebilirsiniz.

## 📦 Kurulum ve Kullanım Adımları

### 1. B2B Satış Raporlarını İndirin
Öncelikle, **SunExpress B2B sistemine** giriş yaparak satış raporlarını indirin. Raporları Excel formatında indirdiğinizden emin olun.

### 2. Excel Dosyalarını Doğru Klasöre Yerleştirin
İndirilen Excel dosyalarını `excel` adlı klasöre taşıyın. 

### 3. Gerekli Bağımlılıkları Yükleyin

Botu çalıştırmadan önce, proje dizininde terminal veya komut istemcisine girerek gerekli bağımlılıkları yükleyin:

```bash
npm install
```

### 4. Botu Çalıştırma
#### Linux veya macOS

```bash
node bot.js
```

#### Windows

Windows kullanıcıları, `Start.bat` dosyasını çalıştırarak botu başlatabilirler.
