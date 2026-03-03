import { test, expect } from '@playwright/test';
import { captureStep, maximizeViewport } from '../../utils/helpers';
import { testerConfig, getFormattedTime, initializeTestPaths, finalizeTest } from '../../utils/config';

// Pastikan ignoreHTTPSErrors: true untuk jaringan internal BI
test.use({ 
    ignoreHTTPSErrors: true, 
    video: 'on', 
    screenshot: 'on',
    // Menambah waktu toleransi loading agar tidak cepat timeout
    navigationTimeout: 60000,
    actionTimeout: 15000
});

test('Wakatobi Automation Test', async ({ page, context }) => {
    // 1. Setup Awal
    const startTime = Date.now(); // Catat waktu mulai
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "E2E Wakatobi Edit BKU Sistem Pembayaran",
        waktu: `${getFormattedTime()} WIB`,
        durasi: ''
    };
    const steps: any[] = [];

    try {
        // Maximize viewport sesuai ukuran layar
        await maximizeViewport(page);

        // --- STEP 1: Login Flow ---
        await page.goto('https://wakatobi.corp.bi.go.id:8443/', { waitUntil: 'domcontentloaded' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Halaman', 'Buka URL Wakatobi.');

        const btnLoginMenu = page.getByRole('button', { name: 'Login' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Menu Login', 'Membuka form login.', btnLoginMenu);
        await btnLoginMenu.click();

        const emailField = page.getByRole('textbox', { name: 'Your Email:' });
        await emailField.fill('admin@informatica.com');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Email', 'Mengisi email admin.', emailField);

        const passField = page.getByRole('textbox', { name: 'Your Password:' });
        await passField.fill('Changeme@123');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Password', 'Mengisi password admin.', passField);

        const btnSubmit = page.getByRole('button', { name: 'Login ' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Tombol Masuk', 'Submit kredensial.', btnSubmit);
        
        // FIX: Tunggu sampai benar-benar login sebelum lanjut
        await btnSubmit.click();
        await page.waitForLoadState('networkidle'); 

        // --- STEP 2: Edit System (ID 96) ---
        // Gunakan waitUntil agar memastikan halaman siap sebelum diisi
        await page.goto('https://wakatobi.corp.bi.go.id:8443/system/edit/id/96', { waitUntil: 'domcontentloaded' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Edit System', 'Masuk ke halaman edit ID 96.');
        
        const autoNumber = Date.now(); 
        const descField = page.getByRole('textbox', { name: 'Description *' });
        await expect(descField).toBeVisible(); // Pastikan field muncul dulu
        await descField.fill(`Bauran Kebijakan Utama Sistem Pembayaran. ${autoNumber}`);
        
        // Logika asli: klik header untuk unfocus
        await page.locator('.card-header').first().click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Description', 'Mengisi deskripsi dengan autonumber.', descField);
        
        const btnSaveSystem = page.getByRole('button', { name: 'Save', exact: true });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Simpan Perubahan', 'Klik tombol Save System.', btnSaveSystem);
        
        // FIX PENTING: Klik Save dan tunggu network tenang sebelum pindah URL
        await btnSaveSystem.click();
        await page.waitForLoadState('domcontentloaded'); 
        await page.waitForTimeout(3000); // Buffer tambahan untuk server Wakatobi memproses data

      
        // Hitung durasi eksekusi
          const endTime = Date.now();
          const durationMs = endTime - startTime;
          const durationSec = Math.floor(durationMs / 1000);
          const minutes = Math.floor(durationSec / 60);
          const seconds = durationSec % 60;
          metadata.durasi = `${minutes} menit ${seconds} detik`;

        // Log Note Finalisasi Jika Sukses //
        await finalizeTest(page, context, metadata, steps, paths);
        
  } catch (error) {
     const endTime = Date.now();
          const durationMs = endTime - startTime;
          const durationSec = Math.floor(durationMs / 1000);
          const minutes = Math.floor(durationSec / 60);
          const seconds = durationSec % 60;
          metadata.durasi = `${minutes} menit ${seconds} detik`;
        // Log Note Finalisasi Jika Error //
        await finalizeTest(page, context, metadata, steps, paths, error);
        throw error; 
    }
});