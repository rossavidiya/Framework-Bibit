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

test('Bibit Reksadana Filter Test', async ({ page, context }) => {
    const startTime = Date.now();
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "Web Reksadana Filter Bibit",
        waktu: `${getFormattedTime()} WIB`,
        durasi: ''
    };
    const steps: any[] = [];

    try {
        await maximizeViewport(page);

        await page.goto('https://bibit.id/');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Halaman', 'Buka URL Bibit.');

        const investIcon = page.getByTestId('index-action-invest-lp').getByRole('img', { name: 'icon arrow more' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Ikon Invest', 'Klik explore investasi.', investIcon);
        await investIcon.click();

        const reksadanaLink = page.getByRole('link', { name: 'Reksa Dana Investasi untuk' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Reksadana', 'Buka halaman Reksadana.', reksadanaLink);
        await reksadanaLink.click();

        const rdpuCheckbox = page.getByTestId('mf-webpage-action-fund-type-rdpu');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Pilih RDPU', 'Filter list menggunakan RDPU.', rdpuCheckbox);
        await rdpuCheckbox.check();
        await page.goto('https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3');

        const usdCheckbox = page.getByTestId('mf-webpage-action-filter-usd');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Filter USD', 'Checklist filter USD.', usdCheckbox);
        await usdCheckbox.check();
        await page.goto('https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3&usd=1');

        const radioSemua = page.getByRole('radio', { name: 'Semua' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Radio Semua', 'Pilih radio Semua.', radioSemua);
        await radioSemua.check();
        await page.goto('https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3&usd=1');

        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Uncheck USD', 'Hilangkan filter USD.', usdCheckbox);
        await usdCheckbox.uncheck();
        await page.goto('https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3');

        const radioDijual = page.getByRole('radio', { name: 'Dijual di Bibit' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Radio Dijual', 'Pilih Dijual di Bibit.', radioDijual);
        await radioDijual.check();
        await page.goto('https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3&tradeable=1');

        const searchBox = page.getByRole('textbox', { name: 'Cari Reksa Dana' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Search', 'Fokus pada pencarian.', searchBox);
        await searchBox.click();
        await searchBox.fill('');
        await page.goto('https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&type=3&tradeable=1');

        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Uncheck RDPU', 'Hilangkan filter RDPU.', rdpuCheckbox);
        await rdpuCheckbox.uncheck();
        await page.goto('https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1&tradeable=1');

        const filterLabel = page.getByText('Dijual di BibitSemua');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Label', 'Klik area label filter.', filterLabel);
        await filterLabel.click();
        
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Radio Semua Kembali', 'Pilih radio Semua lagi.', radioSemua);
        await radioSemua.check();
        await page.goto('https://bibit.id/reksadana?limit=20&page=1&sort=asc&sort_by=7&tradable=1');

        const logo = page.getByRole('link', { name: 'logo bibit' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Kembali ke Home', 'Klik logo.', logo);
        await logo.click();

        metadata.durasi = hitungDurasi(startTime);
        await finalizeTest(page, context, metadata, steps, paths);
    } catch (error) {
        metadata.durasi = hitungDurasi(startTime);
        await finalizeTest(page, context, metadata, steps, paths, error);
        throw error; 
    }
});