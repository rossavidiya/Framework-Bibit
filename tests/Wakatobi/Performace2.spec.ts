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
          testCase: "E2E Wakatobi Edit BKU Sistem Pembayaran DS-597",
          waktu: `${getFormattedTime()} WIB`,
          durasi: '' // Akan diisi di akhir test
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
  
          // --- STEP 3: Edit Data (ID 597) ---
        // Masalah sebelumnya terjadi di sini. Sekarang kita pakai 'waitUntil'
        console.log('Navigasi ke ID 597...');
        await page.goto('https://wakatobi.corp.bi.go.id:8443/data/edit/id/597', { waitUntil: 'domcontentloaded' });
        
        // Validasi visual bahwa halaman 597 sudah terbuka
        const defField = page.getByRole('textbox', { name: 'Definition *' });
        await expect(defField).toBeVisible({ timeout: 10000 });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Edit Data', 'Berhasil masuk ke halaman edit ID 597.');

        const autoNumber1 = Date.now(); 
        await defField.fill(`f_atm_debet_asli 123 ${autoNumber1}`);
        
        // Logika asli: klik header untuk unfocus
        await page.locator('.card-header').first().click();
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Definition', 'Mengisi definition dengan autonumber.', defField);
        
        const btnSaveData = page.getByRole('button', { name: 'Save', exact: true });
        await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Simpan Data', 'Klik tombol Save Data.', btnSaveData);
        
        await btnSaveData.click();
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000); 
        
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
          // Hitung durasi eksekusi saat error
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
  
  