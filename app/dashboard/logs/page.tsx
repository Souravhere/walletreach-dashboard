'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { logsAPI } from '@/lib/api';
import { 
    RiExchangeFundsLine, 
    RiShieldUserLine, 
    RiTimeLine, 
    RiExternalLinkLine,
    RiFingerprintLine,
    RiHashtag
} from 'react-icons/ri';

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('transactions');
    const [error, setError] = useState('');

    useEffect(() => { fetchLogs(); }, [activeTab]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = activeTab === 'transactions'
                ? await logsAPI.getTransactions()
                : await logsAPI.getAudit();
            setLogs(response.data.logs || response.data.transactions || []);
        } catch (error: any) {
            setError('Failed to synchronize ledger data');
        } finally { setLoading(false); }
    };

    const formatTokenAmount = (amount: string, decimals: number = 18) => {
        try {
            return parseFloat(ethers.formatUnits(amount, decimals)).toLocaleString(undefined, {
                maximumFractionDigits: 4
            });
        } catch (e) { return amount; }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-white">System Logs</h1>
                    </div>

                    {/* Premium Tab Switcher */}
                    <div className="flex bg-[#0a0a0a] p-1.5 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md">
                        {[
                            { id: 'transactions', label: 'Transactions', icon: RiExchangeFundsLine },
                            { id: 'audit', label: 'Audit Logs', icon: RiShieldUserLine }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                                    activeTab === tab.id 
                                    ? 'bg-white text-black shadow-xl shadow-white/10' 
                                    : 'text-gray-500 hover:text-white'
                                }`}
                            >
                                <tab.icon className="text-lg" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                {/* Ledger Table Section */}
                <Card variant="luxury" padding="none" className="overflow-hidden border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    {activeTab === 'transactions' ? (
                                        <>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500">TX Hash</th>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Recipient</th>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Amount</th>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Status</th>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Timestamp</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Operation</th>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Identity</th>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Resource Target</th>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Network IP</th>
                                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Date</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="wait">
                                    {!loading && logs.map((log: any, idx: number) => (
                                        <motion.tr
                                            key={log._id || idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="group hover:bg-white/[0.02] transition-colors"
                                        >
                                            {activeTab === 'transactions' ? (
                                                <>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <RiHashtag className="text-gray-700" />
                                                            <span className="font-mono text-[13px] text-gray-300 group-hover:text-blue-400 transition-colors">
                                                                {log.txHash ? `${log.txHash.slice(0, 8)}...${log.txHash.slice(-6)}` : '0x Pending'}
                                                            </span>
                                                            <RiExternalLinkLine className="opacity-0 group-hover:opacity-40 text-xs" />
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-mono text-[13px] text-gray-500">
                                                        {log.recipientAddress?.slice(0, 12)}...
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-bold text-white tracking-tight">
                                                        {formatTokenAmount(log.amount)} <span className="text-[10px] text-gray-500">TKN</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                                                            {log.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[12px] font-medium text-gray-300">
                                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                                                                {new Date(log.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-4 px-6">
                                                        <span className="px-2 py-1 bg-white/5 rounded-md text-[11px] font-bold text-gray-300 border border-white/5 group-hover:border-white/20">
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm font-semibold text-white">
                                                        {log.userId?.username || 'System Engine'}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-[11px] text-gray-500 uppercase tracking-widest font-black">{log.resourceType}</span>
                                                            <span className="text-[12px] text-gray-400 font-mono truncate max-w-[150px]">{log.resourceId}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-mono text-[12px] text-gray-500">
                                                        {log.ipAddress || 'Internal'}
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-[12px] text-gray-500 font-medium">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                </>
                                            )}
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Empty State */}
                    {logs.length === 0 && !loading && (
                        <div className="text-center py-20">
                            <RiTimeLine className="mx-auto text-4xl text-gray-800 mb-4" />
                            <p className="text-gray-600 font-bold uppercase tracking-[0.2em] text-[10px]">Registry is empty</p>
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}