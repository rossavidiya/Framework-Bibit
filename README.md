# Framework-Bibit

Proyek ini adalah framework automation testing yang dibangun menggunakan **Playwright** dan **Node.js**. Dokumentasi ini akan membantu Anda melakukan setup awal dan menjalankan pengujian di komputer lokal Anda.

---

## Prasyarat & Kebutuhan Aplikasi

Sebelum menjalankan proyek, pastikan Anda sudah menginstal aplikasi berikut:

1. **Node.js** – Runtime JavaScript yang digunakan untuk menjalankan Playwright.
2. **Visual Studio Code (VS Code)** – Code editor yang direkomendasikan.

---

## Setup & Instalasi Proyek

Ikuti langkah-langkah berikut untuk menyiapkan proyek di komputer Anda:

### 1. Clone Repositori
Buka Terminal/Command Prompt (CMD) Anda, lalu jalankan perintah berikut:
```bash
git clone [https://github.com/rossavidiya/Framework-Bibit.git](https://github.com/rossavidiya/Framework-Bibit.git)
cd Framework-Bibit

2. Instal Dependencies (Node Modules)
Instal semua library yang dibutuhkan proyek ini dengan perintah:
npm install

3. Instal Playwright Browsers
Pastikan browser biner bawaan Playwright terinstal sempurna di sistem Anda melalui CMD:
npx playwright install

Ekstensi VS Code yang Direkomendasikan
Untuk pengalaman development dan testing yang maksimal, buka VS Code dan instal ekstensi berikut:

Playwright Test for VS Code (Oleh Microsoft) – Digunakan untuk menjalankan dan melakukan debug test langsung dari UI VS Code.

vscode-pdf – Digunakan jika Anda perlu melihat atau memeriksa file PDF hasil generate pengujian langsung di dalam editor.

Cara Menjalankan Testing
Anda dapat menjalankan pengujian dengan sangat mudah melalui visual UI di VS Code:

Buka proyek ini di Visual Studio Code.

Klik ikon Testing (berbentuk seperti sebuah lab tabung/checklist) pada menu sidebar sebelah kiri (Activity Bar).

Anda akan melihat daftar file test yang ada di dalam folder tests/.

Klik tombol Play (Run Test) di samping nama file atau test case yang ingin Anda jalankan.

Tips: Anda juga bisa menjalankan semua test via CMD dengan perintah: npx playwright test
