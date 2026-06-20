import { Locator, Page } from '@playwright/test';
import * as fs from 'fs';
import path from 'path';
import { testerConfig } from './config';

export async function setupFolders(baseDir: string, subDirs: string[]) {
    subDirs.forEach(dir => {
        const fullPath = path.join(baseDir, dir);
        if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
    });
}

/**
 * Fungsi Auto Scroll: Berguna untuk memicu lazy-loading pada tabel panjang
 */
export async function autoScroll(page: Page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100; // Jarak scroll per langkah (pixel)
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve(null);
            }
          }, 100); // Kecepatan scroll (ms)
        });
    });
}

export async function highlight(locator: Locator) {
    await locator.evaluate(el => {
        el.style.border = '4px solid red'; // Gunakan border agar lebih jelas
        el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    });
}

export async function captureStep(page: Page, imgDir: string, timestamp: string, steps: any[], name: string, description: string, locator?: Locator) {
    if (locator) {
        await locator.scrollIntoViewIfNeeded();
        await highlight(locator);
        
        // --- SLEEP OTOMATIS DI SINI ---
        // Menunggu agar browser sempat merender garis merah sebelum difoto
        await page.waitForTimeout(testerConfig.defaultSleep); 
    }
    
    const fileName = `${name.replace(/\s+/g, '_')}_${timestamp}.png`;
    await page.screenshot({ path: path.join(imgDir, fileName) });
    steps.push({ name, description, file: fileName });
}

/**
 * Fungsi untuk maximize viewport sesuai ukuran layar secara dinamis.
 * Pada mode mobile (isMobile), viewport sudah diatur oleh device profile,
 * jadi tidak perlu di-override.
 */
export async function maximizeViewport(page: Page) {
    // Cek apakah sedang di mode mobile device
    const isMobile = await page.evaluate(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    });

    if (isMobile) {
        const vp = page.viewportSize();
        console.log(`[📱 MOBILE VIEWPORT]: ${vp?.width}x${vp?.height}`);
        return; // Jangan override viewport di mobile
    }

    // Desktop: maximize viewport sesuai ukuran layar
    const screenSize = await page.evaluate(() => {
        return {
            width: window.screen.availWidth,
            height: window.screen.availHeight
        };
    });
    
    await page.setViewportSize({
        width: screenSize.width,
        height: screenSize.height
    });
    
    console.log(`[🖥️ DESKTOP VIEWPORT]: ${screenSize.width}x${screenSize.height}`);
}