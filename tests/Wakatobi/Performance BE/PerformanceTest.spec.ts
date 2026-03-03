/**
 * =========================================
 * WAKATOBI PERFORMANCE TEST SCRIPT
 * =========================================
 * Script untuk melakukan performance testing pada aplikasi Wakatobi
 * 
 * Mendukung:
 * - Load Testing: Beban normal
 * - Stress Testing: Beban tinggi
 * - Spike Testing: Lonjakan tiba-tiba
 * - Endurance Testing: Beban lama
 * 
 * CARA MENGGUNAKAN:
 * 1. Edit file performance.config.ts untuk mengatur konfigurasi
 * 2. Ubah ACTIVE_CONFIG sesuai jenis test yang diinginkan
 * 3. Jalankan: npx playwright test tests/Wakatobi/PerformanceTest.spec.ts --workers=1
 * 
 * Untuk parallel workers:
 * npx playwright test tests/Wakatobi/PerformanceTest.spec.ts --workers=5
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Import konfigurasi dari performance.config.ts
import {
    ACTIVE_CONFIG,
    PerformanceConfig,
    calculateMetrics,
    formatMetricsReport,
    sleep,
} from './performance.config';

// Import utility functions dari metricsUtils.ts
import {
    UserMetrics,
    getSharedStartTime,
    setSharedStartTime,
    saveUserMetrics,
    aggregateAllMetrics,
    smartCleanup,
    canGenerateReport,
    getReportDir,
} from './metricsUtils';

// =========================================
// PILIH KONFIGURASI DI SINI
// =========================================
// Opsi: ACTIVE_CONFIG, atau import config lain dari performance.config.ts
const CONFIG: PerformanceConfig = ACTIVE_CONFIG;

// =========================================
// PLAYWRIGHT TEST CONFIGURATION
// =========================================
test.use({
    ignoreHTTPSErrors: true,
    video: 'off', // Matikan video untuk performa
    screenshot: 'off', // Matikan screenshot untuk performa
    navigationTimeout: CONFIG.navigationTimeout,
    actionTimeout: CONFIG.actionTimeout,
    // Clear storage state untuk fresh session setiap test
    storageState: undefined,
});

/**
 * Skenario test yang akan dijalankan
 * Modifikasi fungsi ini sesuai flow aplikasi yang ditest
 */
