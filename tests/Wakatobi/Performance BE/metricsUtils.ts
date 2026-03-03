/**
 * =========================================
 * METRICS UTILITIES
 * =========================================
 * Utility functions untuk mengelola metrics performance test
 * Termasuk: file-based storage, aggregation, cleanup
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    UserMetricsData,
    calculatePercentile,
    calculateStdDeviation,
} from './performance.config';

// =========================================
// CONSTANTS & PATHS
// =========================================
export const METRICS_DIR = path.join(__dirname, '../../test-results/performance-metrics');
export const getMetricsFile = (userId: number) => path.join(METRICS_DIR, `user_${userId}_metrics.json`);
export const START_TIME_FILE = path.join(METRICS_DIR, 'test_start_time.txt');
export const CLEANUP_MARKER_FILE = path.join(METRICS_DIR, '.cleanup_done');
export const REPORT_GENERATED_FILE = path.join(METRICS_DIR, '.report_generated');

// =========================================
// INTERFACES
// =========================================
export interface UserMetrics {
    userId: number;
    responseTimes: number[];
    errorResponseTimes: number[]; // Tambahan: simpan response time error
    successCount: number;
    failCount: number;
    iterations: number;
}

// =========================================
// DIRECTORY MANAGEMENT
// =========================================

/**
 * Pastikan direktori metrics ada
 */
export function ensureMetricsDir(): void {
    if (!fs.existsSync(METRICS_DIR)) {
        fs.mkdirSync(METRICS_DIR, { recursive: true });
    }
}

// =========================================
// SHARED START TIME FUNCTIONS
// =========================================

/**
 * Get shared test start time (untuk sinkronisasi antar workers)
 */
export function getSharedStartTime(): number {
    ensureMetricsDir();
    try {
        if (fs.existsSync(START_TIME_FILE)) {
            return parseInt(fs.readFileSync(START_TIME_FILE, 'utf-8').trim(), 10);
        }
    } catch (e) {
        // ignore
    }
    // If no start time file, create one
    const now = Date.now();
    fs.writeFileSync(START_TIME_FILE, now.toString());
    return now;
}

/**
 * Set shared test start time
 */
export function setSharedStartTime(): number {
    ensureMetricsDir();
    const now = Date.now();
    // Only set if not already exists (first worker sets it)
    if (!fs.existsSync(START_TIME_FILE)) {
        fs.writeFileSync(START_TIME_FILE, now.toString());
    }
    return getSharedStartTime();
}

// =========================================
// METRICS SAVE/LOAD FUNCTIONS
// =========================================

/**
 * Save user metrics to file
 */
export function saveUserMetrics(metrics: UserMetrics): void {
    ensureMetricsDir();
    try {
        fs.writeFileSync(getMetricsFile(metrics.userId), JSON.stringify(metrics, null, 2));
        console.log(`[Metrics] Saved metrics for user ${metrics.userId}: ${metrics.successCount} success, ${metrics.failCount} fail, ${metrics.errorResponseTimes ? metrics.errorResponseTimes.length : 0} error response times`);
    } catch (e) {
        console.error(`[Metrics] Failed to save metrics for user ${metrics.userId}:`, e);
    }
}

/**
 * Load all user metrics and aggregate
 */
export function aggregateAllMetrics(): { 
    responseTimes: number[]; 
    errorResponseTimes: number[];
    successCount: number; 
    failCount: number; 
    activeUsers: number; 
    perUserMetrics: UserMetricsData[] 
} {
    ensureMetricsDir();
    const responseTimes: number[] = [];
    let successCount = 0;
    let failCount = 0;
    let activeUsers = 0;
    const perUserMetrics: UserMetricsData[] = [];
    const errorResponseTimes: number[] = [];

    const files = fs.readdirSync(METRICS_DIR).filter(f => f.startsWith('user_') && f.endsWith('_metrics.json'));
    
    console.log(`[Metrics] Found ${files.length} user metrics files to aggregate`);
    
    for (const file of files) {
        try {
            const data: UserMetrics = JSON.parse(fs.readFileSync(path.join(METRICS_DIR, file), 'utf-8'));
            console.log(`[Metrics] Reading ${file}: ${data.successCount} success, ${data.failCount} fail, ${data.responseTimes.length} response times, ${data.errorResponseTimes ? data.errorResponseTimes.length : 0} error response times`);
            responseTimes.push(...data.responseTimes);
            if (data.errorResponseTimes) errorResponseTimes.push(...data.errorResponseTimes);
            successCount += data.successCount;
            failCount += data.failCount;
            // Count users yang benar-benar aktif (punya iterasi)
            if (data.iterations > 0 || data.responseTimes.length > 0) {
                activeUsers++;
                // Calculate per-user metrics
                const userTotalTime = data.responseTimes.length > 0 
                    ? data.responseTimes.reduce((a, b) => a + b, 0) 
                    : 0;
                const userAvgTime = data.responseTimes.length > 0 
                    ? userTotalTime / data.responseTimes.length 
                    : 0;
                const userTotalRequests = data.successCount + data.failCount;
                // Hitung error response time user
                const userErrorAvg = data.errorResponseTimes && data.errorResponseTimes.length > 0
                    ? data.errorResponseTimes.reduce((a, b) => a + b, 0) / data.errorResponseTimes.length
                    : 0;
                perUserMetrics.push({
                    userId: data.userId,
                    samples: userTotalRequests,
                    avgResponseTime: userAvgTime,
                    minResponseTime: data.responseTimes.length > 0 ? Math.min(...data.responseTimes) : 0,
                    maxResponseTime: data.responseTimes.length > 0 ? Math.max(...data.responseTimes) : 0,
                    stdDeviation: calculateStdDeviation(data.responseTimes, userAvgTime),
                    errorRate: userTotalRequests > 0 ? (data.failCount / userTotalRequests) * 100 : 0,
                    throughput: userTotalRequests > 0 ? userTotalRequests / (userTotalTime / 1000 || 1) : 0,
                    totalTime: userTotalTime,
                    p95: calculatePercentile(data.responseTimes, 95),
                    errorAvgResponseTime: userErrorAvg,
                });
            }
        } catch (e) {
            console.error(`Failed to read ${file}:`, e);
        }
    }

    // Sort per-user metrics by userId
    perUserMetrics.sort((a, b) => a.userId - b.userId);

    console.log(`[Metrics] Total aggregated: ${successCount} success, ${failCount} fail, ${responseTimes.length} response times, ${activeUsers} active users, ${errorResponseTimes.length} error response times`);
    return { responseTimes, errorResponseTimes, successCount, failCount, activeUsers, perUserMetrics };
}

