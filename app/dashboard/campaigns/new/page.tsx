'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import CSVUploader from '@/components/campaigns/CSVUploader';
import DiscreteAmountBuilder from '@/components/campaigns/DiscreteAmountBuilder';
import { campaignsAPI, walletsAPI } from '@/lib/api';
import {
    FiArrowLeft,
    FiInfo,
    FiCheckCircle,
    FiSettings,
    FiTarget,
    FiClock,
    FiFilter,
    FiGift,
    FiDatabase,
    FiUpload
} from 'react-icons/fi';

export default function NewCampaignPage() {
    const router = useRouter();
    const [wallets, setWallets] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        tokenAddress: '',
        targetHolders: 100,
        senderWallets: [] as string[],
        walletSource: 'generated' as 'generated' | 'csv_upload',
        uploadedWallets: [] as string[],
        timeRange: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        filters: {
            excludeContracts: true,
            excludeExistingHolders: true,
            minBNBBalance: 0.001,
        },
        rewardConfig: {
            mode: 'random_range' as 'random_range' | 'discrete_list',
            randomRange: {
                min: 10,
                max: 1000,
            },
            discreteAmounts: [] as number[],
        },
        transferDelay: 1, // seconds between transfers (ultra-fast: 1s)
        parallelInstances: 1, // number of parallel processing instances (1-10)
    });

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            const response = await walletsAPI.getAll();
            setWallets(response.data.wallets.filter((w: any) => w.status === 'active'));
        } catch (error: any) {
            setError('Failed to fetch wallets');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await campaignsAPI.create(formData);
            router.push(`/dashboard/campaigns/${response.data.campaign._id}`);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to create campaign');
            setLoading(false);
        }
    };

    const handleWalletToggle = (walletId: string) => {
        setFormData({
            ...formData,
            senderWallets: formData.senderWallets.includes(walletId)
                ? formData.senderWallets.filter(id => id !== walletId)
                : [...formData.senderWallets, walletId]
        });
    };

    const isStepValid = (step: number) => {
        switch (step) {
            case 1:
                return formData.name && formData.tokenAddress && formData.targetHolders > 0;
            case 2:
                return formData.senderWallets.length > 0;
            case 3:
                return true;
            default:
                return true;
        }
    };

    const steps = [
        { number: 1, title: 'Essentials', icon: FiTarget, description: 'Core configuration' },
        { number: 2, title: 'Infrastructure', icon: FiSettings, description: 'Wallets & timing' },
        { number: 3, title: 'Finalize', icon: FiCheckCircle, description: 'Review & launch' },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Minimalist Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/5 rounded-lg transition-all"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-light tracking-tight">New Campaign</h1>
                            <p className="text-sm text-white/40 mt-1">Configure holder acquisition parameters</p>
                        </div>
                    </div>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                {/* Sophisticated Step Indicator */}
                <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-px bg-white/10" />
                    <div className="relative flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <motion.div
                                    key={step.number}
                                    className="flex flex-col items-center"
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.05 : 1,
                                    }}
                                >
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all mb-3
                                            ${isActive
                                                ? 'bg-white text-black border-white'
                                                : isCompleted
                                                    ? 'bg-white/10 text-white border-white/30'
                                                    : 'bg-black text-white/30 border-white/10'
                                            }`}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <div className={`text-center ${isActive ? 'text-white' : 'text-white/40'}`}>
                                        <div className="text-xs font-medium mb-0.5">{step.title}</div>
                                        <div className="text-[10px]">{step.description}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Essentials */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiTarget className="text-white/60" size={20} />
                                        <h3 className="text-lg font-light">Campaign Fundamentals</h3>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Campaign Name */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">
                                                Campaign Name <span className="text-white/40">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Q1 2026 Growth Initiative"
                                                required
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Internal identifier for tracking and reporting purposes</span>
                                            </div>
                                        </div>

                                        {/* Token Address */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">
                                                Token Contract Address <span className="text-white/40">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.tokenAddress}
                                                onChange={(e) => setFormData({ ...formData, tokenAddress: e.target.value })}
                                                placeholder="0x..."
                                                required
                                                className="font-mono text-sm bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>BEP-20 compliant token address on Binance Smart Chain mainnet</span>
                                            </div>
                                        </div>

                                        {/* Target Holders */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">
                                                Target Wallet Count <span className="text-white/40">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                value={formData.targetHolders}
                                                onChange={(e) => setFormData({ ...formData, targetHolders: parseInt(e.target.value) })}
                                                min="1"
                                                required
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Number of unique wallets to receive token distribution</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Infrastructure */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Sender Wallets */}
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiDatabase className="text-white/60" size={20} />
                                        <div>
                                            <h3 className="text-lg font-light">Distribution Infrastructure</h3>
                                            <p className="text-xs text-white/40 mt-0.5">Select wallets for token transmission</p>
                                        </div>
                                    </div>

                                    {wallets.length === 0 ? (
                                        <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
                                            <div className="text-white/20 mb-2">
                                                <FiDatabase size={32} className="mx-auto" />
                                            </div>
                                            <p className="text-white/60 text-sm">No active wallets configured</p>
                                            <p className="text-white/30 text-xs mt-1">Configure sender wallets before proceeding</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {wallets.map((wallet) => {
                                                const isSelected = formData.senderWallets.includes(wallet._id);
                                                return (
                                                    <label
                                                        key={wallet._id}
                                                        className={`group cursor-pointer block p-4 border rounded-xl transition-all ${isSelected
                                                            ? 'bg-white/10 border-white/30'
                                                            : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleWalletToggle(wallet._id)}
                                                                className="mt-0.5 w-4 h-4"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium text-sm">{wallet.name}</div>
                                                                <div className="text-xs text-white/40 font-mono mt-1 truncate">
                                                                    {wallet.address}
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <FiCheckCircle className="text-white/60 flex-shrink-0" size={16} />
                                                            )}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* CSV Upload Option */}
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiUpload className="text-white/60" size={20} />
                                        <div>
                                            <h3 className="text-lg font-light">Target Wallets Source</h3>
                                            <p className="text-xs text-white/40 mt-0.5">Choose wallet selection method</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <label className={`flex-1 cursor-pointer p-4 border-2 rounded-xl transition-all ${formData.walletSource === 'generated'
                                                ? 'bg-white/10 border-white/30'
                                                : 'border-white/10 hover:border-white/20'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    value="generated"
                                                    checked={formData.walletSource === 'generated'}
                                                    onChange={(e) => setFormData({ ...formData, walletSource: 'generated' })}
                                                    className="mr-3"
                                                />
                                                <span className="font-medium">Auto-Generate</span>
                                            </label>
                                            <label className={`flex-1 cursor-pointer p-4 border-2 rounded-xl transition-all ${formData.walletSource === 'csv_upload'
                                                ? 'bg-white/10 border-white/30'
                                                : 'border-white/10 hover:border-white/20'
                                                }`}>
                                                <input
                                                    type="radio"
                                                    value="csv_upload"
                                                    checked={formData.walletSource === 'csv_upload'}
                                                    onChange={(e) => setFormData({ ...formData, walletSource: 'csv_upload' })}
                                                    className="mr-3"
                                                />
                                                <span className="font-medium">Upload CSV</span>
                                            </label>
                                        </div>

                                        {formData.walletSource === 'csv_upload' && (
                                            <CSVUploader
                                                onUploadSuccess={(addresses: string[]) => {
                                                    setFormData({ ...formData, uploadedWallets: addresses });
                                                }}
                                                onError={(error: string) => setError(error)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Time Configuration */}
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiClock className="text-white/60" size={20} />
                                        <div>
                                            <h3 className="text-lg font-light">Temporal Parameters</h3>
                                            <p className="text-xs text-white/40 mt-0.5">Define execution timeframe</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">Initiation Timestamp</label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.timeRange.startDate.slice(0, 16)}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    timeRange: { ...formData.timeRange, startDate: new Date(e.target.value).toISOString() }
                                                })}
                                                required
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Campaign activation moment</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">Termination Timestamp</label>
                                            <Input
                                                type="datetime-local"
                                                value={formData.timeRange.endDate.slice(0, 16)}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    timeRange: { ...formData.timeRange, endDate: new Date(e.target.value).toISOString() }
                                                })}
                                                required
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Campaign conclusion deadline</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiFilter className="text-white/60" size={20} />
                                        <div>
                                            <h3 className="text-lg font-light">Targeting Criteria</h3>
                                            <p className="text-xs text-white/40 mt-0.5">Wallet qualification filters</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.filters.excludeContracts}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, excludeContracts: e.target.checked }
                                                })}
                                                className="w-4 h-4 mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white/90">Exclude Smart Contracts</div>
                                                <div className="text-xs text-white/40 mt-0.5">Filter out contract addresses from recipient pool</div>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={formData.filters.excludeExistingHolders}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, excludeExistingHolders: e.target.checked }
                                                })}
                                                className="w-4 h-4 mt-0.5"
                                            />
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-white/90">Exclude Current Holders</div>
                                                <div className="text-xs text-white/40 mt-0.5">Target only wallets without existing token balance</div>
                                            </div>
                                        </label>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">Minimum BNB Balance Threshold</label>
                                            <Input
                                                type="number"
                                                step="0.001"
                                                value={formData.filters.minBNBBalance}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    filters: { ...formData.filters, minBNBBalance: parseFloat(e.target.value) }
                                                })}
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Minimum native currency balance for wallet eligibility</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">Parallel Instances</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={formData.parallelInstances}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    parallelInstances: Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
                                                })}
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Run 1-10 parallel processing instances for faster completion</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rewards */}
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiGift className="text-white/60" size={20} />
                                        <div>
                                            <h3 className="text-lg font-light">Distribution Schema</h3>
                                            <p className="text-xs text-white/40 mt-0.5">Token allocation methodology</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">Distribution Mode</label>
                                            <Select
                                                value={formData.rewardConfig.mode}
                                                onChange={(e) => {
                                                    const mode = e.target.value as 'random_range' | 'discrete_list';
                                                    setFormData({
                                                        ...formData,
                                                        rewardConfig: {
                                                            mode,
                                                            ...(mode === 'random_range' ? {
                                                                randomRange: { min: 10, max: 1000 },
                                                                discreteAmounts: []
                                                            } : {
                                                                randomRange: { min: 10, max: 1000 },
                                                                discreteAmounts: [10, 50, 100]
                                                            })
                                                        }
                                                    });
                                                }}
                                                options={[
                                                    { value: 'random_range', label: 'Randomized Range Distribution' },
                                                    { value: 'discrete_list', label: 'Discrete Value Selection' },
                                                ]}
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                        </div>

                                        {formData.rewardConfig.mode === 'random_range' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-white/80">Lower Bound</label>
                                                    <Input
                                                        type="number"
                                                        value={formData.rewardConfig.randomRange?.min || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            rewardConfig: {
                                                                ...formData.rewardConfig,
                                                                randomRange: {
                                                                    ...formData.rewardConfig.randomRange!,
                                                                    min: parseInt(e.target.value)
                                                                }
                                                            }
                                                        })}
                                                        required
                                                        min="10"
                                                        className="bg-white/5 border-white/10 focus:border-white/30"
                                                    />
                                                    <p className="text-xs text-white/40 mt-1.5">Minimum 10 tokens (no single digits)</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-white/80">Upper Bound</label>
                                                    <Input
                                                        type="number"
                                                        value={formData.rewardConfig.randomRange?.max || 0}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            rewardConfig: {
                                                                ...formData.rewardConfig,
                                                                randomRange: {
                                                                    ...formData.rewardConfig.randomRange!,
                                                                    max: parseInt(e.target.value)
                                                                }
                                                            }
                                                        })}
                                                        required
                                                        className="bg-white/5 border-white/10 focus:border-white/30"
                                                    />
                                                    <p className="text-xs text-white/40 mt-1.5">Maximum token quantity per wallet</p>
                                                </div>
                                            </div>
                                        )}

                                        {formData.rewardConfig.mode === 'discrete_list' && (
                                            <DiscreteAmountBuilder
                                                amounts={formData.rewardConfig.discreteAmounts || []}
                                                onChange={(amounts) => setFormData({
                                                    ...formData,
                                                    rewardConfig: {
                                                        ...formData.rewardConfig,
                                                        discreteAmounts: amounts
                                                    }
                                                })}
                                            />
                                        )}

                                        {/* Transfer Delay Configuration */}
                                        <div className="mt-6 pt-6 border-t border-white/10">
                                            <label className="block text-sm font-medium mb-2 text-white/80">
                                                Transfer Delay (seconds)
                                            </label>
                                            <Input
                                                type="number"
                                                value={formData.transferDelay}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    transferDelay: parseInt(e.target.value)
                                                })}
                                                min="5"
                                                max="120"
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Time delay between each transfer (5-120s). Lower = faster campaign execution</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                                            <FiCheckCircle size={32} className="text-white/60" />
                                        </div>
                                        <h3 className="text-2xl font-light mb-2">Configuration Complete</h3>
                                        <p className="text-sm text-white/40">Review parameters before deployment</p>
                                    </div>

                                    <div className="space-y-3 max-w-2xl mx-auto">
                                        {[
                                            { label: 'Campaign Identifier', value: formData.name },
                                            { label: 'Token Contract', value: `${formData.tokenAddress.slice(0, 10)}...${formData.tokenAddress.slice(-8)}`, mono: true },
                                            { label: 'Target Recipients', value: formData.targetHolders.toLocaleString() },
                                            { label: 'Sender Infrastructure', value: `${formData.senderWallets.length} wallet${formData.senderWallets.length !== 1 ? 's' : ''}` },
                                            { label: 'Distribution Range', value: `${formData.rewardConfig.randomRange?.min} - ${formData.rewardConfig.randomRange?.max} tokens` },
                                        ].map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                                <span className="text-sm text-white/60">{item.label}</span>
                                                <span className={`text-sm font-medium ${item.mono ? 'font-mono' : ''}`}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-6 border-t border-white/10">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back()}
                            disabled={loading}
                            className="border-white/10 hover:bg-white/5"
                        >
                            {currentStep === 1 ? 'Cancel' : 'Previous'}
                        </Button>
                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!isStepValid(currentStep)}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={loading}
                                disabled={formData.senderWallets.length === 0}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                Deploy Campaign
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
