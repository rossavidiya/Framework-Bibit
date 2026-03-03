import { test } from '@playwright/test';
import { captureStep } from '../utils/helpers';
import { testerConfig, getFormattedTime, initializeTestPaths, finalizeTest } from '../utils/config';

// Pastikan ignoreHTTPSErrors: true untuk jaringan internal BI
test.use({ ignoreHTTPSErrors: true, video: 'on', screenshot: 'on' });

test('SauceDemo Automation Test - Laporan Profesional', async ({ page, context }) => {
    
    // 1. Setup Awal
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "E2E Flow Analysis",
        waktu: `${getFormattedTime()} WIB`
    };
    const steps: any[] = [];

    try {
        // --- ALUR PENGUJIAN ---
        await page.goto('https://www.saucedemo.com/');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Halaman', 'Buka URL.');

        // Input Username
        const user = page.locator('[data-test="username"]'); 
        await user.fill('standard_user');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input User', 'Isi kredensial.', user);

        // Input Password - FIX: Sekarang menggunakan passField agar garis merah tepat sasaran
        const passField = page.locator('[data-test="password"]');
        await passField.fill('secret_sauce');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Password', 'Memasukkan password pengguna.', passField);

        // Klik Login
        const loginBtn = page.locator('[data-test="login-button"]');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Login', 'Submit login.', loginBtn);
        await loginBtn.click();
        // --- END SCRIPT ALUR PENGUJIAN ---

   
        // Log Note Finalisasi Jika Sukses //
        await finalizeTest(page, context, metadata, steps, paths);
        
    } catch (error) {
        // Log Note Finalisasi Jika Error //
        await finalizeTest(page, context, metadata, steps, paths, error);
        throw error; 
    }
});