/**
 * =========================================
 * PERFORMANCE TEST CONFIGURATION
 * =========================================
 * Konfigurasi untuk berbagai jenis performance testing:
 * - Load Testing: Menguji performa dengan beban normal
 * - Stress Testing: Menguji batas maksimal sistem
 * - Spike Testing: Menguji respons terhadap lonjakan tiba-tiba
 * - Endurance Testing: Menguji stabilitas dalam waktu lama
 */

export interface PerformanceConfig {
    // Jumlah virtual users
    virtualUsers: number;
    // Users yang masuk per detik (ramp-up rate)
    usersPerSecond: number;
    // Durasi test dalam detik
    durationSeconds: number;
    // Delay antar iterasi per user (ms)
    iterationDelayMs: number;
    // Nama test type
    testType: 'load' | 'stress' | 'spike' | 'endurance';
    // Target URL
    baseUrl: string;
    // Think time (waktu jeda antara aksi, simulasi user nyata)
    thinkTimeMs: number;
    // Timeout settings
    navigationTimeout: number;
    actionTimeout: number;
}

// =========================================
// PRESET CONFIGURATIONS
// Ubah nilai sesuai kebutuhan pengujian
// =========================================

/**
 * LOAD TESTING CONFIG
 * Simulasi beban normal dengan jumlah user yang diharapkan
 * Tujuan: Memastikan sistem perform dengan baik pada beban normal
 */
export const LOAD_TEST_CONFIG: PerformanceConfig = {
    virtualUsers: 10,           // 10 virtual users
    usersPerSecond: 1,          // 2 user masuk per detik
    durationSeconds: 60,        // Durasi 1 menit
    iterationDelayMs: 5000,     // Delay 5 detik antar iterasi
    testType: 'load',
    baseUrl: 'https://wakatobi.corp.bi.go.id:8443/',
    thinkTimeMs: 2000,          // Think time 2 detik
    navigationTimeout: 60000,
    actionTimeout: 15000,
};

/**
 * STRESS TESTING CONFIG
 * Simulasi beban tinggi melebihi kapasitas normal
 * Tujuan: Menemukan titik breaking point sistem
 */
export const STRESS_TEST_CONFIG: PerformanceConfig = {
    virtualUsers: 1000,           // 50 virtual users
    usersPerSecond: 20,          // 5 user masuk per detik
    durationSeconds: 300,       // Durasi 5 menit
    iterationDelayMs: 2000,     // Delay 2 detik antar iterasi
    testType: 'stress',
    baseUrl: 'https://wakatobi.corp.bi.go.id:8443/',
    thinkTimeMs: 1000,          // Think time 1 detik
    navigationTimeout: 90000,
    actionTimeout: 30000,
};

/**
 * SPIKE TESTING CONFIG
 * Simulasi lonjakan tiba-tiba dalam waktu singkat
 * Tujuan: Menguji ketahanan sistem terhadap traffic burst
 */
export const SPIKE_TEST_CONFIG: PerformanceConfig = {
    virtualUsers: 100,          // 100 virtual users
    usersPerSecond: 20,         // 20 user masuk per detik (burst)
    durationSeconds: 60,        // Durasi 1 menit saja
    iterationDelayMs: 1000,     // Delay 1 detik antar iterasi
    testType: 'spike',
    baseUrl: 'https://wakatobi.corp.bi.go.id:8443/',
    thinkTimeMs: 500,           // Think time 0.5 detik
    navigationTimeout: 120000,
    actionTimeout: 45000,
};

/**
 * ENDURANCE TESTING CONFIG
 * Simulasi beban stabil dalam waktu lama
 * Tujuan: Mendeteksi memory leak dan degradasi performa
 */
export const ENDURANCE_TEST_CONFIG: PerformanceConfig = {
    virtualUsers: 20,           // 20 virtual users
    usersPerSecond: 1,          // 1 user masuk per detik
    durationSeconds: 3600,      // Durasi 1 jam
    iterationDelayMs: 10000,    // Delay 10 detik antar iterasi
    testType: 'endurance',
    baseUrl: 'https://wakatobi.corp.bi.go.id:8443/',
    thinkTimeMs: 3000,          // Think time 3 detik
    navigationTimeout: 60000,
    actionTimeout: 15000,
};

