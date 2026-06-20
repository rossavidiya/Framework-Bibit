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

test('Bibit Saham Page Test', async ({ page, context }) => {
    // 1. Setup Awal
    const startTime = Date.now();
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "Web Saham Information Bibit",
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
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Ikon Invest', 'Klik explore investasi.', investIcon);
        await investIcon.click();

        const sahamLink = page.getByRole('link', { name: 'Saham Investasi langsung di' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Saham', 'Masuk ke halaman Saham.', sahamLink);
        await sahamLink.click();

        // Simulasi investasi Saham
        const sliderAmount = page.getByRole('slider');
        await sliderAmount.fill('62100000');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Nilai Investasi', 'Mengubah nilai slider investasi.', sliderAmount);

        await page.getByRole('button', { name: '3 Tahun' }).click();
        await page.getByRole('button', { name: '5 Tahun' }).click();
        await page.getByText('78.65%').click();
        await page.getByText('Seandainya kamu investasi saham Bank BCARp62,100,0003 Tahun5 Tahun10 TahunNilai').click();
        
        await page.getByRole('button', { name: '10 Tahun' }).click();
        await page.getByText('285.42%').click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Cek Simulasi Waktu', 'Memverifikasi hasil simulasi 10 tahun.');

        // Klik - toggle FAQ
        const faqDaftar = page.getByRole('heading', { name: 'Bagaimana cara daftar akun' });
        await faqDaftar.click();
        
        const faqDeposit = page.getByRole('heading', { name: 'Berapa minimum deposit untuk' });
        await faqDeposit.click();
        await faqDeposit.click();

        const faqFee = page.getByRole('heading', { name: 'Berapa fee jual dan beli' });
        await faqFee.click();
        await faqFee.click();

        const faqSyarat = page.getByRole('heading', { name: 'Siapa saja yang bisa membeli' });
        await faqSyarat.click();
        await faqSyarat.click();

        const faqBeda = page.locator('div').filter({ hasText: 'Apa perbedaan saham dan reksa' }).nth(3);
        await faqBeda.click();
        await faqBeda.click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Toggle FAQ', 'Test interaksi pada menu FAQ.');

        // Kembali ke FAQ utama dan home
        const lihatFaqLink = page.getByRole('link', { name: 'Lihat Semua FAQ Bibit icon' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Lihat Semua FAQ', 'Menuju halaman FAQ utama Bibit.', lihatFaqLink);
        await lihatFaqLink.click();

        const bibitLogoLink = page.getByRole('link', { name: 'Bibit', exact: true }).first();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Kembali ke Home', 'Klik logo Bibit untuk kembali ke home.', bibitLogoLink);
        await bibitLogoLink.click();

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