// =========================================
// CLEANUP FUNCTIONS
// =========================================

/**
 * Clean up metrics files
 */
export function cleanupMetrics(cleanStartTime: boolean = false): void {
    if (fs.existsSync(METRICS_DIR)) {
        const files = fs.readdirSync(METRICS_DIR).filter(f => f.startsWith('user_') && f.endsWith('_metrics.json'));
        for (const file of files) {
            try {
                fs.unlinkSync(path.join(METRICS_DIR, file));
            } catch (e) {
                // ignore
            }
        }
        // Also clean start time file if requested
        if (cleanStartTime) {
            try {
                if (fs.existsSync(START_TIME_FILE)) fs.unlinkSync(START_TIME_FILE);
                if (fs.existsSync(CLEANUP_MARKER_FILE)) fs.unlinkSync(CLEANUP_MARKER_FILE);
            } catch (e) {
                // ignore
            }
        }
    }
}

/**
 * Smart cleanup - only runs once per test session
 */
export function smartCleanup(): void {
    ensureMetricsDir();
    // Check if cleanup was already done by another worker
    if (fs.existsSync(CLEANUP_MARKER_FILE)) {
        const markerTime = parseInt(fs.readFileSync(CLEANUP_MARKER_FILE, 'utf-8').trim(), 10);
        // If marker is less than 5 minutes old, skip cleanup
        if (Date.now() - markerTime < 5 * 60 * 1000) {
            console.log('[Metrics] Cleanup already done by another worker, skipping...');
            return;
        }
    }
    // Do cleanup and mark it done
    console.log('[Metrics] Performing cleanup of old metrics files...');
    cleanupMetrics(true);
    // Also remove report generated marker
    try {
        if (fs.existsSync(REPORT_GENERATED_FILE)) fs.unlinkSync(REPORT_GENERATED_FILE);
    } catch (e) {
        // ignore
    }
    fs.writeFileSync(CLEANUP_MARKER_FILE, Date.now().toString());
}

// =========================================
// REPORT GENERATION LOCK
// =========================================

/**
 * Check apakah worker ini boleh generate report
 * Hanya 1 worker yang boleh generate report untuk menghindari duplikasi
 * Returns: true jika worker ini boleh generate, false jika sudah di-generate worker lain
 */
export function canGenerateReport(): boolean {
    ensureMetricsDir();
    
    // Check if report was already generated
    if (fs.existsSync(REPORT_GENERATED_FILE)) {
        const markerTime = parseInt(fs.readFileSync(REPORT_GENERATED_FILE, 'utf-8').trim(), 10);
        // If marker is less than 5 minutes old, report sudah di-generate
        if (Date.now() - markerTime < 5 * 60 * 1000) {
            console.log('[Report] Report already generated by another worker, skipping...');
            return false;
        }
    }
    
    // Mark that this worker will generate the report
    fs.writeFileSync(REPORT_GENERATED_FILE, Date.now().toString());
    console.log('[Report] This worker will generate the report...');
    return true;
}

/**
 * Get report directory path (konsisten untuk semua workers)
 * Menggunakan shared start time untuk nama folder agar semua workers pakai folder yang sama
 */
export function getReportDir(testType: string): string {
    const sharedStartTime = getSharedStartTime();
    const timestamp = new Date(sharedStartTime).toISOString().replace(/[:.]/g, '-');
    return path.join(__dirname, '../../Report Testing PKD DIDD', `Performance_${testType}_${timestamp}`);
}
