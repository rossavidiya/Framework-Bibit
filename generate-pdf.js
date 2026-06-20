const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

(async () => {
    // Jalankan browser Chromium (disediakan oleh Playwright)
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Lokasi file report HTML asli
    const reportPath = path.resolve(__dirname, 'playwright-report/index.html');

    if (!fs.existsSync(reportPath)) {
        console.error('Report HTML tidak ditemukan! Pastikan Anda sudah menjalankan test (npx playwright test) terlebih dahulu.');
        await browser.close();
        process.exit(1);
    }

    // Buka file report HTML tersebut dengan Playwright
    await page.goto(`file://${reportPath}`, { waitUntil: 'networkidle' });

    // Cetak ke PDF
    const pdfPath = 'Hasil-Report-Playwright.pdf';
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true, // agar warna dari HTML report ikut tercetak
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });

    console.log(`\n=================================================`);
    console.log(`✅ Berhasil! Report PDF telah tersimpan di:`);
    console.log(`📂 ${path.resolve(__dirname, pdfPath)}`);
    console.log(`=================================================\n`);

    await browser.close();
})();