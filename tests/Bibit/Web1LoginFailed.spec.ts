import { test, expect } from '@playwright/test';
import { captureStep, maximizeViewport } from '../../utils/helpers';
import { testerConfig, getFormattedTime, initializeTestPaths, finalizeTest, hitungDurasi } from '../../utils/config';

test.use({ 
    ignoreHTTPSErrors: true, 
    video: 'on', 
    screenshot: 'on',
    navigationTimeout: 60000,
    actionTimeout: 15000
});

test('Bibit Login Failed Test', async ({ page, context }) => {
    // 1. Setup Awal
    const startTime = Date.now();
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "Web Login Failed Bibit",
        waktu: `${getFormattedTime()} WIB`,
        durasi: ''
    };
    const steps: any[] = [];

    try {
        await maximizeViewport(page);

        // --- Execute Test ---
        await page.goto('https://bibit.id/');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Halaman', 'Buka URL Bibit.');

        const loginLink = page.getByRole('link', { name: 'Login' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Menu Login', 'Membuka form login.', loginLink);
        await loginLink.click();

        const phoneField = page.getByRole('textbox', { name: 'contoh:' });
        await phoneField.click();
  
        // Generate nomor HP unik
        const uniquePhone = '8' + Date.now().toString().slice(-9);
        console.log(`Nomor HP unik yang di-generate: ${uniquePhone}`);
        await phoneField.fill(uniquePhone);
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Nomor HP', `Mengisi no HP: ${uniquePhone}`, phoneField);

        const loginBtn = page.getByTestId('login-btn-login');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Login', 'Submit form login.', loginBtn);
        await loginBtn.click();

        const otpField = page.locator('#otp-field-0');
        await otpField.click();
        await otpField.fill('8');
        await page.getByTestId('num-1').click();
        await page.getByTestId('num-2').click();
        await page.getByTestId('num-5').click();
        await page.getByTestId('num-6').click();
        await page.getByTestId('num-3').click();
        await page.getByTestId('num-3').click();
        
        const errorMessage = page.getByText('Kode OTP yang kamu masukkan');
        await errorMessage.waitFor({ state: 'visible' });
        await errorMessage.click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Verifikasi Error OTP', 'Gagal login karena OTP salah.', errorMessage);

        await page.getByTestId('back-btn').click();
        await page.getByRole('button').filter({ hasText: /^$/ }).click();

        // Hitung durasi & finalisasi
        metadata.durasi = hitungDurasi(startTime);
        await finalizeTest(page, context, metadata, steps, paths);
        
    } catch (error) {
        // Hitung durasi & finalisasi saat error
        metadata.durasi = hitungDurasi(startTime);
        await finalizeTest(page, context, metadata, steps, paths, error);
        throw error; 
    }
});