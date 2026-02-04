'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { alertsAPI } from '@/lib/api';
import { 
    RiDeleteBin7Line, 
    RiCheckDoubleLine, 
    RiShieldFlashLine, 
    RiErrorWarningLine, 
    RiInformationLine, 
    RiHistoryLine,
    RiFilter3Line,
    RiTerminalBoxLine
} from 'react-icons/ri';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [error, setError] = useState('');

    useEffect(() => { fetchAlerts(); }, [filter]);

    const fetchAlerts = async () => {
        try {
            const params = filter !== 'all' ? { type: filter } : {};
            const response = await alertsAPI.getAll(params);
            setAlerts(response.data.alerts);
        } catch (err: any) {
            setError('Encryption handshake failed with notification service');
        } finally { setLoading(false); }
    };

    const stats = useMemo(() => ({
        total: alerts.length,
        unread: alerts.filter(a => !a.isRead).length,
        critical: alerts.filter(a => a.type === 'critical').length
    }), [alerts]);

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full max-w-6xl mx-auto">
                
                {/* Header Section */}
                <header className="shrink-0 pb-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-semibold text-white">Intelligence Center</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Critical</p>
                                    <p className="text-sm font-bold text-red-500 leading-none">{stats.critical}</p>
                                </div>
                                <div className="w-[1px] h-6 bg-white/10" />
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Unread</p>
                                    <p className="text-sm font-bold text-white leading-none">{stats.unread}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 bg-[#0a0a0a] p-1 rounded-2xl border border-white/5">
                            {['all', 'info', 'warning', 'critical'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type)}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                                        filter === type 
                                        ? 'bg-white text-black shadow-lg' 
                                        : 'text-gray-500 hover:text-white'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {error && <div className="mb-6"><Alert type="critical" onClose={() => setError('')}>{error}</Alert></div>}

                {/* Main Alerts List */}
                <div className="flex-1 space-y-4 pb-20">
                    <LayoutGroup>
                        <AnimatePresence mode="popLayout">
                            {alerts.map((alert, index) => (
                                <motion.div
                                    key={alert._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.03 }}
                                >
                                    <Card variant="luxury" className={`group relative transition-all duration-500 ${alert.isRead ? 'opacity-50 grayscale' : ''}`}>
                                        <div className="flex flex-col gap-4">
                                            
                                            {/* Top Row: Title and Actions */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${
                                                        alert.type === 'critical' ? 'bg-red-500/10 text-red-500' : 
                                                        alert.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                                                    }`}>
                                                        {alert.type === 'critical' ? <RiErrorWarningLine size={20} /> : <RiInformationLine size={20} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <h3 className="font-bold text-white tracking-wide text-base md:text-lg break-words line-clamp-2">
                                                            {alert.title}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant={alert.type}>{alert.type}</Badge>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {!alert.isRead && (
                                                        <button 
                                                            onClick={() => alertsAPI.markAsRead(alert._id).then(fetchAlerts)}
                                                            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors border border-white/5"
                                                        >
                                                            <RiCheckDoubleLine size={18} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => alertsAPI.delete(alert._id).then(fetchAlerts)}
                                                        className="p-2.5 bg-red-500/5 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors border border-red-500/10"
                                                    >
                                                        <RiDeleteBin7Line size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Technical Message Handling: Fixes Overflow */}
                                            <div className="relative">
                                                <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-[13px] leading-relaxed text-gray-400 overflow-hidden">
                                                    <div className="flex gap-2 mb-2 text-gray-600">
                                                        <RiTerminalBoxLine size={14} />
                                                        <span className="text-[10px] uppercase font-bold tracking-tighter">Technical Output</span>
                                                    </div>
                                                    <div className="break-all whitespace-pre-wrap max-h-[200px] overflow-y-auto custom-scrollbar">
                                                        {alert.message}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Timestamp */}
                                            <div className="flex items-center gap-2 pt-2 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                                                <RiHistoryLine className="text-sm" />
                                                <span>{new Date(alert.createdAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {alerts.length === 0 && !loading && (
                            <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[40px]">
                                <RiShieldFlashLine className="mx-auto text-4xl text-gray-800 mb-4" />
                                <p className="text-gray-600 text-sm uppercase tracking-widest font-black">Secure Environment: No Alerts</p>
                            </div>
                        )}
                    </LayoutGroup>
                </div>
            </div>
        </DashboardLayout>
    );
}