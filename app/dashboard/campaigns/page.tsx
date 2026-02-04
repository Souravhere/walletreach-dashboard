'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { campaignsAPI } from '@/lib/api';
import { 
    RiAddLine, RiPlayFill, RiPauseFill, RiStopFill, 
    RiEyeLine, RiDeleteBin7Line, RiRestartLine,
    RiShieldFlashLine, RiFocus3Line
} from 'react-icons/ri';

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCampaigns();
        const interval = setInterval(fetchCampaigns, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await campaignsAPI.getAll();
            setCampaigns(response.data.campaigns);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch campaigns');
        } finally {
            setLoading(false);
        }
    };

    // Logic remains untouched as per instructions
    const handleStart = async (id: string) => {
        try { await campaignsAPI.start(id); setSuccess('Protocol Initiated'); fetchCampaigns(); setTimeout(() => setSuccess(''), 3000); } 
        catch (error: any) { setError(error.response?.data?.error || 'Launch failure'); }
    };

    const handlePause = async (id: string) => {
        try { await campaignsAPI.pause(id); setSuccess('Protocol Paused'); fetchCampaigns(); setTimeout(() => setSuccess(''), 3000); } 
        catch (error: any) { setError(error.response?.data?.error || 'Pause failure'); }
    };

    const handleStop = async (id: string) => {
        if (!confirm('Abort this mission?')) return;
        try { await campaignsAPI.stop(id); setSuccess('Protocol Terminated'); fetchCampaigns(); setTimeout(() => setSuccess(''), 3000); } 
        catch (error: any) { setError(error.response?.data?.error || 'Termination failure'); }
    };

    const handleRestart = async (id: string) => {
        if (!confirm('Re-initialize protocol? All progress data will be reset.')) return;
        try { await campaignsAPI.restart(id); setSuccess('Protocol Reset Successful'); fetchCampaigns(); setTimeout(() => setSuccess(''), 3000); } 
        catch (error: any) { setError(error.response?.data?.error || 'Reset failure'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('⚠️ Permanently delete this record? This cannot be undone!')) return;
        try { await campaignsAPI.delete(id); setSuccess('Record Purged'); fetchCampaigns(); setTimeout(() => setSuccess(''), 3000); } 
        catch (error: any) { setError(error.response?.data?.error || 'Purge failure'); }
    };

    const getStatusVariant = (status: string): any => {
        switch (status) {
            case 'running': return 'success';
            case 'paused': return 'warning';
            case 'completed': return 'success';
            case 'stopped': return 'error';
            case 'failed': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
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
            <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4 md:px-0">
                
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-white">Campaigns</h1>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push('/dashboard/campaigns/new')}
                        className="flex items-center gap-2 px-6 py-3.5 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all"
                    >
                        <RiAddLine size={18} />
                        New Campaign
                    </motion.button>
                </header>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Campaigns List */}
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence mode="popLayout">
                        {campaigns.map((campaign, idx) => {
                            const progressPercentage = campaign.progress?.totalWallets > 0 
                                ? (campaign.progress.processedWallets / campaign.progress.totalWallets) * 100 
                                : 0;

                            return (
                                <motion.div
                                    key={campaign._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card variant="luxury" className="group relative overflow-hidden">
                                        {/* Status Glow Bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                                            campaign.status === 'running' ? 'bg-green-500 shadow-[2px_0_15px_rgba(34,197,94,0.4)]' : 'hidden'
                                        }`} />

                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                                            
                                            {/* Campaign Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 hidden bg-white/[0.03] border border-white/10 rounded-2xl">
                                                        <RiFocus3Line className={campaign.status === 'running' ? 'text-blue-400 animate-pulse' : 'text-gray-600'} size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="sm:text-xl text-lg font-semibold text-white tracking-tight leading-none mb-2">{campaign.name}</h3>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                                                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                                                                {campaign.tokenAddress.slice(0, 6)}...{campaign.tokenAddress.slice(-4)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                                                    <StatItem label="Conversion" value={`${(campaign.metrics?.successRate || 0).toFixed(1)}%`} />
                                                    <StatItem label="Processed" value={`${campaign.progress?.processedWallets || 0} / ${campaign.progress?.totalWallets || 0}`} />
                                                    <StatItem label="Launch Date" value={new Date(campaign.createdAt).toLocaleDateString()} />
                                                    <StatItem label="Network" value="BSC Mainnet" />
                                                </div>
                                            </div>

                                            {/* Progress & Actions Section */}
                                            <div className="flex flex-col md:flex-row items-center gap-8 min-w-fit">
                                                
                                                {/* Circular Progress (Visual only for Running) */}
                                                <div className="relative w-16 h-16 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                                        <motion.circle 
                                                            cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                                                            strokeDasharray={175.9}
                                                            initial={{ strokeDashoffset: 175.9 }}
                                                            animate={{ strokeDashoffset: 175.9 - (175.9 * progressPercentage) / 100 }}
                                                            className="text-blue-500"
                                                        />
                                                    </svg>
                                                    <span className="absolute text-[10px] font-black text-white">{Math.round(progressPercentage)}%</span>
                                                </div>

                                                {/* High-End Action Hub */}
                                                <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                                                    <ActionButton onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)} icon={RiEyeLine} label="View" />
                                                    
                                                    {campaign.status === 'draft' && <ActionButton onClick={() => handleStart(campaign._id)} icon={RiPlayFill} label="Start" primary />}
                                                    
                                                    {campaign.status === 'running' && (
                                                        <>
                                                            <ActionButton onClick={() => handlePause(campaign._id)} icon={RiPauseFill} label="Pause" />
                                                            <ActionButton onClick={() => handleStop(campaign._id)} icon={RiStopFill} label="Stop" danger />
                                                        </>
                                                    )}

                                                    {campaign.status === 'paused' && <ActionButton onClick={() => handleStart(campaign._id)} icon={RiPlayFill} label="Resume" primary />}

                                                    {['completed', 'stopped', 'failed'].includes(campaign.status) && (
                                                        <>
                                                            <ActionButton onClick={() => handleRestart(campaign._id)} icon={RiRestartLine} label="Restart" primary />
                                                            <ActionButton onClick={() => handleDelete(campaign._id)} icon={RiDeleteBin7Line} label="Delete" danger />
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {campaigns.length === 0 && (
                        <Card variant="luxury" className="py-24 text-center">
                            <RiShieldFlashLine className="mx-auto text-5xl text-gray-800 mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[11px]">No active protocols found</p>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

// Sub-components for cleaner UI
function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-gray-300 tracking-tight">{value}</p>
        </div>
    );
}

function ActionButton({ onClick, icon: Icon, label, primary, danger }: any) {
    return (
        <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            title={label}
            className={`p-3 rounded-xl transition-all border border-transparent ${
                primary ? 'text-blue-400 bg-blue-500/5 hover:border-blue-500/20' : 
                danger ? 'text-red-400 bg-red-500/5 hover:border-red-500/20' : 
                'text-gray-400'
            }`}
        >
            <Icon size={18} />
        </motion.button>
    );
}