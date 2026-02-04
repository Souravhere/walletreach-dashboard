'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { analyticsAPI } from '@/lib/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import {
    RiBarChartGroupedLine,
    RiTimerFlashLine,
    RiUserFollowLine,
    RiShieldCheckLine,
    RiArrowUpSFill,
    RiPulseLine
} from 'react-icons/ri';

export default function AnalyticsPage() {
    const [overview, setOverview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsAPI.getOverview();
            // Verify structure matches your API response
            setOverview(response.data.overview);
        } catch (error: any) {
            setError('Signal lost: Failed to sync with analytics node');
        } finally {
            setLoading(false);
        }
    };

    // Safely parse campaign data
    const chartData = useMemo(() => {
        if (!overview?.campaignStats || overview.campaignStats.length === 0) {
            return []; // Recharts handles empty arrays better than null
        }
        return overview.campaignStats;
    }, [overview]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl ring-1 ring-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 py-0.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <p className="text-xs font-bold text-white">
                                {entry.name}: <span className="text-gray-400 font-mono ml-1">{entry.value.toLocaleString()}</span>
                            </p>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading || !isMounted) {
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
            <div className="max-w-7xl mx-auto space-y-10 pb-20">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-white">Analytics</h1>
                    </div>
                </header>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Total Campaigns', value: overview?.totalCampaigns, sub: `${overview?.activeCampaigns} Active`, icon: RiBarChartGroupedLine },
                        { label: 'Total Transactions', value: overview?.totalTransactions, sub: `${overview?.successfulTransactions} Success`, icon: RiTimerFlashLine },
                        { label: 'Holders Added', value: overview?.totalHoldersAdded, sub: 'All-Time Record', icon: RiUserFollowLine },
                        { label: 'Success Rate', value: `${overview?.successRate?.toFixed(1)}%`, sub: 'Network Avg', icon: RiShieldCheckLine }
                    ].map((stat, i) => (
                        <Card key={i} variant="luxury" hover className="relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 text-white">
                                <stat.icon size={100} />
                            </div>
                            <div className="space-y-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</div>
                                <div className="text-4xl font-black text-white tracking-tighter">{stat.value || 0}</div>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                    <RiArrowUpSFill className="text-green-500 text-sm" />
                                    <span className="uppercase tracking-tighter">{stat.sub}</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Main Trajectory Chart */}
                <Card variant="luxury" padding="lg" className="border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-white tracking-tight leading-none">Campaign Trajectory</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-2">Volume vs Conversion</p>
                        </div>
                    </div>
                    
                    {/* FIXED CONTAINER HEIGHT AND WIDTH */}
                    <div className="h-[400px] w-full min-h-[400px] relative">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorHolders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                                        dy={15}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="holders"
                                        name="Holders"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorHolders)"
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="transactions"
                                        name="TX Vol"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTransactions)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5 rounded-2xl">
                                <span className="text-gray-600 font-bold uppercase tracking-widest text-[10px]">Insufficient Campaign Data Found</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Bottom Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card variant="luxury" padding="lg">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Transaction Integrity</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Success', value: overview?.successfulTransactions || 0 },
                                    { name: 'Failed', value: overview?.failedTransactions || 0 }
                                ]}>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 800 }} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                                        <Cell fill="#10b981" />
                                        <Cell fill="#ef4444" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card variant="luxury" padding="lg">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-8">Engine Vitals</h3>
                        <div className="space-y-5">
                            {[
                                { label: 'Active Wallets', value: overview?.activeWallets, icon: RiShieldCheckLine, color: 'text-blue-500' },
                                { label: 'Registry Users', value: overview?.totalUsers, icon: RiUserFollowLine, color: 'text-purple-500' },
                                { label: 'Unread Alerts', value: overview?.unreadAlerts, icon: RiPulseLine, color: 'text-amber-500' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl bg-white/5 ${item.color}`}>
                                            <item.icon size={18} />
                                        </div>
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">{item.label}</span>
                                    </div>
                                    <span className="text-xl font-black text-white">{item.value || 0}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}