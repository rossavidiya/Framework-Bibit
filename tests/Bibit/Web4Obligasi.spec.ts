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

test('Bibit Obligasi Page Explorer', async ({ page, context }) => {
    // 1. Setup Awal
    const startTime = Date.now();
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "Web Obligasi FR Information Bibit",
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

        const obligasiLink = page.getByRole('link', { name: 'Obligasi FR Jenis obligasi' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Obligasi FR', 'Buka halaman Obligasi FR.', obligasiLink);
        await obligasiLink.click();

        // FAQ Toggles
        const faqSBN = page.getByRole('heading', { name: 'Apa perbedaan antara SBN dan' });
        await faqSBN.click();
        await faqSBN.click();
        
        const faqSimpan = page.getByRole('heading', { name: 'Apakah harus menyimpan' });
        await faqSimpan.click();
        await faqSimpan.click();

        const faqYield = page.getByRole('heading', { name: 'Apa perbedaan yield dan kupon' });
        await faqYield.click();
        await faqYield.click();

        const faqResiko = page.getByRole('heading', { name: 'Jika berinvestasi Obligasi FR' });
        await faqResiko.click();
        await faqResiko.click();

        const faqResikoLain = page.getByRole('heading', { name: 'Apa resiko yang mungkin' });
        await faqResikoLain.click();
        await faqResikoLain.click();

        const faqMinimum = page.getByRole('heading', { name: 'Berapa minimum pembelian' });
        await faqMinimum.click();
        await faqMinimum.click();
        
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Toggle FAQ', 'Test fungsionalitas accordion FAQ.');
        
        await page.getByTestId('fr-bonds-webpage-faq').click();

        // Navigasi artikel - Apa itu Obligasi FR
        const apaItuLink = page.getByRole('link', { name: 'Apa itu Obligasi FR' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Buka Artikel FAQ', 'Klik artikel Apa itu Obligasi FR.', apaItuLink);
        await apaItuLink.click();
        await page.getByRole('complementary').getByRole('link', { name: 'Obligasi FR', exact: true }).click();
        await page.getByRole('link', { name: 'Belakang' }).click();

        // Navigasi artikel - Cara Melakukan Penjualan
        const caraJualLink = page.getByRole('link', { name: 'Cara Melakukan Penjualan' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Buka Artikel Jual', 'Klik artikel Cara Melakukan Penjualan.', caraJualLink);
        await caraJualLink.click();
        await page.getByRole('complementary').getByRole('link', { name: 'Obligasi FR', exact: true }).click();
        await page.getByRole('link', { name: 'Belakang' }).click();

        // Navigasi artikel - Bagaimana Cara Memasukkan
        const caraMasukLink = page.getByRole('link', { name: 'Bagaimana Cara Memasukkan' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Buka Artikel Memasukkan', 'Klik artikel Bagaimana Cara Memasukkan.', caraMasukLink);
        await caraMasukLink.click();
        await page.getByRole('complementary').getByRole('link', { name: 'Registrasi', exact: true }).click();
        await page.getByRole('link', { name: 'Belakang' }).click();
        // Step double check sesuai original script
        await caraMasukLink.click();
        await page.getByRole('complementary').getByRole('link', { name: 'Registrasi', exact: true }).click();
        await page.getByRole('link', { name: 'Belakang' }).click();

        // Buka lagi sebagian link seperti di script asal
        await page.getByRole('link', { name: 'Cara Melakukan Pembelian' }).click();
        await page.getByRole('link', { name: 'Apa itu Obligasi FR' }).click();
        await page.getByRole('link', { name: 'Kenapa Investasi Pada' }).click();
        await page.getByRole('link', { name: 'Cara Melakukan Penjualan' }).click();
        
        await page.getByRole('complementary').getByRole('link', { name: 'Obligasi FR', exact: true }).click();
        await page.getByRole('link', { name: 'Belakang' }).click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akhir Test', 'Menutup browser.');
        
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