async function performTestScenario(page: Page, userId: number, iteration: number): Promise<number> {
    const startTime = Date.now();
    
    try {
        // === STEP 1: Akses halaman utama ===
        await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' });
        
        // Tunggu halaman benar-benar loaded
        await page.waitForLoadState('networkidle').catch(() => {});
        
        // Think time - simulasi user membaca halaman
        await sleep(CONFIG.thinkTimeMs);

        // === STEP 2: Check login status dan login jika perlu ===
        const btnLoginMenu = page.getByRole('button', { name: 'Login', exact: true });
        const btnUserMenu = page.locator('button').filter({ hasText: /Data Catalog Admin/i });
        
        // Tunggu salah satu elemen muncul
        let isLoggedOut = false;
        try {
            await Promise.race([
                btnLoginMenu.waitFor({ state: 'visible', timeout: 5000 }),
                btnUserMenu.first().waitFor({ state: 'visible', timeout: 5000 })
            ]);
            // Check mana yang visible
            isLoggedOut = await btnLoginMenu.isVisible();
        } catch {
            // Timeout - coba check manual
            isLoggedOut = await btnLoginMenu.isVisible().catch(() => false);
        }
        
        if (isLoggedOut) {
            // User belum login, lakukan login
            console.log(`[User ${userId}][Iteration ${iteration}] User belum login, melakukan login...`);
            
            await btnLoginMenu.click();
            
            // Tunggu dropdown muncul
            await page.waitForTimeout(500);

            const emailField = page.getByRole('textbox', { name: 'Your Email:' });
            await emailField.fill('admin@informatica.com');

            const passField = page.getByRole('textbox', { name: 'Your Password:' });
            await passField.fill('Changeme@123');

            // Gunakan selector lebih spesifik untuk tombol submit
            const btnSubmit = page.locator('button[type="submit"]').filter({ hasText: 'Login' });
            await btnSubmit.click();
            await page.waitForLoadState('networkidle');

            // Think time setelah login
            await sleep(CONFIG.thinkTimeMs);
        } else {
            console.log(`[User ${userId}][Iteration ${iteration}] User sudah login, lanjut ke step berikutnya...`);
        }

        // === STEP 3: Akses halaman data (contoh flow) ===
        console.log(`[User ${userId}][Iteration ${iteration}] Navigating to edit page...`);
        await page.goto(`${CONFIG.baseUrl}data/edit/id/597`, { 
            waitUntil: 'domcontentloaded',
            timeout: CONFIG.navigationTimeout 
        });
        
        // Tunggu halaman fully loaded
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {
            console.log(`[User ${userId}][Iteration ${iteration}] networkidle timeout, continuing...`);
        });
        
        // Tunggu sebentar untuk page render
        await page.waitForTimeout(1000);
        
        // Cari area untuk klik sebelum input - coba beberapa selector
        const cardHeader = page.locator('.card-header, .panel-heading, .form-group, h3, h4').first();
        const headerExists = await cardHeader.isVisible().catch(() => false);
        if (headerExists) {
            await cardHeader.click().catch(() => {});
            await page.waitForTimeout(500);
        }

        const defField = page.getByRole('textbox', { name: 'Definition *' });
        
        // Wait lebih lama untuk field muncul
        await defField.waitFor({ state: 'visible', timeout: 15000 });

        // Think time setelah halaman load
        await sleep(CONFIG.thinkTimeMs / 2);

        // === STEP 4: Edit dan simpan ===
        // Generate unique ID dengan random string untuk memastikan selalu berbeda
        const randomStr = Math.random().toString(36).substring(2, 8);
        const uniqueId = `${Date.now()}-U${userId}-I${iteration}-${randomStr}`;
        const newValue = `Performance Test ${uniqueId}`;
        
        console.log(`[User ${userId}][Iteration ${iteration}] Filling field with: ${newValue}`);
        
        // Klik field dulu, clear dengan keyboard, lalu isi text baru
        await defField.click();
        await page.waitForTimeout(200);
        
        // Select all dan delete untuk clear field
        await page.keyboard.press('Control+A');
        await page.waitForTimeout(100);
        
        // Ketik text baru langsung (akan replace selected text)
        await defField.fill(newValue);
        await page.waitForTimeout(300);
        
        // Klik area luar untuk trigger change event / blur - gunakan body atau escape
        await page.keyboard.press('Tab'); // Tab out dari field untuk trigger blur
        await page.waitForTimeout(500);

        const btnSave = page.getByRole('button', { name: 'Save', exact: true });
        await btnSave.waitFor({ state: 'visible', timeout: 10000 });
        
        // Pastikan button bisa diklik
        await btnSave.scrollIntoViewIfNeeded().catch(() => {});
        await btnSave.click();
        await page.waitForLoadState('domcontentloaded');
        
        // Tunggu response dari server
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});

        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`[User ${userId}][Iteration ${iteration}] ✓ Success - ${responseTime}ms - Value: ${newValue}`);
        
        return responseTime;
        
    } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.error(`[User ${userId}][Iteration ${iteration}] ✗ Failed - ${responseTime}ms - ${error}`);
        throw error;
    }
}

/**
 * Lightweight scenario - Hanya test response time halaman utama
 * Gunakan ini untuk stress/spike test dengan volume tinggi
 */
