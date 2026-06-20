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

test('Bibit SBN Page Test', async ({ page, context }) => {
    // 1. Setup Awal
    const startTime = Date.now();
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "Web SBN Information Bibit",
        waktu: `${getFormattedTime()} WIB`,
        durasi: ''
    };
    const steps: any[] = [];

    try {
        await maximizeViewport(page);

        // --- Execute Test ---
        await page.goto('https://bibit.id/');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Halaman', 'Buka URL Bibit.');

        const investIcon = page.getByTestId('index-action-invest-lp').getByRole('img', { name: 'icon arrow more' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Ikon Invest', 'Klik menu eksplor investasi.', investIcon);
        await investIcon.click();

        const sbnLink = page.getByRole('link', { name: 'SBN Investasi yang 100% aman' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik SBN', 'Masuk ke halaman SBN.', sbnLink);
        await sbnLink.click();

        await page.getByRole('img', { name: 'arrow' }).nth(2).click();
        await page.locator('div').filter({ hasText: 'Penawaran mendatang dimulai' }).nth(3).click();
        
        await page.getByTestId('sbn-webpage-action-live-offer-nextPrev').first().click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Lihat Penawaran Live', 'Navigasi penawaran berjalan.');
        await page.getByTestId('sbn-webpage-action-live-offer-nextPrev').first().click();

        await page.getByTestId('sbn-webpage-action-view-past-product-2026').click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Lihat Produk SBN', 'Klik tahun rilis SBN 2026.');
        await page.getByTestId('sbn-webpage-action-view-past-product-2025').click();
        await page.getByTestId('sbn-webpage-action-view-past-product-2024').click();
        await page.getByTestId('sbn-webpage-action-view-past-product-2023').click();
        await page.getByTestId('sbn-webpage-action-view-past-product-2022').click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Navigasi Tahun', 'Klik tahun rilis SBN 2022-2025.');

        await page.getByRole('img', { name: 'arrow' }).nth(4).click();
        await page.getByTestId('sbn-webpage-action-view-past-product-nextPrev').first().click();

        const page1Promise = page.waitForEvent('popup');
        const viewMemoLink = page.getByRole('link', { name: 'Lihat Memo' }).first();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Lihat Memo', 'Klik tombol lihat memo yang membuka popup.', viewMemoLink);
        await viewMemoLink.click();
        
        const page1 = await page1Promise;
        await page1.waitForLoadState('domcontentloaded');
        await page1.close();

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