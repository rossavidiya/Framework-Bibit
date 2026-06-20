// utils/config.ts
import { Page, BrowserContext } from '@playwright/test';
import { generatePDF, handleVideo } from './reporting';
import * as fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Pastikan path ini benar merujuk ke file credentials.env di folder yang sama
dotenv.config({ path: path.resolve(__dirname, 'credentials.env') });

export const testerConfig = {
    tester: "Vidiya Rossa Atfira",
    role: "QA",
    instansi: "Ocean",
    project: "Bibit",
    defaultSleep: 500,
    // Ambil data dari .env
    credentials: {
        nip: process.env.HR_NIP || '',
        password: process.env.HR_PASSWORD || ''
        
    }
};


export function initializeTestPaths() {
    // 1. Definisikan Folder Induk
    const parentFolder = "REPORT TESTING";
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    
    // 2. Gabungkan folder induk dengan folder hasil spesifik
    const baseDir = path.join(process.cwd(), parentFolder, `Results_${ts}`);
    
    const paths = {
        timestamp: ts,
        baseDir: baseDir,
        imgDir: path.join(baseDir, 'Screenshots'),
        pdfDir: path.join(baseDir, 'PDF'),
        videoDir: path.join(baseDir, 'Videos'),
        pdfFile: path.join(baseDir, 'PDF', `Laporan_Pengujian_${ts}.pdf`)
    };
    // 3. Buat semua folder secara rekursif
    // Penggunaan { recursive: true } memastikan folder induk otomatis dibuat jika belum ada
    [paths.pdfDir, paths.imgDir, paths.videoDir].forEach(dir => {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    return paths;
}

/**
 * Fungsi untuk mengklasifikasikan jenis error
 */
export function classifyError(error: any): { type: string; icon: string; suggestion: string } {
    const message = error?.message?.toLowerCase() || '';
    
    // Element/Locator tidak ditemukan
    if (message.includes('locator.click') || message.includes('locator.fill') || 
        message.includes('getbyrole') || message.includes('getbytext') ||
        message.includes('strict mode violation') || message.includes('resolved to') ||
        message.includes('waiting for locator')) {
        return {
            type: 'ELEMENT TIDAK DITEMUKAN',
            icon: '🔍',
            suggestion: 'Periksa kembali selector/locator yang digunakan. Pastikan elemen tersedia di halaman.'
        };
    }
    
    // Button tidak ditemukan
    if (message.includes('button') && (message.includes('not found') || message.includes('no element'))) {
        return {
            type: 'BUTTON TIDAK DITEMUKAN',
            icon: '🔘',
            suggestion: 'Pastikan button dengan nama/role tersebut ada di halaman. Cek apakah ada perubahan UI.'
        };
    }
    
    // File tidak ditemukan
    if (message.includes('enoent') || message.includes('no such file') || 
        message.includes('file not found') || message.includes('cannot find')) {
        return {
            type: 'FILE TIDAK DITEMUKAN',
            icon: '📁',
            suggestion: 'Periksa path file yang digunakan. Pastikan file tersedia di lokasi yang benar.'
        };
    }
    
    // Timeout
    if (message.includes('timeout') || message.includes('exceeded') || 
        message.includes('time out')) {
        return {
            type: 'TIMEOUT - HALAMAN LAMBAT',
            icon: '⏱️',
            suggestion: 'Halaman membutuhkan waktu terlalu lama. Periksa koneksi atau tingkatkan timeout.'
        };
    }
    
    // Web Maintenance / Server Error
    if (message.includes('503') || message.includes('502') || message.includes('500') ||
        message.includes('maintenance') || message.includes('unavailable') ||
        message.includes('service temporarily') || message.includes('under maintenance')) {
        return {
            type: 'WEB SEDANG MAINTENANCE',
            icon: '🔧',
            suggestion: 'Server sedang dalam pemeliharaan. Coba lagi beberapa saat kemudian.'
        };
    }
    
    // Network Error
    if (message.includes('net::') || message.includes('network') || 
        message.includes('connection refused') || message.includes('econnrefused') ||
        message.includes('dns') || message.includes('unreachable')) {
        return {
            type: 'KONEKSI JARINGAN ERROR',
            icon: '🌐',
            suggestion: 'Periksa koneksi jaringan dan pastikan URL dapat diakses.'
        };
    }
    
    // SSL/Certificate Error
    if (message.includes('certificate') || message.includes('ssl') || 
        message.includes('https')) {
        return {
            type: 'ERROR SERTIFIKAT SSL',
            icon: '🔒',
            suggestion: 'Masalah sertifikat SSL. Pastikan ignoreHTTPSErrors: true sudah diaktifkan.'
        };
    }
    
    // Navigation Error
    if (message.includes('navigation') || message.includes('goto') || 
        message.includes('page.goto')) {
        return {
            type: 'NAVIGASI GAGAL',
            icon: '🧭',
            suggestion: 'Gagal membuka halaman. Periksa URL dan pastikan halaman dapat diakses.'
        };
    }
    
    // Default - Error tidak dikenal
    return {
        type: 'ERROR TIDAK DIKENAL',
        icon: '❓',
        suggestion: 'Periksa detail error untuk informasi lebih lanjut.'
    };
}

/**
 * Fungsi Finalisasi: PDF, Video, dan Console Logging (Success/Error)
 */
export async function finalizeTest(
    page: Page, 
    context: BrowserContext, 
    metadata: any, 
    steps: any[], 
    paths: any, 
    error: any = null
) {
    try {
        // 1. Generate PDF (dengan info error jika ada)
        await generatePDF(page, metadata, steps, paths.imgDir, paths.pdfFile, error);
        console.log(`[📄 PDF SAVED]: ${paths.pdfFile}`);

        // 2. Simpan referensi video sebelum context ditutup
        const finalVideoPath = path.join(paths.videoDir, `Video_Execution_${paths.timestamp}.webm`);
        
        // 3. Tutup context terlebih dahulu agar video selesai direkam
        await context.close();
        
        // 4. Simpan video setelah context ditutup
        try {
            await handleVideo(page, finalVideoPath);
            console.log(`[🎥 VIDEO SAVED]: ${finalVideoPath}`);
        } catch (videoError: any) {
            console.warn(`[⚠️ VIDEO WARNING]: Video tidak dapat disimpan - ${videoError.message}`);
        }

        if (error) {
            const errorInfo = classifyError(error);
            console.error(`\n${'═'.repeat(60)}`);
            console.error(`${errorInfo.icon} [${errorInfo.type}]`);
            console.error(`${'═'.repeat(60)}`);
            console.error(`📋 Test Case : ${metadata.testCase}`);
            console.error(`📍 Project   : ${metadata.project}`);
            console.error(`⏰ Waktu     : ${metadata.waktu}`);
            console.error(`${'─'.repeat(60)}`);
            console.error(`❌ Pesan Error:`);
            console.error(`   ${error.message}`);
            console.error(`${'─'.repeat(60)}`);
            console.error(`💡 Saran     : ${errorInfo.suggestion}`);
            console.error(`📂 Hasil di  : ${paths.baseDir}`);
            console.error(`${'═'.repeat(60)}\n`);
        } else {
            console.log(`\n${'═'.repeat(60)}`);
            console.log(`✅ [TEST SUCCESS]`);
            console.log(`${'═'.repeat(60)}`);
            console.log(`📋 Test Case : ${metadata.testCase}`);
            console.log(`📍 Project   : ${metadata.project}`);
            console.log(`⏰ Waktu     : ${metadata.waktu}`);
            console.log(`📂 Hasil di  : ${paths.baseDir}`);
            console.log(`${'═'.repeat(60)}\n`);
        }
    } catch (finalError: any) {
        console.error(`\n${'═'.repeat(60)}`);
        console.error(`🚨 [FATAL ERROR IN FINALIZATION]`);
        console.error(`${'═'.repeat(60)}`);
        console.error(`❌ ${finalError.message}`);
        console.error(`${'═'.repeat(60)}\n`);
    }
}

/**
 * Hitung durasi eksekusi test dari waktu mulai sampai sekarang.
 * Contoh hasil: "2 menit 15 detik"
 */
export function hitungDurasi(startTime: number): string {
    const selisihMs = Date.now() - startTime;
    const totalDetik = Math.floor(selisihMs / 1000);
    const menit = Math.floor(totalDetik / 60);
    const detik = totalDetik % 60;
    return `${menit} menit ${detik} detik`;
}

export function getFormattedTime() {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
}