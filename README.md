# SunExpress B2B eInvoice Data Process Bot

Bu bot, **SunExpress B2B Sistemi** için biletlerin fatura verilerini otomatik olarak bir Excel dosyasına aktarır. Bu bot, **Node.js** kullanılarak geliştirilmiştir.

## Özellikler

- **Fatura Verilerini Çekme:** SunExpress sitesinden fatura verilerini otomatik olarak alır.
- **Excel'e Aktarma:** Muhasebe için gerekli verileri excele aktarıp faturalar klasörüne aktarır.

## Gereksinimler

- **Node.js** bilgisayarınızda kurulu olması gerekli. Eğer kurulu değilse, [Node.js'in resmi web sitesinden](https://nodejs.org) yükleyebilirsiniz.

## Kurulum

Projenin kurulumunu aşağıdaki adımlarla gerçekleştirebilirsiniz.

### 1. Bağımlılıkları Yükleme

Öncelikle, proje dizininde terminal veya komut istemcisi açarak gerekli bağımlılıkları yükleyin:

```bash
npm install
```

### 2. Botu Çalıştırma
#### Linux veya macOS

Linux veya macOS sistemlerinde botu çalıştırmak için aşağıdaki komutu kullanabilirsiniz:

```bash
node bot.js
```

#### Windows

Windows işletim sistemi kullanıyorsanız, öncelikle gerekli bağımlılıkları indirdikten sonra `Start.bat` dosyasını çalıştırarak botu başlatabilirsiniz.