// =========================================
// CUSTOM CONFIG - Untuk konfigurasi manual
// =========================================
export const CUSTOM_CONFIG: PerformanceConfig = {
    virtualUsers: 100,            // Ubah sesuai kebutuhan
    usersPerSecond: 1,          // Ubah sesuai kebutuhan
    durationSeconds: 1,        // Ubah sesuai kebutuhan
    iterationDelayMs: 3000,     // Ubah sesuai kebutuhan
    testType: 'load',           // 'load' | 'stress' | 'spike' | 'endurance'
    baseUrl: 'https://wakatobi.corp.bi.go.id:8443/',
    thinkTimeMs: 1000,
    navigationTimeout: 60000,
    actionTimeout: 15000,
};

// =========================================
// PILIH CONFIG YANG AKTIF DI SINI
// =========================================
// Ubah ini untuk memilih jenis test yang dijalankan
// Opsi: LOAD_TEST_CONFIG, STRESS_TEST_CONFIG, SPIKE_TEST_CONFIG, ENDURANCE_TEST_CONFIG, CUSTOM_CONFIG
export const ACTIVE_CONFIG: PerformanceConfig =STRESS_TEST_CONFIG;

// =========================================
// METRICS INTERFACE
// =========================================
export interface PerformanceMetrics {
        errorAvgResponseTime?: number; // Tambahan: rata-rata response time error
    testType: string;
    startTime: number;
    endTime: number;
    virtualUsers: number;           // Jumlah virtual users yang hit
    activeUsers: number;            // Jumlah user yang benar-benar jalan
    totalRequests: number;          // Samples
    successfulRequests: number;
    failedRequests: number;
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    totalResponseTime: number;      // Sum total semua response time
    stdDeviation: number;           // Standard Deviation
    requestsPerSecond: number;      // Throughput
    errorRate: number;
    p50ResponseTime: number;
    p90ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    userMetrics?: UserMetricsData[];  // Per-user metrics untuk summary table
}

// Interface untuk menyimpan metrics per user
export interface UserMetricsData {
        errorAvgResponseTime?: number; // Tambahan: rata-rata response time error per user
    userId: number;
    samples: number;
    avgResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    stdDeviation: number;
    errorRate: number;
    throughput: number;
    totalTime: number;
    p95: number;
}

// =========================================
// HELPER FUNCTIONS
// =========================================

/**
 * Calculate percentile from array of numbers
 */
