import { test } from '@playwright/test';
import { captureStep } from '../utils/helpers';
import { testerConfig, getFormattedTime, initializeTestPaths, finalizeTest } from '../utils/config';

// Mengaktifkan bypass SSL untuk server internal devdiddsw02
test.use({ ignoreHTTPSErrors: true, video: 'on', screenshot: 'on' });

test('Web HR devdiddsw02 - Audit Alur Kompetensi', async ({ page, context }) => {
    
    // 1. Inisialisasi Setup & Metadata
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "E2E Flow Analysis - Modul Kompetensi",
        waktu: `${getFormattedTime()} WIB`
    };
    const steps: any[] = [];

    try {
        // --- LANGKAH 1: AKSES HALAMAN LOGIN ---
        await page.goto('https://devdiddsw02.corp.bi.go.id/hr_web/Website/Home/Login');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Halaman', 'Membuka landing page portal HR BI.');

        // --- LANGKAH 2: INPUT NIP ---
        const nipField = page.getByRole('textbox', { name: 'Masukkan NIP' });
        await nipField.fill('17344');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input NIP', 'Memasukkan NIP pengguna.', nipField);

        // --- LANGKAH 3: INPUT PASSWORD ---
        const passField = page.getByRole('textbox', { name: 'Masukkan Password' });
        await passField.fill('a123456!');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Password', 'Memasukkan kredensial keamanan.', passField);

        // --- LANGKAH 4: KLIK MASUK ---
        const loginBtn = page.getByRole('button', { name: 'Masuk' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Masuk', 'Melakukan otentikasi ke sistem.', loginBtn);
        await loginBtn.click();

        // --- LANGKAH 5: NAVIGASI KE KOMPETENSI ---
        const kompetensiLink = page.getByRole('link', { name: 'Kompetensi' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Menu Kompetensi', 'Navigasi ke modul Pengelolaan Data Kompetensi.', kompetensiLink);
        await kompetensiLink.click();

        // --- LANGKAH 6: CEK REKOMENDASI ---
        const rekTab = page.getByText('Rekomendasi', { exact: true });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Tab Rekomendasi', 'Membuka tab rekomendasi kompetensi.', rekTab);
        await rekTab.click();

        // --- LANGKAH 7: KEMBALI KE BERANDA ---
        const berandaLink = page.getByRole('link', { name: ' Beranda' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Kembali Beranda', 'Kembali ke dashboard utama.', berandaLink);
        await berandaLink.click();

        // 2. Finalisasi Jika Sukses
        await finalizeTest(page, context, metadata, steps, paths);

    } catch (error) {
        // 3. Finalisasi Jika Error (Tetap menghasilkan PDF Bug)
        await finalizeTest(page, context, metadata, steps, paths, error);
        throw error; 
    }
});