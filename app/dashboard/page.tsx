'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { analyticsAPI, campaignsAPI, alertsAPI } from '@/lib/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
    RiMegaphoneLine,
    RiCheckboxCircleLine,
    RiAlertLine,
    RiLineChartLine,
    RiPulseLine,
    RiFlashlightLine,
    RiArrowRightSLine,
    RiDatabase2Line
} from 'react-icons/ri';
import Link from 'next/link';

export default function DashboardPage() {
    const [overview, setOverview] = useState<any>(null);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [overviewRes, campaignsRes, alertsRes] = await Promise.all([
                analyticsAPI.getOverview(),
                campaignsAPI.getAll({ status: 'running' }),
                alertsAPI.getAll({ isRead: false }),
            ]);

            setOverview(overviewRes.data.overview);
            setCampaigns(campaignsRes.data.campaigns);
            setAlerts(alertsRes.data.alerts.slice(0, 5));
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const chartData = useMemo(() => {
        if (!overview?.recentActivity) return [];
        return overview.recentActivity.map((item: any) => ({
            name: new Date(item._id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            value: item.count
        }));
    }, [overview]);

    if (loading || !isMounted) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen -mt-20">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-10 h-10 border-2 border-white/5 border-t-blue-500 rounded-full"
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-[1600px] mx-auto space-y-10 pb-20">

                {/* 1. Header with System Status */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-2xl">
                        <div className="px-4 py-2 bg-[#0a0a0a] rounded-xl border border-white/5">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Success Rate</p>
                            <p className="text-lg font-black text-green-500 leading-none">{overview?.successRate?.toFixed(1)}%</p>
                        </div>
                    </div>
                </header>

                {/* 2. Intelligence Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={RiMegaphoneLine}
                        label="Total Campaigns"
                        value={overview?.totalCampaigns || 0}
                        sub={`${overview?.activeCampaigns || 0} active`}
                        color="blue"
                    />
                    <StatCard
                        icon={RiCheckboxCircleLine}
                        label="Successful TX"
                        value={overview?.successfulTransactions || 0}
                        sub="Verified on-chain"
                        color="green"
                    />
                    <StatCard
                        icon={RiLineChartLine}
                        label="Holders Added"
                        value={overview?.totalHoldersAdded || 0}
                        sub="Growth metric"
                        color="purple"
                    />
                    <StatCard
                        icon={RiAlertLine}
                        label="Pending Alerts"
                        value={alerts.length}
                        sub="Action required"
                        color="amber"
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* 3. Performance Chart (2/3 Width) */}
                    <div className="xl:col-span-2 space-y-8">
                        <Card variant="luxury" padding="lg">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <RiDatabase2Line className="text-blue-500" />
                                    <h3 className="font-bold text-white tracking-wide uppercase text-xs tracking-[0.2em]">7-Day Transaction Volume</h3>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="glowBlue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false} tickLine={false}
                                            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 700 }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#050505', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            name="Transactions"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fill="url(#glowBlue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* 4. Active Campaigns Feed */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <RiFlashlightLine className="text-green-500" />
                                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Live Campaign Sync</h3>
                            </div>
                            {campaigns.length === 0 ? (
                                <Card variant="luxury" className="py-12 text-center text-gray-500">No active protocols found</Card>
                            ) : (
                                <div className="space-y-3">
                                    {campaigns.map((campaign) => {
                                        const progress = (campaign.progress.processedWallets / campaign.progress.totalWallets) * 100;
                                        return (
                                            <motion.div key={campaign._id} whileHover={{ x: 4 }}>
                                                <Card variant="luxury" className="group">
                                                    <div className="flex items-center justify-between gap-6">
                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-bold text-white tracking-wide">{campaign.name}</h4>
                                                                <Badge variant="success">Active</Badge>
                                                            </div>
                                                            {/* Progress Bar */}
                                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${progress}%` }}
                                                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                                />
                                                            </div>
                                                            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                                <span>{campaign.progress.processedWallets} / {campaign.progress.totalWallets} Propagated</span>
                                                                <span className="text-blue-400">{progress.toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl group-hover:border-white/20 transition-all">
                                                            <RiArrowRightSLine className="text-gray-500" />
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 5. Intelligence Alerts (1/3 Width) */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <RiAlertLine className="text-amber-500" />
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Alert Stream</h3>
                        </div>
                        <Card variant="luxury" className="h-fit">
                            <div className="divide-y divide-white/5">
                                {alerts.length === 0 ? (
                                    <p className="text-center py-8 text-gray-500 text-sm">Clear Environment</p>
                                ) : (
                                    alerts.map((alert) => (
                                        <div key={alert._id} className="py-4 first:pt-0 last:pb-0 group cursor-pointer">
                                            <div className="flex items-start gap-4">
                                                <div className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${alert.type === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-blue-500'
                                                    }`} />
                                                <div>
                                                    <h5 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors leading-tight mb-1">
                                                        {alert.title}
                                                    </h5>
                                                    <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">
                                                        {alert.message}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Link href='/dashboard/alerts'>
                            <button className="w-full mt-6 py-3 border-t border-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors">
                                View Intelligence Feed
                            </button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Sub-component for Luxury Stat Cards
function StatCard({ icon: Icon, label, value, sub, color }: any) {
    const colors = {
        blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
        green: 'text-green-500 bg-green-500/5 border-green-500/10',
        purple: 'text-purple-500 bg-purple-500/5 border-purple-500/10',
        amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-[#080808] border border-white/5 rounded-3xl p-7 relative overflow-hidden group shadow-2xl"
        >
            <div className={`absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`}>
                <Icon size={80} />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${colors[color as keyof typeof colors]}`}>
                        <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</span>
                </div>
                <div>
                    <div className="text-4xl font-black text-white tracking-tighter">
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </div>
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-2 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        {sub}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}