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
    FiGift,
    FiFilter,
    FiDownload
} from 'react-icons/fi';
import Select from '@/components/ui/Select';
import DiscreteAmountBuilder from '@/components/campaigns/DiscreteAmountBuilder';

export default function LargeCampaignsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [wallets, setWallets] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        tokenAddress: '',
        delay: 1,
        recipients: [] as string[],
        uploadedFile: null as File | null,
        senderWallets: [] as string[],
        rewardConfig: {
            mode: 'random_range' as 'random_range' | 'discrete_list',
            randomRange: {
                min: 10,
                max: 100,
            },
            discreteAmounts: [] as number[],
        },
    });

    const [validationResults, setValidationResults] = useState({
        total: 0,
        valid: 0,
        duplicates: 0,
        invalid: 0,
    });

    const [estimations, setEstimations] = useState({
        duration: '0m',
        cost: '0 BNB',
        walletsNeeded: 0,
        successRate: 96,
    });

    // Fetch wallets on mount
    useEffect(() => {
        const fetchWallets = async () => {
            try {
                const response = await walletsAPI.getAll();
                const activeWallets = response.data.wallets.filter((w: any) => w.status === 'active');
                setWallets(activeWallets);
            } catch (error: any) {
                console.error('Failed to fetch wallets:', error);
            }
        };
        fetchWallets();
    }, []);

    const handleWalletToggle = (walletId: string) => {
        setFormData({
            ...formData,
            senderWallets: formData.senderWallets.includes(walletId)
                ? formData.senderWallets.filter(id => id !== walletId)
                : [...formData.senderWallets, walletId]
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFormData({ ...formData, uploadedFile: file });

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                let addresses: string[] = [];

                // Parse based on file type
                if (file.name.endsWith('.csv')) {
                    addresses = content.split('\n')
                        .map(line => line.split(',')[0].trim())
                        .filter(addr => addr.startsWith('0x'));
                } else if (file.name.endsWith('.json')) {
                    const parsed = JSON.parse(content);
                    addresses = Array.isArray(parsed) ? parsed : [];
                } else if (file.name.endsWith('.txt')) {
                    addresses = content.split('\n')
                        .map(line => line.trim())
                        .filter(addr => addr.startsWith('0x'));
                }

                // Validate addresses
                const validAddressRegex = /^0x[a-fA-F0-9]{40}$/;
                const uniqueAddresses = new Set<string>();
                let duplicateCount = 0;
                let invalidCount = 0;
                const validAddresses: string[] = [];

                addresses.forEach(addr => {
                    if (!validAddressRegex.test(addr)) {
                        invalidCount++;
                    } else if (uniqueAddresses.has(addr.toLowerCase())) {
                        duplicateCount++;
                    } else {
                        uniqueAddresses.add(addr.toLowerCase());
                        validAddresses.push(addr);
                    }
                });

                setFormData({ ...formData, recipients: validAddresses, uploadedFile: file });
                setValidationResults({
                    total: addresses.length,
                    valid: validAddresses.length,
                    duplicates: duplicateCount,
                    invalid: invalidCount,
                });

                // Calculate estimations
                const txCount = validAddresses.length;
                const walletsNeeded = Math.ceil(txCount / 5000);
                const durationMinutes = Math.ceil((txCount * formData.delay) / 60);
                const estimatedCost = (txCount * 0.001).toFixed(3);

                setEstimations({
                    duration: durationMinutes < 60 ? `${durationMinutes}m` : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`,
                    cost: `${estimatedCost} BNB`,
                    walletsNeeded,
                    successRate: 96,
                });

                // Auto-advance to next step if validation succeeds
                if (validAddresses.length > 0) {
                    setTimeout(() => setCurrentStep(3), 500);
                }
            } catch (err) {
                setError('Failed to parse file. Please check the format.');
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = (format: 'csv' | 'json' | 'txt') => {
        let content = '';
        let filename = '';

        if (format === 'csv') {
            content = 'address\n0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9\n0x85D4c4eB19f6F3e3c7F5e0E4a4D5e1C2b6e7D8f9';
            filename = 'recipients_template.csv';
        } else if (format === 'json') {
            content = JSON.stringify(['0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9', '0x85D4c4eB19f6F3e3c7F5e0E4a4D5e1C2b6e7D8f9'], null, 2);
            filename = 'recipients_template.json';
        } else {
            content = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb9\n0x85D4c4eB19f6F3e3c7F5e0E4a4D5e1C2b6e7D8f9';
            filename = 'recipients_template.txt';
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Format data to match backend Campaign model
            const campaignData = {
                name: formData.name,
                tokenAddress: formData.tokenAddress,
                targetHolders: validationResults.valid,
                senderWallets: formData.senderWallets,
                walletSource: 'csv_upload' as const,
                uploadedWallets: formData.recipients,
                timeRange: {
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                },
                filters: {
                    excludeContracts: true,
                    excludeExistingHolders: true,
                    minBNBBalance: 0.001,
                },
                rewardConfig: formData.rewardConfig,
                transferDelay: formData.delay,
                parallelInstances: 1,
            };

            const response = await campaignsAPI.create(campaignData);
            router.push(`/dashboard/campaigns/${response.data.campaign._id}`);
        } catch (error: any) {
            setError(error.response?.data?.error || error.message || 'Failed to create campaign');
            setLoading(false);
        }
    };

    const isStepValid = (step: number) => {
        switch (step) {
            case 1:
                return formData.name && formData.tokenAddress && formData.delay > 0;
            case 2:
                return formData.uploadedFile !== null;
            case 3:
                return validationResults.valid > 0;
            case 4:
                return formData.senderWallets.length > 0;
            case 5:
                return true;
            case 6:
                return true;
            default:
                return false;
        }
    };

    const steps = [
        { number: 1, title: 'Campaign Info', icon: FiTarget, description: 'Basic details' },
        { number: 2, title: 'Upload', icon: FiUpload, description: 'Bulk recipients' },
        { number: 3, title: 'Validation', icon: FiAlertCircle, description: 'Verify data' },
        { number: 4, title: 'Wallets', icon: FiDatabase, description: 'Select senders' },
        { number: 5, title: 'Estimations', icon: FiSettings, description: 'Review metrics' },
        { number: 6, title: 'Launch', icon: FiCheckCircle, description: 'Final review' },
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
                            <h1 className="text-3xl font-light tracking-tight">Large Scale Campaign</h1>
                            <p className="text-sm text-white/40 mt-1">Deploy to 10k-50k+ recipients efficiently</p>
                        </div>
                    </div>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                {/* Sophisticated Step Indicator */}
                <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-px bg-white/10" />
                    <div className="relative flex items-center justify-between">
                        {steps.map((step) => {
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
                        {/* Step 1: Campaign Info */}
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
                                        <h3 className="text-lg font-light">Campaign Essentials</h3>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">
                                                Campaign Name <span className="text-white/40">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="e.g., Q1 Mass Distribution"
                                                required
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Internal identifier for tracking purposes</span>
                                            </div>
                                        </div>

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
                                                <span>BEP-20 token address on BSC mainnet</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-white/80">
                                                Transfer Delay (seconds) <span className="text-white/40">*</span>
                                            </label>
                                            <Input
                                                type="number"
                                                value={formData.delay}
                                                onChange={(e) => setFormData({ ...formData, delay: parseInt(e.target.value) || 1 })}
                                                min="1"
                                                max="10"
                                                required
                                                className="bg-white/5 border-white/10 focus:border-white/30"
                                            />
                                            <div className="flex items-start gap-2 mt-2 text-xs text-white/40">
                                                <FiInfo size={12} className="mt-0.5 flex-shrink-0" />
                                                <span>Delay between transactions (1-10s recommended for large scale)</span>
                                            </div>
                                        </div>

                                        {/* Distribution Schema */}
                                        <div className="border border-white/10 rounded-xl p-6 bg-white/5">
                                            <div className="flex items-center gap-2 mb-4">
                                                <FiGift className="text-white/60" />
                                                <h4 className="text-sm font-medium">Distribution Schema</h4>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2 text-white/80">
                                                        Allocation Method
                                                    </label>
                                                    <Select
                                                        value={formData.rewardConfig.mode}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            rewardConfig: { ...formData.rewardConfig, mode: e.target.value as any }
                                                        })}
                                                        options={[
                                                            { value: 'random_range', label: 'Random Range (Min - Max)' },
                                                            { value: 'discrete_list', label: 'Discrete Value Selection' }
                                                        ]}
                                                        className="bg-white/5 border-white/10 w-full"
                                                    />
                                                </div>

                                                {formData.rewardConfig.mode === 'random_range' ? (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs text-white/60 mb-1">Min Amount</label>
                                                            <Input
                                                                type="number"
                                                                value={formData.rewardConfig.randomRange.min}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    rewardConfig: {
                                                                        ...formData.rewardConfig,
                                                                        randomRange: { ...formData.rewardConfig.randomRange, min: parseInt(e.target.value) || 0 }
                                                                    }
                                                                })}
                                                                min="0"
                                                                className="bg-white/5 border-white/10"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-white/60 mb-1">Max Amount</label>
                                                            <Input
                                                                type="number"
                                                                value={formData.rewardConfig.randomRange.max}
                                                                onChange={(e) => setFormData({
                                                                    ...formData,
                                                                    rewardConfig: {
                                                                        ...formData.rewardConfig,
                                                                        randomRange: { ...formData.rewardConfig.randomRange, max: parseInt(e.target.value) || 0 }
                                                                    }
                                                                })}
                                                                min="0"
                                                                className="bg-white/5 border-white/10"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="mt-4">
                                                        <DiscreteAmountBuilder
                                                            amounts={formData.rewardConfig.discreteAmounts}
                                                            onChange={(amounts) => setFormData({
                                                                ...formData,
                                                                rewardConfig: { ...formData.rewardConfig, discreteAmounts: amounts }
                                                            })}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Upload Recipients */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiUpload className="text-white/60" size={20} />
                                        <div>
                                            <h3 className="text-lg font-light">Bulk Recipient Upload</h3>
                                            <p className="text-xs text-white/40 mt-0.5">Upload CSV, JSON, or TXT file</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Template Downloads */}
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-sm font-medium mb-3">📥 Download Templates:</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => downloadTemplate('csv')}
                                                    className="border-white/10 hover:bg-white/10"
                                                >
                                                    <FiDownload className="mr-2" size={14} /> CSV
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => downloadTemplate('json')}
                                                    className="border-white/10 hover:bg-white/10"
                                                >
                                                    <FiDownload className="mr-2" size={14} /> JSON
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => downloadTemplate('txt')}
                                                    className="border-white/10 hover:bg-white/10"
                                                >
                                                    <FiDownload className="mr-2" size={14} /> TXT
                                                </Button>
                                            </div>
                                        </div>

                                        {/* File Upload */}
                                        <div>
                                            <label className="block cursor-pointer">
                                                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 hover:bg-white/5 transition-all">
                                                    <FiUpload size={32} className="mx-auto mb-3 text-white/40" />
                                                    <p className="text-sm font-medium mb-1">
                                                        {formData.uploadedFile ? formData.uploadedFile.name : 'Click to upload or drag and drop'}
                                                    </p>
                                                    <p className="text-xs text-white/40">CSV, JSON, or TXT (max 50MB)</p>
                                                </div>
                                                <input
                                                    type="file"
                                                    accept=".csv,.json,.txt"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Validation */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiAlertCircle className="text-white/60" size={20} />
                                        <h3 className="text-lg font-light">Validation Results</h3>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="text-2xl font-light mb-1">{validationResults.total}</div>
                                            <div className="text-xs text-white/60">Total</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="text-2xl font-light mb-1 text-green-400">{validationResults.valid}</div>
                                            <div className="text-xs text-white/60">Valid</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="text-2xl font-light mb-1 text-yellow-400">{validationResults.duplicates}</div>
                                            <div className="text-xs text-white/60">Duplicates</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <div className="text-2xl font-light mb-1 text-red-400">{validationResults.invalid}</div>
                                            <div className="text-xs text-white/60">Invalid</div>
                                        </div>
                                    </div>

                                    {validationResults.valid > 0 && (
                                        <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                                            <p className="text-sm text-green-400">✓ {validationResults.valid} addresses ready for distribution</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Wallet Selection */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiDatabase className="text-white/60" size={20} />
                                        <div>
                                            <h3 className="text-lg font-light">Sender Wallets</h3>
                                            <p className="text-xs text-white/40 mt-0.5">Select wallets for token distribution</p>
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
                                        <>
                                            <div className="mb-4 flex items-center justify-between">
                                                <p className="text-sm text-white/60">
                                                    {formData.senderWallets.length} of {wallets.length} wallets selected
                                                </p>
                                            </div>
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
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 5: Estimations */}
                        {currentStep === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                                        <FiSettings className="text-white/60" size={20} />
                                        <h3 className="text-lg font-light">Campaign Estimations</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                            <div className="text-xs text-white/60 mb-2">Estimated Duration</div>
                                            <div className="text-2xl font-light">{estimations.duration}</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                            <div className="text-xs text-white/60 mb-2">Estimated Gas Cost</div>
                                            <div className="text-2xl font-light">{estimations.cost}</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                            <div className="text-xs text-white/60 mb-2">Wallets Required</div>
                                            <div className="text-2xl font-light">{estimations.walletsNeeded}</div>
                                            <div className="text-[10px] text-white/40 mt-1">5,000 tx limit per wallet</div>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                                            <div className="text-xs text-white/60 mb-2">Expected Success Rate</div>
                                            <div className="text-2xl font-light">{estimations.successRate}%</div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 6: Review & Launch */}
                        {currentStep === 6 && (
                            <motion.div
                                key="step6"
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
                                        <h3 className="text-2xl font-light mb-2">Ready to Launch</h3>
                                        <p className="text-sm text-white/40">Review configuration before deployment</p>
                                    </div>

                                    <div className="space-y-3 max-w-2xl mx-auto">
                                        {[
                                            { label: 'Campaign Name', value: formData.name },
                                            { label: 'Token Address', value: `${formData.tokenAddress.slice(0, 10)}...${formData.tokenAddress.slice(-8)}`, mono: true },
                                            { label: 'Total Recipients', value: validationResults.valid.toLocaleString() },
                                            { label: 'Transfer Delay', value: `${formData.delay}s` },
                                            { label: 'Est. Duration', value: estimations.duration },
                                            { label: 'Est. Cost', value: estimations.cost },
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
                        {currentStep < 6 ? (
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
                                disabled={!isStepValid(currentStep)}
                                className="bg-white text-black hover:bg-white/90"
                            >
                                Launch Campaign
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
