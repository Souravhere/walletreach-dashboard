export function formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
}

export function calculateElapsedTime(startTime: string | Date): number {
    if (!startTime) return 0;
    const start = new Date(startTime).getTime();
    const now = Date.now();
    return Math.floor((now - start) / 1000);
}

export function calculateRemainingTime(
    totalWallets: number,
    processedWallets: number,
    averageTxTime: number
): number {
    if (processedWallets === 0 || !averageTxTime) return 0;
    const remaining = totalWallets - processedWallets;
    return Math.floor(remaining * averageTxTime);
}
