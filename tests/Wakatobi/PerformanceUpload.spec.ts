import { test, expect } from '@playwright/test';
import { captureStep, maximizeViewport } from '../../utils/helpers';
import { testerConfig, getFormattedTime, initializeTestPaths, finalizeTest } from '../../utils/config';

// Konfigurasi untuk jaringan internal BI
test.use({ 
    ignoreHTTPSErrors: true, 
    video: 'on', 
    screenshot: 'on',
    navigationTimeout: 60000,
    actionTimeout: 35000
});

test('Wakatobi Bulk Upload Automation', async ({ page, context }) => {
    // 1. Setup Awal
    const startTime = Date.now(); 
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "E2E Wakatobi Bulk Upload Wizard DS-597",
        waktu: `${getFormattedTime()} WIB`,
        durasi: '' 
    };
    const steps: any[] = [];

    try {
        // Maximize viewport sesuai ukuran layar
        await maximizeViewport(page);

        // --- STEP 1: Login Flow ---
        await page.goto('https://wakatobi.corp.bi.go.id:8443/bulk/wizard', { waitUntil: 'domcontentloaded' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Halaman Wizard', 'Membuka URL Bulk Wizard Wakatobi.');

        const btnLoginMenu = page.getByRole('button', { name: 'Login' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Login Awal', 'Membuka form login.', btnLoginMenu);
        await btnLoginMenu.click();

        const emailField = page.getByRole('textbox', { name: 'Your Email:' });
        await emailField.fill('admin@informatica.com');
        
        const passField = page.getByRole('textbox', { name: 'Your Password:' });
        await passField.fill('Changeme@123');
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Kredensial', 'Mengisi email dan password admin.', passField);

        const btnSubmit = page.getByRole('button', { name: 'Login ' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Klik Submit Login', 'Proses autentikasi.', btnSubmit);
        await btnSubmit.click();
        
        // Tunggu navigasi selesai setelah login
        await page.waitForLoadState('networkidle');

        // --- STEP 2: Bulk Upload Flow ---
        const btnCommittee = page.getByRole('button', { name: 'Committee' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Pilih Committee', 'Klik menu Committee.', btnCommittee);
        await btnCommittee.click();

        const searchInput = page.locator('input[type="search"]');
        await searchInput.fill('attri');
        const optAttribute = page.getByRole('option', { name: 'Attribute' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Cari Attribute', 'Mengisi search dan memilih Attribute.', optAttribute);
        await optAttribute.click();

        // Pilih tipe upload: Update Existing Items
        const uploadTypeField = page.getByRole('textbox', { name: 'Upload New Items' });
        await uploadTypeField.click();
        const optUpdateExisting = page.getByRole('option', { name: 'Update Existing Items' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Pilih Update Existing', 'Mengubah tipe upload menjadi Update Existing Items.', optUpdateExisting);
        await optUpdateExisting.click();

        // Step Upload File
        const btnChooseFile = page.getByRole('button', { name: 'Choose File' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Siapkan Upload', 'Memilih file Excel untuk diupload.', btnChooseFile);
        
        // Mengarahkan ke input file yang tersembunyi
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles('fileUpload\\DS-597 f_atm_debet_asli (mart_bku_spf_atm_debet_asli) 1.xlsx');

        const btnNextMap = page.getByRole('button', { name: ' Next Step — Map Columns' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Lanjut ke Mapping', 'Klik Next Step Map Columns.', btnNextMap);
        await btnNextMap.click();

        const btnNextStart = page.getByRole('button', { name: ' Next Step — Start Upload' });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Mulai Upload', 'Klik Next Step Start Upload.', btnNextStart);
        await btnNextStart.click();
         await page.waitForTimeout(90000); 

        // Menunggu proses upload di server BI
        await page.waitForTimeout(70000); 
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(30000); 

        // --- FINALISASI ---
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const durationSec = Math.floor(durationMs / 1000);
        metadata.durasi = `${Math.floor(durationSec / 60)} menit ${durationSec % 60} detik`;

        await finalizeTest(page, context, metadata, steps, paths);
          
    } catch (error) {
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const durationSec = Math.floor(durationMs / 1000);
        metadata.durasi = `${Math.floor(durationSec / 60)} menit ${durationSec % 60} detik`;

        await finalizeTest(page, context, metadata, steps, paths, error);
        throw error; 
    }
});