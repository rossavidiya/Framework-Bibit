import { test, expect, Locator } from '@playwright/test';
import * as fs from 'fs';
import path from 'path';

// Konfigurasi bypass untuk jaringan internal Bank Indonesia
test.use({ 
  ignoreHTTPSErrors: true,
  video: 'on',
  screenshot: 'on'
});

test('SauceDemo Automation Test - Laporan Profesional', async ({ page, context }) => {
  // 1. Metadata Laporan
  const metadata = {
    tester: "PKD-DDID", //
    role: "Engineer", //
    instansi: "Bank Indonesia", //
    project: "Sampel Demo Web",
    testCase: "Demo Testcase",
    waktu: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
  };

  // 2. Setup Folder Hasil Test
  const fileTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseDir = path.join(__dirname, `Results_${fileTimestamp}`);
  const [pdfDir, imgDir, videoDir] = ['PDF', 'Screenshots', 'Videos'].map(d => path.join(baseDir, d));

  [pdfDir, imgDir, videoDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  const steps: { name: string; description: string; file: string }[] = [];

  // --- FUNGSI HELPER VISUAL ---
  
  const highlight = async (locator: Locator) => {
    await locator.evaluate(el => {
      el.style.outline = '3px solid red';
      el.style.outlineOffset = '2px';
    });
  };

  const captureStep = async (name: string, description: string, locator?: Locator) => {
    if (locator) {
      await locator.scrollIntoViewIfNeeded(); // Memastikan elemen masuk layar
      await highlight(locator);
    }
    
    const fileName = `${name.replace(/\s+/g, '_')}_${fileTimestamp}.png`;
    const filePath = path.join(imgDir, fileName);
    await page.screenshot({ path: filePath });
    steps.push({ name, description, file: fileName });
  };

  // --- ALUR PENGUJIAN ---

  // Langkah 1: Akses
  await page.goto('https://www.saucedemo.com/');
  await captureStep('Akses Halaman Utama', 'Membuka URL aplikasi.');

  // Langkah 2: Username & Password (Kini keduanya ditandai merah)
  const userField = page.locator('[data-test="username"]');
  const passField = page.locator('[data-test="password"]');
  
  await userField.fill('standard_user');
  await captureStep('Input Username', 'Memasukkan username pengguna.', userField);
  
  await passField.fill('secret_sauce');
  await captureStep('Input Password', 'Memasukkan password pengguna.', passField); 

  // Langkah 3: Login
  const loginBtn = page.locator('[data-test="login-button"]');
  await captureStep('Klik Login', 'Menekan tombol login.', loginBtn);
  await loginBtn.click();
  
  // Langkah 4: Add to Cart
  const cartBtn = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
  await captureStep('Interaksi Produk', 'Menambahkan produk ke keranjang.', cartBtn);
  await cartBtn.click();

  // Langkah 5: Logout (Perbaikan: Buka menu dulu, baru capture)
  await page.getByRole('button', { name: 'Open Menu' }).click();
  
  const logoutBtn = page.locator('[data-test="logout-sidebar-link"]');
  // Capture dilakukan SETELAH menu terbuka dan SEBELUM tombol diklik
  await captureStep('Terminasi Sesi', 'Melakukan logout dari sistem.', logoutBtn);
  await logoutBtn.click();

  // --- PEMBUATAN LAPORAN PDF ---

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { border-bottom: 4px solid #004d40; margin-bottom: 30px; padding-bottom: 10px; }
          .meta-table { width: 100%; margin-bottom: 40px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
          .meta-table td { padding: 5px 10px; }
          .label { font-weight: bold; width: 180px; color: #004d40; }
          .step-box { margin-bottom: 50px; page-break-after: always; border: 1px solid #eee; padding: 20px; border-radius: 10px; }
          .step-title { font-size: 20px; color: #004d40; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .step-desc { font-style: italic; color: #666; margin-bottom: 15px; background: #fffde7; padding: 10px; border-left: 4px solid #fbc02d; }
          img { width: 100%; border-radius: 5px; border: 1px solid #ddd; }
          .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>E-REPORT AUTOMATION TEST</h1>
          <p>Laporan Resmi Pengujian Sistem - ${metadata.project}</p>
        </div>
        <table class="meta-table">
          <tr><td class="label">Nama Test Case</td><td>: ${metadata.testCase}</td></tr>
          <tr><td class="label">Tester</td><td>: ${metadata.tester} (${metadata.role})</td></tr>
          <tr><td class="label">Instansi</td><td>: ${metadata.instansi}</td></tr>
          <tr><td class="label">Waktu Eksekusi</td><td>: ${metadata.waktu} WIB</td></tr>
        </table>
        ${steps.map((s, i) => `
          <div class="step-box">
            <div class="step-title">Langkah ${i + 1}: ${s.name}</div>
            <div class="step-desc"><strong>Deskripsi:</strong> ${s.description}</div>
            <img src="data:image/png;base64,${fs.readFileSync(path.join(imgDir, s.file)).toString('base64')}">
          </div>
        `).join('')}
        <div class="footer"> Dokumen ini dibuat secara otomatis oleh sistem Playwright Automation. </div>
      </body>
    </html>
  `;

  await page.setContent(htmlContent);
  const pdfPath = path.join(pdfDir, `Laporan_Pengujian_${fileTimestamp}.pdf`);
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' } });

  await context.close();
  const rawVideoPath = await page.video()?.path();
  if (rawVideoPath) {
    fs.copyFileSync(rawVideoPath, path.join(videoDir, `Video_Execution_${fileTimestamp}.webm`));
  }

  console.log(`Pengujian selesai Fitra Harda! Hasil tersimpan di: ${baseDir}`); //
});