export function calculatePercentile(arr: number[], percentile: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

/**
 * Calculate Standard Deviation
 */
export function calculateStdDeviation(arr: number[], mean: number): number {
    if (arr.length === 0) return 0;
    const squaredDiffs = arr.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate performance metrics from response times
 */
export function calculateMetrics(
    responseTimes: number[],
    successCount: number,
    failCount: number,
    testType: string,
    startTime: number,
    endTime: number,
    virtualUsers: number = 1,
    activeUsers: number = 0,
    errorResponseTimes?: number[]
): PerformanceMetrics {
    const totalRequests = successCount + failCount;
    const durationSeconds = (endTime - startTime) / 1000;
    const totalResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) 
        : 0;
    const avgResponseTime = responseTimes.length > 0 
        ? totalResponseTime / responseTimes.length 
        : 0;
    
    const errorAvgResponseTime = errorResponseTimes && errorResponseTimes.length > 0
        ? errorResponseTimes.reduce((a, b) => a + b, 0) / errorResponseTimes.length
        : 0;
    return {
        testType,
        startTime,
        endTime,
        virtualUsers,
        activeUsers: activeUsers || responseTimes.length > 0 ? Math.max(activeUsers, 1) : 0,
        totalRequests,
        successfulRequests: successCount,
        failedRequests: failCount,
        avgResponseTime,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        totalResponseTime,
        stdDeviation: calculateStdDeviation(responseTimes, avgResponseTime),
        requestsPerSecond: durationSeconds > 0 ? totalRequests / durationSeconds : 0,
        errorRate: totalRequests > 0 ? (failCount / totalRequests) * 100 : 0,
        p50ResponseTime: calculatePercentile(responseTimes, 50),
        p90ResponseTime: calculatePercentile(responseTimes, 90),
        p95ResponseTime: calculatePercentile(responseTimes, 95),
        p99ResponseTime: calculatePercentile(responseTimes, 99),
        errorAvgResponseTime,
    };
}

/**
 * Format metrics untuk reporting
 */
export function formatMetricsReport(metrics: PerformanceMetrics): string {
    const duration = (metrics.endTime - metrics.startTime) / 1000;
    
    // Format Total Response Time in appropriate unit
    const formatTotalTime = (ms: number): string => {
        if (ms >= 60000) {
            const minutes = Math.floor(ms / 60000);
            const seconds = ((ms % 60000) / 1000).toFixed(2);
            return `${minutes}m ${seconds}s (${ms.toFixed(0)} ms)`;
        } else if (ms >= 1000) {
            return `${(ms / 1000).toFixed(2)} s (${ms.toFixed(0)} ms)`;
        }
        return `${ms.toFixed(2)} ms`;
    };

    // Generate summary table rows berdasarkan jumlah user yang aktif
    const generateUserRows = (): string => {
        let rows = '';
        
        // Jika ada user metrics per-user, tampilkan masing-masing
        if (metrics.userMetrics && metrics.userMetrics.length > 0) {
            for (const user of metrics.userMetrics) {
                const label = `User ${user.userId}`.padEnd(20);
                rows += `│ ${label}│ ${user.samples.toString().padStart(8)} │ ${user.avgResponseTime.toFixed(0).toString().padStart(8)} │ ${user.minResponseTime.toFixed(0).toString().padStart(8)} │ ${user.maxResponseTime.toFixed(0).toString().padStart(8)} │ ${user.stdDeviation.toFixed(0).toString().padStart(8)} │ ${(user.errorRate.toFixed(2) + '%').padStart(8)} │ ${(user.throughput.toFixed(2) + '/s').padStart(8)} │ ${(user.totalTime.toFixed(0) + 'ms').padStart(9)} │ ${user.p95.toFixed(0).toString().padStart(8)} │\n`;
                rows += `├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────────┼──────────┤\n`;
            }
        } else {
            // Fallback: tampilkan single row jika tidak ada per-user metrics
            rows += `│ Edit Wakatobi       │ ${metrics.totalRequests.toString().padStart(8)} │ ${metrics.avgResponseTime.toFixed(0).toString().padStart(8)} │ ${metrics.minResponseTime.toFixed(0).toString().padStart(8)} │ ${metrics.maxResponseTime.toFixed(0).toString().padStart(8)} │ ${metrics.stdDeviation.toFixed(0).toString().padStart(8)} │ ${(metrics.errorRate.toFixed(2) + '%').padStart(8)} │ ${(metrics.requestsPerSecond.toFixed(2) + '/s').padStart(8)} │ ${(metrics.totalResponseTime.toFixed(0) + 'ms').padStart(9)} │ ${metrics.p95ResponseTime.toFixed(0).toString().padStart(8)} │\n`;
            rows += `├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────────┼──────────┤\n`;
        }
        
        return rows;
    };
    
    return `
╔════════════════════════════════════════════════════════════════════════════╗
║                       PERFORMANCE STRESS TEST REPORT                       ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Label            : ${('Edit Wakatobi - ' + metrics.testType.toUpperCase()).padEnd(54)}║
║ Test Type        : ${metrics.testType.toUpperCase().padEnd(54)}║
║ Duration         : ${(duration.toFixed(2) + ' seconds').padEnd(54)}║
║ Start Time       : ${new Date(metrics.startTime).toISOString().padEnd(54)}║
║ End Time         : ${new Date(metrics.endTime).toISOString().padEnd(54)}║
╠════════════════════════════════════════════════════════════════════════════╣
║                          THREAD/USER SUMMARY                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Virtual Users    : ${(metrics.virtualUsers + ' users (configured)').padEnd(54)}║
║ Active Users     : ${((metrics.activeUsers || metrics.totalRequests) + ' users (actual executed)').padEnd(54)}║
╠════════════════════════════════════════════════════════════════════════════╣
║                         AGGREGATE REPORT                                   ║
╠════════════════════════════════════════════════════════════════════════════╣
║ # Samples        : ${metrics.totalRequests.toString().padEnd(54)}║
║ # Successful     : ${metrics.successfulRequests.toString().padEnd(54)}║
║ # Failed         : ${metrics.failedRequests.toString().padEnd(54)}║
║ Error %          : ${(metrics.errorRate.toFixed(2) + ' %').padEnd(54)}║
║ Error Avg Resp   : ${(metrics.errorAvgResponseTime?.toFixed(2) ?? '-').padEnd(54)}║
╠════════════════════════════════════════════════════════════════════════════╣
║                           RESPONSE TIME (ms)                               ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Average          : ${(metrics.avgResponseTime.toFixed(2) + ' ms').padEnd(54)}║
║ Min              : ${(metrics.minResponseTime.toFixed(2) + ' ms').padEnd(54)}║
║ Max              : ${(metrics.maxResponseTime.toFixed(2) + ' ms').padEnd(54)}║
║ Std. Deviation   : ${(metrics.stdDeviation.toFixed(2) + ' ms').padEnd(54)}║
║ Total Resp Time  : ${formatTotalTime(metrics.totalResponseTime).padEnd(54)}║
╠════════════════════════════════════════════════════════════════════════════╣
║                         PERCENTILES (Response Time)                        ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Median (P50)     : ${(metrics.p50ResponseTime.toFixed(2) + ' ms').padEnd(54)}║
║ P90              : ${(metrics.p90ResponseTime.toFixed(2) + ' ms').padEnd(54)}║
║ P95              : ${(metrics.p95ResponseTime.toFixed(2) + ' ms').padEnd(54)}║
║ P99              : ${(metrics.p99ResponseTime.toFixed(2) + ' ms').padEnd(54)}║
╠════════════════════════════════════════════════════════════════════════════╣
║                             THROUGHPUT                                     ║
╠════════════════════════════════════════════════════════════════════════════╣
║ Throughput       : ${(metrics.requestsPerSecond.toFixed(4) + ' req/sec').padEnd(54)}║
║ Avg Throughput   : ${((metrics.totalRequests / (duration || 1)).toFixed(4) + ' req/sec').padEnd(54)}║
╚════════════════════════════════════════════════════════════════════════════╝

══════════ SUMMARY TABLE (JMeter Aggregate Report Style) ══════════
┌─────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┬───────────┬──────────┐
│ Label               │ # Samples│ Average  │ Min      │ Max      │ Std.Dev  │ Error %  │ Throughput│ Total Time│ P95      │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┼───────────┼──────────┤
${generateUserRows()}│ TOTAL               │ ${metrics.totalRequests.toString().padStart(8)} │ ${metrics.avgResponseTime.toFixed(0).toString().padStart(8)} │ ${metrics.minResponseTime.toFixed(0).toString().padStart(8)} │ ${metrics.maxResponseTime.toFixed(0).toString().padStart(8)} │ ${metrics.stdDeviation.toFixed(0).toString().padStart(8)} │ ${(metrics.errorRate.toFixed(2) + '%').padStart(8)} │ ${(metrics.requestsPerSecond.toFixed(2) + '/s').padStart(8)} │ ${(metrics.totalResponseTime.toFixed(0) + 'ms').padStart(9)} │ ${metrics.p95ResponseTime.toFixed(0).toString().padStart(8)} │
└─────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┴───────────┴──────────┘
`;
}

/**
 * Sleep function
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get config by test type name
 */
export function getConfigByType(testType: 'load' | 'stress' | 'spike' | 'endurance'): PerformanceConfig {
    switch (testType) {
        case 'load': return LOAD_TEST_CONFIG;
        case 'stress': return STRESS_TEST_CONFIG;
        case 'spike': return SPIKE_TEST_CONFIG;
        case 'endurance': return ENDURANCE_TEST_CONFIG;
        default: return LOAD_TEST_CONFIG;
    }
}
