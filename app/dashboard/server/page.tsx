'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import { systemAPI } from '@/lib/api';
import {
     XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    RiServerLine,
    RiCpuLine,
    RiDatabase2Line,
    RiHardDrive2Line,
    RiWifiLine,
    RiTerminalBoxLine,
    RiCheckboxCircleLine,
    RiErrorWarningLine,
    RiTimeLine
} from 'react-icons/ri';

export default function ServerPage() {
    const [stats, setStats] = useState<any>(null);
    const [realtime, setRealtime] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
        const statsInterval = setInterval(fetchStats, 30000); // Refresh every 30s
        const realtimeInterval = setInterval(fetchRealtime, 5000); // Poll every 5s

        return () => {
            clearInterval(statsInterval);
            clearInterval(realtimeInterval);
        };
    }, []);

    const fetchStats = async () => {
        try {
            const response = await systemAPI.getStats();
            setStats(response.data);
            setError('');
        } catch (error: any) {
            setError('Failed to fetch server stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchRealtime = async () => {
        try {
            const response = await systemAPI.getRealtime();
            setRealtime(prev => [...prev.slice(-20), response.data]); // Keep last 20 data points
        } catch (error) {
            //  Silent fail for realtime
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full"
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-semibold text-white">Server Monitor</h1>
                            <p className="text-gray-500 text-sm mt-1">{stats?.system.hostname}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Badge variant={stats?.application.dbStatus === 'connected' ? 'success' : 'error'}>
                            DB: {stats?.application.dbStatus}
                        </Badge>
                        <Badge variant={stats?.application.rpcStatus === 'connected' ? 'success' : 'error'}>
                            RPC: {stats?.application.rpcStatus}
                        </Badge>
                    </div>
                </header>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        icon={RiCpuLine}
                        label="CPU Usage"
                        value={`${stats?.cpu.usage}%`}
                        color="blue"
                        sub={`${stats?.cpu.cores} cores`}
                    />
                    <MetricCard
                        icon={RiDatabase2Line}
                        label="Memory"
                        value={`${stats?.memory.usagePercent}%`}
                        color="purple"
                        sub={`${formatBytes(stats?.memory.used)} / ${formatBytes(stats?.memory.total)}`}
                    />
                    <MetricCard
                        icon={RiHardDrive2Line}
                        label="Disk Usage"
                        value={`${stats?.disk.usagePercent}%`}
                        color="amber"
                        sub={`${formatBytes(stats?.disk.free)} free`}
                    />
                    <MetricCard
                        icon={RiWifiLine}
                        label="Network"
                        value={formatBytes(stats?.network.traffic.sentSec)}
                        color="green"
                        sub="Upload/sec"
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <Card variant="luxury" padding="lg">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">CPU Usage Over Time</h3>
                        <div className="h-64">
                            {realtime.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={realtime}>
                                        <defs>
                                            <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            labelStyle={{ color: '#9ca3af' }}
                                        />
                                        <Area type="monotone" dataKey="cpu.usage" stroke="#3b82f6" strokeWidth={2} fill="url(#cpuGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-600">Loading chart data...</div>
                            )}
                        </div>
                    </Card>

                    <Card variant="luxury" padding="lg">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Memory Usage Over Time</h3>
                        <div className="h-64">
                            {realtime.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={realtime}>
                                        <defs>
                                            <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="timestamp" hide />
                                        <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                            labelStyle={{ color: '#9ca3af' }}
                                        />
                                        <Area type="monotone" dataKey="memory.usagePercent" stroke="#8b5cf6" strokeWidth={2} fill="url(#memGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-600">Loading chart data...</div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card variant="luxury" padding="lg">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <RiServerLine /> System Information
                        </h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="OS" value={`${stats?.system.distro} ${stats?.system.release}`} />
                            <InfoRow label="Kernel" value={stats?.system.kernel} />
                            <InfoRow label="Architecture" value={stats?.system.arch} />
                            <InfoRow label="Uptime" value={formatUptime(stats?.system.uptime)} />
                            <InfoRow label="Node Version" value={stats?.application.nodeVersion} />
                            <InfoRow label="Environment" value={stats?.application.env} />
                        </div>
                    </Card>

                    <Card variant="luxury" padding="lg">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <RiWifiLine /> Network
                        </h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Public IP" value={stats?.network.publicIP} />
                            <InfoRow label="Private IP" value={stats?.network.privateIP} />
                            <InfoRow label="Interface" value={stats?.network.interface} />
                            <InfoRow label="Sent" value={formatBytes(stats?.network.traffic.sent)} />
                            <InfoRow label="Received" value={formatBytes(stats?.network.traffic.received)} />
                        </div>
                    </Card>

                    <Card variant="luxury" padding="lg">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <RiTerminalBoxLine /> Top Processes
                        </h3>
                        <div className="space-y-3 text-xs">
                            {stats?.processes.topCPU?.slice(0, 5).map((proc: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white/[0.02] rounded-lg">
                                    <span className="text-gray-300 truncate flex-1">{proc.name}</span>
                                    <span className="text-blue-400 font-mono">{proc.cpu}%</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {stats?.application.pm2Processes?.length > 0 && (
                    <Card variant="luxury" padding="lg">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">PM2 Processes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.application.pm2Processes.map((proc: any, idx: number) => (
                                <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-bold text-white">{proc.name}</span>
                                        <Badge variant={proc.status === 'online' ? 'success' : 'error'}>
                                            {proc.status}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-400">
                                        <div className="flex justify-between">
                                            <span>CPU:</span>
                                            <span className="text-blue-400">{proc.cpu}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Memory:</span>
                                            <span className="text-purple-400">{formatBytes(proc.memory)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Restarts:</span>
                                            <span className="text-amber-400">{proc.restarts}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
}

function MetricCard({ icon: Icon, label, value, sub, color }: any) {
    const colors = {
        blue: 'text-blue-500 bg-blue-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
        amber: 'text-amber-500 bg-amber-500/10',
        green: 'text-green-500 bg-green-500/10',
    };

    return (
        <Card variant="luxury" hover className="relative overflow-hidden">
            <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${colors[color as keyof typeof colors]}`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">{label}</div>
                    <div className="text-2xl font-black text-white">{value}</div>
                    <div className="text-xs text-gray-600 mt-1">{sub}</div>
                </div>
            </div>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <span className="text-gray-500">{label}</span>
            <span className="text-white font-mono text-xs">{value}</span>
        </div>
    );
}
