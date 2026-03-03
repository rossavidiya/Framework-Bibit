// utils/reporting.ts
import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import path from 'path';

/**
 * Fungsi untuk mengklasifikasikan jenis error (untuk PDF)
 */
function classifyErrorForPDF(error: any): { type: string; icon: string; suggestion: string } {
    const message = error?.message?.toLowerCase() || '';
    
    if (message.includes('locator.click') || message.includes('locator.fill') || 
        message.includes('getbyrole') || message.includes('getbytext') ||
        message.includes('strict mode violation') || message.includes('waiting for locator')) {
        return {
            type: 'ELEMENT TIDAK DITEMUKAN',
            icon: '🔍',
            suggestion: 'Periksa kembali selector/locator yang digunakan. Pastikan elemen tersedia di halaman.'
        };
    }
    
    if (message.includes('button') && (message.includes('not found') || message.includes('no element'))) {
        return {
            type: 'BUTTON TIDAK DITEMUKAN',
            icon: '🔘',
            suggestion: 'Pastikan button dengan nama/role tersebut ada di halaman.'
        };
    }
    
    if (message.includes('enoent') || message.includes('no such file') || message.includes('file not found')) {
        return {
            type: 'FILE TIDAK DITEMUKAN',
            icon: '📁',
            suggestion: 'Periksa path file yang digunakan.'
        };
    }
    
    if (message.includes('timeout') || message.includes('exceeded')) {
        return {
            type: 'TIMEOUT - HALAMAN LAMBAT',
            icon: '⏱️',
            suggestion: 'Halaman membutuhkan waktu terlalu lama. Periksa koneksi atau tingkatkan timeout.'
        };
    }
    
    if (message.includes('503') || message.includes('502') || message.includes('500') ||
        message.includes('maintenance') || message.includes('unavailable')) {
        return {
            type: 'WEB SEDANG MAINTENANCE',
            icon: '🔧',
            suggestion: 'Server sedang dalam pemeliharaan. Coba lagi beberapa saat kemudian.'
        };
    }
    
    if (message.includes('net::') || message.includes('network') || message.includes('connection refused')) {
        return {
            type: 'KONEKSI JARINGAN ERROR',
            icon: '🌐',
            suggestion: 'Periksa koneksi jaringan dan pastikan URL dapat diakses.'
        };
    }
    
    return {
        type: 'ERROR TIDAK DIKENAL',
        icon: '❓',
        suggestion: 'Periksa detail error untuk informasi lebih lanjut.'
    };
}

export async function generatePDF(page: Page, metadata: any, steps: any[], imgDir: string, pdfPath: string, error: any = null) {
    const status = error ? 'GAGAL ❌' : 'SUKSES ✅';
    const statusColor = error ? '#d32f2f' : '#388e3c';
    const statusBg = error ? '#ffebee' : '#e8f5e9';
    
    // Klasifikasi error jika ada
    const errorInfo = error ? classifyErrorForPDF(error) : null;

    // Buat HTML untuk langkah-langkah dengan pengecekan file
    const stepsHtml = steps.map((s, i) => {
        const imgPath = path.join(imgDir, s.file);
        let imgTag = '<p style="color:#999; text-align:center;">Screenshot tidak tersedia</p>';
        if (fs.existsSync(imgPath)) {
            imgTag = `<img src="data:image/png;base64,${fs.readFileSync(imgPath).toString('base64')}">`;
        }
        return `
          <div class="step-box">
            <div class="step-title">Langkah ${i + 1}: ${s.name}</div>
            <div class="step-desc"><strong>Deskripsi:</strong> ${s.description}</div>
            ${imgTag}
          </div>
        `;
    }).join('');

    const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { border-bottom: 4px solid #004d40; margin-bottom: 30px; padding-bottom: 10px; }
          .status-box { font-size: 22px; font-weight: bold; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 20px; color: ${statusColor}; background: ${statusBg}; border: 2px solid ${statusColor}; }
          .meta-table { width: 100%; margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
          .meta-table td { padding: 5px 10px; }
          .label { font-weight: bold; width: 180px; color: #004d40; }
          .step-box { margin-bottom: 50px; page-break-after: always; border: 1px solid #eee; padding: 20px; border-radius: 10px; }
          .step-title { font-size: 20px; color: #004d40; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .step-desc { font-style: italic; color: #666; margin-bottom: 15px; background: #fffde7; padding: 10px; border-left: 4px solid #fbc02d; }
          img { width: 100%; border-radius: 5px; border: 1px solid #ddd; }
          .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; }
          .error-box { background: #ffebee; border: 2px solid #d32f2f; color: #c62828; padding: 20px; margin: 20px 0; border-radius: 8px; page-break-inside: avoid; }
          .error-box h3 { margin-top: 0; color: #b71c1c; font-size: 18px; }
          .error-type { background: #d32f2f; color: white; padding: 8px 15px; border-radius: 5px; display: inline-block; margin-bottom: 15px; font-weight: bold; }
          .error-message { background: #fff; padding: 15px; border-radius: 5px; border-left: 4px solid #d32f2f; margin: 10px 0; font-family: monospace; white-space: pre-wrap; word-wrap: break-word; font-size: 12px; }
          .suggestion-box { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px 15px; margin-top: 15px; border-radius: 0 5px 5px 0; }
          .suggestion-box strong { color: #e65100; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>E-REPORT AUTOMATION TESTING</h1>
          <p>Laporan Pengujian PKD-DDID - ${metadata.project}</p>
        </div>
        <div class="status-box">STATUS: ${status}</div>
        <table class="meta-table">
          <tr><td class="label">Nama Test Case</td><td>: ${metadata.testCase}</td></tr>
          <tr><td class="label">Tester</td><td>: ${metadata.tester} (${metadata.role})</td></tr>
          <tr><td class="label">Instansi</td><td>: ${metadata.instansi}</td></tr>
          <tr><td class="label">Waktu Eksekusi</td><td>: ${metadata.waktu}</td></tr>
          <tr><td class="label">Durasi Test</td><td>: ${metadata.durasi || 'N/A'}</td></tr>
          <tr><td class="label">Jumlah Langkah</td><td>: ${steps.length} langkah berhasil direkam</td></tr>
        </table>
        ${error && errorInfo ? `
          <div class="error-box">
            <div class="error-type">${errorInfo.icon} ${errorInfo.type}</div>
            <h3>🚨 Detail Kegagalan:</h3>
            <div class="error-message">${error.message || error}</div>
            <div class="suggestion-box">
              <strong>💡 Saran Perbaikan:</strong><br>
              ${errorInfo.suggestion}
            </div>
          </div>
        ` : ''}
        ${stepsHtml}
        <div class="footer"> Dokumen ini dibuat secara otomatis oleh sistem Playwright Automation PKD DDID. </div>
      </body>
    </html>`;

    await page.setContent(htmlContent);
    await page.pdf({ path: pdfPath, format: 'A4', printBackground: true, margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' } });
}

export async function handleVideo(page: Page, videoPath: string) {
    const video = page.video();
    if (video) {
        // Menggunakan saveAs agar kompatibel dengan koneksi remote/internal BI
        await video.saveAs(videoPath);
    }
}