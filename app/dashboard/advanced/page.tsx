'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { campaignsAPI, walletsAPI } from '@/lib/api';
import {
    FiArrowLeft,
    FiInfo,
    FiCheckCircle,
    FiTarget,
    FiUpload,
    FiAlertCircle,
    FiSettings,
    FiDatabase,
    FiActivity,
    FiUsers,
    FiClock
} from 'react-icons/fi';
import { RiTimerFlashLine } from 'react-icons/ri';

export default function AdvancedCampaignsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [wallets, setWallets] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        tokenAddress: '',
        minInterval: 2, // Minutes
        maxInterval: 5, // Minutes
        targetHolders: 100,
        recipientSource: 'generated' as 'generated' | 'csv_upload',
        uploadedFile: null as File | null,
        recipients: [] as string[],
        senderWallets: [] as string[],
    });

    // Validation Results (for CSV)
    const [validationResults, setValidationResults] = useState({
        total: 0,
        valid: 0,
        duplicates: 0,
        invalid: 0,
    });

    // Fetch Wallets
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const response = await walletsAPI.getAll();
                // canSend is a backend method, not in JSON. Filter only by status.
                const activeWallets = response.data.wallets.filter((w: any) => w.status === 'active');
                setWallets(activeWallets);

                // Fetch basic BNB balances
                activeWallets.forEach((w: any) => fetchWalletBalance(w._id));
            } catch (error: any) {
                console.error('Failed to fetch wallets:', error);
            }
        };
        fetchWallets();
    }, []);

    const [walletBalances, setWalletBalances] = useState<Record<string, { bnb: string, token: string, symbol: string }>>({});

    const fetchWalletBalance = async (walletId: string) => {
        try {
            const tokenAddr = formData.tokenAddress && formData.tokenAddress.length === 42 ? formData.tokenAddress : undefined;
            const res = await walletsAPI.getBalance(walletId, tokenAddr);
            setWalletBalances(prev => ({
                ...prev,
                [walletId]: {
                    bnb: res.data.bnbBalanceFormatted,
                    token: res.data.tokenBalanceFormatted,
                    symbol: res.data.tokenSymbol
                }
            }));
        } catch (err) {
            console.error(`Failed to fetch balance for ${walletId}`, err);
        }
    };

    // Re-fetch balances when token address changes and is valid
    useEffect(() => {
        if (formData.tokenAddress && formData.tokenAddress.length === 42 && wallets.length > 0) {
            wallets.forEach(w => fetchWalletBalance(w._id));
        }
    }, [formData.tokenAddress, wallets.length]);

    // Handlers
    const handleWalletToggle = (walletId: string) => {
        setFormData(prev => ({
            ...prev,
            senderWallets: prev.senderWallets.includes(walletId)
                ? prev.senderWallets.filter(id => id !== walletId)
                : [...prev.senderWallets, walletId]
        }));
    };

    const handleSelectAllWallets = () => {
        if (formData.senderWallets.length === wallets.length) {
            setFormData(prev => ({ ...prev, senderWallets: [] }));
        } else {
            setFormData(prev => ({ ...prev, senderWallets: wallets.map(w => w._id) }));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFormData({ ...formData, uploadedFile: file, recipientSource: 'csv_upload' });

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                let addresses: string[] = [];

                if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
                    addresses = content.split(/[\n,]/).map(line => line.trim()).filter(addr => addr.startsWith('0x'));
                } else if (file.name.endsWith('.json')) {
                    const parsed = JSON.parse(content);
                    addresses = Array.isArray(parsed) ? parsed : [];
                }

                // Validate
                const validRegex = /^0x[a-fA-F0-9]{40}$/;
                const unique = new Set<string>();
                let duplicates = 0;
                let invalid = 0;
                const validList: string[] = [];

                addresses.forEach(addr => {
                    const lower = addr.toLowerCase();
                    if (!validRegex.test(lower)) invalid++;
                    else if (unique.has(lower)) duplicates++;
                    else {
                        unique.add(lower);
                        validList.push(lower);
                    }
                });

                setFormData(prev => ({ ...prev, recipients: validList, targetHolders: validList.length }));
                setValidationResults({
                    total: addresses.length,
                    valid: validList.length,
                    duplicates,
                    invalid
                });
            } catch (err) {
                setError('Failed to parse file. Please check format.');
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const payload = {
                name: formData.name,
                tokenAddress: formData.tokenAddress,
                senderWallets: formData.senderWallets,
                targetHolders: formData.recipientSource === 'csv_upload' ? formData.recipients.length : formData.targetHolders,

                // Drip Mode Config
                mode: 'human_drip',
                dripConfig: {
                    minInterval: formData.minInterval,
                    maxInterval: formData.maxInterval,
                },

                // Recipient Source
                walletSource: formData.recipientSource,
                uploadedWallets: formData.recipientSource === 'csv_upload' ? formData.recipients : [],

                // Defaults
                timeRange: {
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                },
                rewardConfig: {
                    mode: 'random_range',
                    randomRange: { min: 10, max: 100 }
                },
                filters: {
                    excludeContracts: true,
                    excludeExistingHolders: true,
                    minBNBBalance: 0
                }
            };

            await campaignsAPI.create(payload);
            router.push('/dashboard/campaigns');
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to create campaign');
            setSubmitting(false);
        }
    };

    // Calculations
    const avgDelayMinutes = (formData.minInterval + formData.maxInterval) / 2;
    const totalTransactions = formData.recipientSource === 'csv_upload' ? validationResults.valid : formData.targetHolders;
    const estimatedDurationHours = (totalTransactions * avgDelayMinutes) / 60; // Assuming 1 parallel instance (sequential for drip)

    const isStepValid = (step: number) => {
        switch (step) {
            case 1: return formData.name && formData.tokenAddress && formData.minInterval > 0 && formData.maxInterval > formData.minInterval;
            case 2: return formData.senderWallets.length > 0;
            case 3: return formData.recipientSource === 'generated' ? formData.targetHolders > 0 : validationResults.valid > 0;
            case 4: return true;
            default: return false;
        }
    };

    const steps = [
        { number: 1, title: 'Configuration', icon: FiSettings, description: 'Drip settings' },
        { number: 2, title: 'Senders', icon: FiDatabase, description: 'Select wallets' },
        { number: 3, title: 'Recipients', icon: FiUsers, description: 'Target audience' },
        { number: 4, title: 'Review', icon: FiCheckCircle, description: 'Launch' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg transition-all">
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-light tracking-tight">Human-Mode Campaign</h1>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20">BETA</span>
                            </div>
                            <p className="text-sm text-white/40 mt-1">Simulate organic growth with randomized delays</p>
                        </div>
                    </div>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                {/* Steps */}
                <div className="relative mb-12">
                    <div className="absolute top-6 left-0 right-0 h-px bg-white/10" />
                    <div className="relative flex items-center justify-between">
                        {steps.map((step) => {
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.number}
                                    className="flex flex-col items-center cursor-pointer"
                                    onClick={() => isCompleted && setCurrentStep(step.number)}
                                    animate={{ scale: isActive ? 1.05 : 1 }}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all mb-3 z-10
                                        ${isActive ? 'bg-purple-600 border-purple-400 text-white' :
                                            isCompleted ? 'bg-purple-900/40 border-purple-400/50 text-white' :
                                                'bg-black border-white/10 text-white/30'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="text-center">
                                        <div className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>{step.title}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {/* Step 1: Configuration */}
                        {currentStep === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <h3 className="text-lg font-light mb-6 flex items-center gap-2">
                                        <RiTimerFlashLine className="text-purple-400" /> Campaign Settings
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2 text-white/80">Campaign Name</label>
                                            <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Organic Growth Week 1" fullWidth />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium mb-2 text-white/80">Token Address</label>
                                            <Input value={formData.tokenAddress} onChange={e => setFormData({ ...formData, tokenAddress: e.target.value })} placeholder="0x..." fullWidth className="font-mono" />
                                        </div>

                                        <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-6 md:col-span-2">
                                            <h4 className="text-purple-300 text-sm font-medium mb-4 flex items-center gap-2">
                                                <FiClock /> Drip Configuration
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs text-white/60 mb-1">Min Delay (Minutes)</label>
                                                    <Input type="number" min={1} value={formData.minInterval} onChange={e => setFormData({ ...formData, minInterval: Number(e.target.value) })} fullWidth />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-white/60 mb-1">Max Delay (Minutes)</label>
                                                    <Input type="number" min={formData.minInterval} value={formData.maxInterval} onChange={e => setFormData({ ...formData, maxInterval: Number(e.target.value) })} fullWidth />
                                                </div>
                                            </div>
                                            <p className="text-xs text-purple-400/60 mt-3">
                                                * Transactions will be spaced randomly between {formData.minInterval} and {formData.maxInterval} minutes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Senders */}
                        {currentStep === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-light flex items-center gap-2">
                                            <FiDatabase className="text-purple-400" /> Sender Wallets
                                        </h3>
                                        <Button type="button" size="sm" variant="secondary" onClick={handleSelectAllWallets} className="border-white/10">
                                            {formData.senderWallets.length === wallets.length ? 'Deselect All' : 'Select All'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                        {wallets.map(wallet => {
                                            const isSelected = formData.senderWallets.includes(wallet._id);
                                            return (
                                                <div
                                                    key={wallet._id}
                                                    onClick={() => handleWalletToggle(wallet._id)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-3
                                                        ${isSelected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                                                        ${isSelected ? 'bg-purple-500 border-purple-500 text-white' : 'border-white/20'}`}>
                                                        {isSelected && <FiCheckCircle size={12} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{wallet.name}</div>
                                                        <div className="text-xs text-white/40 font-mono">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</div>
                                                    </div>
                                                    <div className="ml-auto text-right">
                                                        <div className="text-xs text-white/70">
                                                            {walletBalances[wallet._id]?.bnb ? `${parseFloat(walletBalances[wallet._id].bnb).toFixed(4)} BNB` : '...'}
                                                        </div>
                                                        {formData.tokenAddress && walletBalances[wallet._id]?.token && (
                                                            <div className="text-[10px] text-purple-400">
                                                                {parseFloat(walletBalances[wallet._id].token).toLocaleString(undefined, { maximumFractionDigits: 2 })} {walletBalances[wallet._id].symbol}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Recipients */}
                        {currentStep === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <h3 className="text-lg font-light mb-6 flex items-center gap-2">
                                        <FiUsers className="text-purple-400" /> Target Audience
                                    </h3>

                                    <div className="flex gap-4 mb-6">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, recipientSource: 'generated' })}
                                            className={`flex-1 p-4 rounded-xl border text-center transition-all
                                                ${formData.recipientSource === 'generated' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                                        >
                                            <FiActivity className="mx-auto mb-2" size={20} />
                                            <div className="font-medium">Auto-Generate</div>
                                            <div className="text-[10px] mt-1 opacity-60">Random active wallets</div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, recipientSource: 'csv_upload' })}
                                            className={`flex-1 p-4 rounded-xl border text-center transition-all
                                                ${formData.recipientSource === 'csv_upload' ? 'bg-white/10 border-white/30 text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                                        >
                                            <FiUpload className="mx-auto mb-2" size={20} />
                                            <div className="font-medium">Upload List</div>
                                            <div className="text-[10px] mt-1 opacity-60">CSV, JSON, TXT</div>
                                        </button>
                                    </div>

                                    {formData.recipientSource === 'generated' ? (
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">Number of Target Transactions</label>
                                            <Input type="number" value={formData.targetHolders} onChange={e => setFormData({ ...formData, targetHolders: Number(e.target.value) })} fullWidth />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <label className="block p-8 border-2 border-dashed border-white/10 rounded-xl text-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all">
                                                <FiUpload className="mx-auto mb-3 text-white/30" size={24} />
                                                <div className="text-sm font-medium">{formData.uploadedFile?.name || 'Click to upload recipient file'}</div>
                                                <div className="text-xs text-white/30 mt-1">Supports CSV, TXT, JSON</div>
                                                <input type="file" onChange={handleFileUpload} accept=".csv,.txt,.json" className="hidden" />
                                            </label>

                                            {validationResults.total > 0 && (
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-center">
                                                        <div className="text-lg font-bold text-green-400">{validationResults.valid}</div>
                                                        <div className="text-[10px] text-green-300/60">Valid</div>
                                                    </div>
                                                    <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20 text-center">
                                                        <div className="text-lg font-bold text-yellow-400">{validationResults.duplicates}</div>
                                                        <div className="text-[10px] text-yellow-300/60">Duplicates</div>
                                                    </div>
                                                    <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                                                        <div className="text-lg font-bold text-red-400">{validationResults.invalid}</div>
                                                        <div className="text-[10px] text-red-300/60">Invalid</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="text-center mb-8">
                                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 border border-purple-500/40">
                                            <FiTarget size={32} className="text-purple-400" />
                                        </div>
                                        <h3 className="text-2xl font-light">Ready to Launch</h3>
                                        <p className="text-sm text-white/40">Review campaign details</p>
                                    </div>

                                    <div className="space-y-4 max-w-lg mx-auto bg-white/5 p-6 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-white/40">Name</span>
                                            <span className="font-medium">{formData.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-white/40">Senders</span>
                                            <span className="font-medium">{formData.senderWallets.length} Wallets</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-white/40">Target</span>
                                            <span className="font-medium">{totalTransactions} Transactions</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-white/40">Drip Interval</span>
                                            <span className="font-medium">{formData.minInterval}m — {formData.maxInterval}m</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-white/40">Est. Duration</span>
                                            <span className="font-medium text-purple-400">~{estimatedDurationHours.toFixed(1)} Hours</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Controls */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
                            className="border-white/10 hover:bg-white/5"
                        >
                            {currentStep === 1 ? 'Cancel' : 'Back'}
                        </Button>

                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!isStepValid(currentStep)}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                Continue <FiArrowLeft className="rotate-180 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={submitting}
                                className="bg-purple-600 hover:bg-purple-500 text-white border-none"
                            >
                                Launch Campaign 🚀
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