async function performLightweightScenario(page: Page, userId: number, iteration: number): Promise<number> {
    const startTime = Date.now();
    
    try {
        await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded' });
        
        // Check apakah halaman sudah load - bisa login button atau user menu
        const btnLogin = page.getByRole('button', { name: 'Login', exact: true });
        const btnUserMenu = page.locator('button').filter({ hasText: /Data Catalog Admin|Admin|User/i });
        
        // Tunggu salah satu element muncul (login button atau user menu)
        await Promise.race([
            btnLogin.waitFor({ state: 'visible', timeout: 10000 }),
            btnUserMenu.first().waitFor({ state: 'visible', timeout: 10000 })
        ]).catch(() => {
            // Fallback: tunggu navigation selesai
            return page.waitForLoadState('networkidle', { timeout: 10000 });
        });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.log(`[User ${userId}][Iteration ${iteration}] ✓ Page Load - ${responseTime}ms`);
        return responseTime;
        
    } catch (error) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        console.error(`[User ${userId}][Iteration ${iteration}] ✗ Failed - ${responseTime}ms`);
        throw error;
    }
}

// =========================================
// TEST SUITE
// =========================================
let testStartTime = 0;

test.describe(`Performance Test - ${CONFIG.testType.toUpperCase()}`, () => {
    
    test.beforeAll(() => {
        // Smart cleanup - hanya cleanup sekali per session
        smartCleanup();
        
        // Set shared testStartTime (akan digunakan oleh semua workers)
        testStartTime = setSharedStartTime();
        
        console.log('\n' + '='.repeat(60));
        console.log(`STARTING ${CONFIG.testType.toUpperCase()} TEST`);
        console.log('='.repeat(60));
        console.log(`Virtual Users     : ${CONFIG.virtualUsers}`);
        console.log(`Users/Second      : ${CONFIG.usersPerSecond}`);
        console.log(`Duration          : ${CONFIG.durationSeconds} seconds`);
        console.log(`Think Time        : ${CONFIG.thinkTimeMs}ms`);
        console.log(`Iteration Delay   : ${CONFIG.iterationDelayMs}ms`);
        console.log(`Start Time        : ${new Date(testStartTime).toISOString()}`);
        console.log('='.repeat(60) + '\n');
    });

    test.afterAll(async () => {
        const testEndTime = Date.now();
        
        // Tunggu sebentar untuk memastikan semua metrics tersimpan
        await sleep(2000);
        
        // Check apakah worker ini boleh generate report (hanya 1 worker yang boleh)
        if (!canGenerateReport()) {
            console.log('[Report] Skipping report generation - already handled by another worker');
            return;
        }
        
        // Tunggu tambahan untuk memastikan semua worker selesai menulis metrics
        await sleep(3000);
        
        // Get shared start time
        const sharedStartTime = getSharedStartTime();
        
        // Aggregate metrics from all user files
        const { responseTimes, errorResponseTimes, successCount, failCount, activeUsers, perUserMetrics } = aggregateAllMetrics();
        // Calculate final metrics
        const metrics = calculateMetrics(
            responseTimes,
            successCount,
            failCount,
            CONFIG.testType,
            sharedStartTime,
            testEndTime,
            CONFIG.virtualUsers,
            activeUsers,
            errorResponseTimes
        );

        // Add per-user metrics to the final metrics object
        metrics.userMetrics = perUserMetrics;

        // Print report
        console.log(formatMetricsReport(metrics));

        // Save report to file - gunakan getReportDir untuk konsistensi
        const reportDir = getReportDir(CONFIG.testType);
        
        try {
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            
            const reportPath = path.join(reportDir, 'performance_report.json');
            fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
            
            const textReportPath = path.join(reportDir, 'performance_report.txt');
            fs.writeFileSync(textReportPath, formatMetricsReport(metrics));
            
            console.log(`\nReport saved to: ${reportDir}`);
        } catch (err) {
            console.error('Failed to save report:', err);
        }
        
        console.log('[Metrics] Report generated successfully. Only one report file created.');
    });

    // Generate test cases berdasarkan jumlah virtual users
    for (let userId = 1; userId <= CONFIG.virtualUsers; userId++) {
        test(`Virtual User ${userId}`, async ({ page }) => {
            // Set timeout berdasarkan durasi test + buffer untuk operasi
            // Durasi test + ramp-up time + buffer 2 menit
            const testTimeout = (CONFIG.durationSeconds * 1000) + (CONFIG.virtualUsers / CONFIG.usersPerSecond * 1000) + 120000;
            test.setTimeout(testTimeout);
            
            // Local metrics untuk user ini
            const userMetrics: UserMetrics = {
                userId,
                responseTimes: [],
                errorResponseTimes: [],
                successCount: 0,
                failCount: 0,
                iterations: 0
            };
            
            // Hitung delay untuk ramp-up (users masuk bertahap)
            const rampUpDelay = ((userId - 1) / CONFIG.usersPerSecond) * 1000;
            
            console.log(`[User ${userId}] Waiting ${rampUpDelay}ms for ramp-up...`);
            await sleep(rampUpDelay);
            
            const userStartTime = Date.now();
            
            // Get shared start time untuk konsistensi antar workers
            const sharedStartTime = getSharedStartTime();
            console.log(`[User ${userId}] Using shared start time: ${new Date(sharedStartTime).toISOString()}`);
            
            // Jalankan iterasi sampai durasi test habis
            while ((Date.now() - sharedStartTime) < (CONFIG.durationSeconds * 1000)) {
                userMetrics.iterations++;
                
                let startTime = Date.now();
                try {
                    // Pilih skenario: Full atau Lightweight
                    let responseTime: number;
                    if (CONFIG.testType === 'spike' || CONFIG.testType === 'stress') {
                        try {
                            startTime = Date.now();
                            responseTime = await performLightweightScenario(page, userId, userMetrics.iterations);
                            userMetrics.responseTimes.push(responseTime);
                            userMetrics.successCount++;
                        } catch (error) {
                            const now = Date.now();
                            const errorRespTime = now - startTime;
                            userMetrics.errorResponseTimes.push(errorRespTime);
                            userMetrics.failCount++;
                            console.error(`[User ${userId}][Iteration ${userMetrics.iterations}] Error:`, error);
                        }
                    } else {
                        try {
                            startTime = Date.now();
                            responseTime = await performTestScenario(page, userId, userMetrics.iterations);
                            userMetrics.responseTimes.push(responseTime);
                            userMetrics.successCount++;
                        } catch (error) {
                            const now = Date.now();
                            const errorRespTime = now - startTime;
                            userMetrics.errorResponseTimes.push(errorRespTime);
                            userMetrics.failCount++;
                            console.error(`[User ${userId}][Iteration ${userMetrics.iterations}] Error:`, error);
                        }
                    }
                } catch (error) {
                    // fallback, mestinya tidak sampai sini
                    userMetrics.failCount++;
                    console.error(`[User ${userId}][Iteration ${userMetrics.iterations}] Error:`, error);
                }
                
                // Save metrics after each iteration
                saveUserMetrics(userMetrics);
                
                // Delay antar iterasi
                await sleep(CONFIG.iterationDelayMs);
                
                // Check if we've exceeded the test duration
                if ((Date.now() - sharedStartTime) >= (CONFIG.durationSeconds * 1000)) {
                    break;
                }
            }
            
            // Final save
            saveUserMetrics(userMetrics);
            
            const userDuration = (Date.now() - userStartTime) / 1000;
            console.log(`[User ${userId}] Completed ${userMetrics.iterations} iterations (${userMetrics.successCount} success, ${userMetrics.failCount} failed) in ${userDuration.toFixed(2)}s`);
        });
    }
});

// =========================================
// SINGLE USER TEST (untuk debugging)
// =========================================
test.describe.skip('Single User Debug Test', () => {
    test('Debug - Single Iteration', async ({ page }) => {
        const responseTime = await performTestScenario(page, 1, 1);
        console.log(`Response Time: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(30000);
    });
});
