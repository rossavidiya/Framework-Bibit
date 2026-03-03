import { test, expect } from '@playwright/test';
import { autoScroll, captureStep, maximizeViewport } from '../utils/helpers';
import { testerConfig, getFormattedTime, initializeTestPaths, finalizeTest } from '../utils/config';

// Pastikan ignoreHTTPSErrors: true untuk jaringan internal BI
test.use({ ignoreHTTPSErrors: true, video: 'on', screenshot: 'on' });

test('Web HR devdiidsw02', async ({ page, context }) => {
    // 1. Setup Awal
    const paths = initializeTestPaths();
    const metadata = {
        ...testerConfig,
        testCase: "E2E Flow Analysis",
        waktu: `${getFormattedTime()} WIB`
    };
    const steps: any[] = [];

    try {
  // Maximize viewport sesuai ukuran layar
  await maximizeViewport(page);
  
  await page.goto('https://devdiddsw02.corp.bi.go.id/hr_web/Website/Home/Login');
  await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Akses Halaman', 'Buka URL.');

   const nipField = page.getByRole('textbox', { name: 'Masukkan NIP' });
   await nipField.fill(testerConfig.credentials.nip);
   await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input NIP', 'Memasukkan NIP pengguna.', nipField);
   

  const inputpassword= page.getByRole('textbox', { name: 'Masukkan Password' });
  await inputpassword.fill(testerConfig.credentials.password);
  await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Input Password', 'Memasukkan Password pengguna.', inputpassword);
  


  const btnclick = page.getByRole('button', { name: 'Masuk' });
  await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Click button Login', 'User berhasil Login.', btnclick);
  await btnclick.click();
  


  const clicklink = page.getByRole('link', { name: 'Kompetensi' });
  await clicklink.click();
  await autoScroll(page);
  await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Click button link', 'User berhasil masuk ke link kompentesi', clicklink);
  


  const btnrekomen= page.getByText('Rekomendasi', { exact: true });
  await btnrekomen.click(); 
  await autoScroll(page);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Click button rekomendasi', 'User berhasil masuk link kemenu rekomendasi', btnrekomen);

 
  const btnberanda= page.getByRole('link', { name: ' Beranda' });
  await btnberanda.click();
  await autoScroll(page);
  await captureStep(page, paths.imgDir, paths.timestamp, steps, 'Click button beranda', 'User berhasil masuk ke halaman utama', btnberanda);
  await page.waitForTimeout(3000);
 

  // Log Note Finalisasi Jika Sukses //
        await finalizeTest(page, context, metadata, steps, paths);
        
} catch (error) {
        // Log Note Finalisasi Jika Error //
        await finalizeTest(page, context, metadata, steps, paths, error);
        throw error; 
    }
});