'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { settingsAPI } from '@/lib/api';
import { 
    RiAlarmWarningLine, 
    RiServerLine, 
    RiGlobeLine, 
    RiInformationLine, 
    RiTerminalBoxLine,
    RiShieldFlashLine,
    RiRadioButtonLine
} from 'react-icons/ri';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEmergencyStop = async () => {
        if (!confirm('PROTOCOL OVERRIDE: Are you sure you want to EMERGENCY STOP all running campaigns? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await settingsAPI.emergencyStop();
            setSuccess('Emergency Protocol Activated: All engine operations suspended.');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Protocol Failure: Could not activate emergency stop');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-10 pb-20">
                {/* Header Section */}
                <header>
                    <h1 className="text-4xl font-semibold text-white">Settings</h1>
                </header>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Emergency Controls - The "Kill Switch" UI */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <RiAlarmWarningLine className="text-red-500 text-xl" />
                        <h2 className="text-[12px] font-black uppercase tracking-widest text-gray-400">Hazardous Controls</h2>
                    </div>
                    <Card variant="luxury" className="relative overflow-hidden border-red-500/20 bg-red-500/[0.02]">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <RiAlarmWarningLine size={120} className="text-red-500" />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-red-500 tracking-tight flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                                    Emergency Stop
                                </h3>
                                <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-2xl">
                                    Executing this protocol will immediately suspend ALL active campaign threads and pause the transaction queue. This is a 
                                    <span className="text-red-400 font-bold ml-1 uppercase text-xs">High-Priority Override</span>.
                                </p>
                            </div>
                            <button
                                onClick={handleEmergencyStop}
                                className="bg-red-500 hover:bg-red-600 text-white border-none px-8 py-6 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.2)] font-black uppercase tracking-widest text-[11px]"
                                // isLoading={loading}
                            >
                                Activate Emergency Stop
                            </button>
                        </div>
                    </Card>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* System Information Module */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <RiServerLine className="text-blue-500" />
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Node Infrastructure</h2>
                        </div>
                        <Card variant="luxury" className="space-y-6">
                            <div className="space-y-1">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Master API Endpoint</div>
                                <div className="font-mono text-sm text-white bg-white/5 p-3 rounded-xl border border-white/5 break-all">
                                    {process.env.NEXT_PUBLIC_API_URL || 'https://api.walletreach.internal'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Operational Environment</div>
                                <div className="flex items-center gap-2 font-mono text-xs text-blue-400 font-bold px-3 py-2 bg-blue-500/5 rounded-xl border border-blue-500/10 w-fit">
                                    <RiTerminalBoxLine />
                                    {process.env.NODE_ENV?.toUpperCase() || 'PRODUCTION'}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Network Connectivity Module */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <RiGlobeLine className="text-green-500" />
                            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-500">BSC Network Access</h2>
                        </div>
                        <Card variant="luxury">
                            <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">
                                Dynamic RPC load balancing is active. Rotating between priority nodes for data integrity.
                            </p>
                            <div className="space-y-3">
                                {[1, 2, 3].map((node) => (
                                    <div key={node} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-3">
                                            <RiRadioButtonLine className="text-green-500 text-sm animate-pulse" />
                                            <span className="font-mono text-[11px] text-gray-300">bsc-dataseed{node}.binance.org</span>
                                        </div>
                                        <span className="text-[8px] font-bold text-gray-600 uppercase">Active</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* About Module */}
                <Card variant="luxury" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-white/5 bg-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                            <RiInformationLine className="text-xl text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-white tracking-tight">WalletReach</h4>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-700 mt-1">© 2026 WalletReach</div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}