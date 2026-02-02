'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { campaignsAPI } from '@/lib/api';
import { FiPlay, FiPause, FiSquare, FiArrowLeft, FiClock } from 'react-icons/fi';
import { formatDuration, calculateElapsedTime, calculateRemainingTime } from '@/lib/timeUtils';

export default function CampaignDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        if (id) {
            fetchCampaign();
            const interval = setInterval(fetchCampaign, 5000); // Refresh every 5s
            return () => clearInterval(interval);
        }
    }, [id]);

    const fetchCampaign = async () => {
        try {
            const response = await campaignsAPI.getById(id);
            setCampaign(response.data.campaign);

            // Update elapsed time if campaign is running
            if (response.data.campaign.status === 'running' && response.data.campaign.progress?.startedAt) {
                setElapsedTime(calculateElapsedTime(response.data.campaign.progress.startedAt));
            }
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch campaign');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        try {
            await campaignsAPI.start(id);
            setSuccess('Campaign started!');
            fetchCampaign();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to start campaign');
        }
    };

    const handlePause = async () => {
        try {
            await campaignsAPI.pause(id);
            setSuccess('Campaign paused!');
            fetchCampaign();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to pause campaign');
        }
    };

    const handleStop = async () => {
        if (!confirm('Are you sure you want to stop this campaign?')) return;
        try {
            await campaignsAPI.stop(id);
            setSuccess('Campaign stopped!');
            fetchCampaign();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to stop campaign');
        }
    };

    const handleRestart = async () => {
        if (!confirm('Are you sure you want to restart this campaign? Progress will be reset.')) return;
        try {
            await campaignsAPI.restart(id);
            setSuccess('Campaign restarted successfully!');
            fetchCampaign();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to restart campaign');
        }
    };

    const getStatusVariant = (status: string): 'default' | 'success' | 'error' | 'warning' | 'info' => {
        switch (status) {
            case 'running': return 'info';      // Blue for active/running
            case 'paused': return 'warning';    // Yellow/orange for paused
            case 'completed': return 'success'; // Green for completed
            case 'stopped': return 'warning';   // Yellow/orange for stopped
            case 'failed': return 'error';      // Red for failed
            default: return 'default';          // Gray for draft/default
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="spinner"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!campaign) {
        return (
            <DashboardLayout>
                <Alert type="critical">Campaign not found</Alert>
            </DashboardLayout>
        );
    }

    const progressPercent = campaign.progress?.totalWallets > 0
        ? (campaign.progress.processedWallets / campaign.progress.totalWallets) * 100
        : 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={() => router.back()} variant="secondary">
                            <FiArrowLeft size={20} />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold">{campaign.name}</h1>
                                {campaign.restartCount > 0 && (
                                    <Badge variant="info">
                                        Restarted {campaign.restartCount}x
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">Campaign Details</p>
                        </div>
                    </div>
                    <Badge variant={getStatusVariant(campaign.status)}>
                        {campaign.status}
                    </Badge>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Controls */}
                <Card>
                    <div className="flex gap-3">
                        {campaign.status === 'draft' && (
                            <Button onClick={handleStart} variant="primary">
                                <FiPlay size={16} />
                                Start Campaign
                            </Button>
                        )}

                        {campaign.status === 'running' && (
                            <>
                                <Button onClick={handlePause} variant="secondary">
                                    <FiPause size={16} />
                                    Pause
                                </Button>
                                <Button onClick={handleStop} variant="danger">
                                    <FiSquare size={16} />
                                    Stop
                                </Button>
                            </>
                        )}

                        {campaign.status === 'paused' && (
                            <Button onClick={handleStart} variant="primary">
                                <FiPlay size={16} />
                                Resume
                            </Button>
                        )}

                        {['completed', 'stopped', 'failed'].includes(campaign.status) && (
                            <Button onClick={handleRestart} variant="primary">
                                <FiPlay size={16} />
                                Restart Campaign
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Progress */}
                <Card title="Progress">
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Wallets Processed</span>
                                <span className="font-semibold">
                                    {campaign.progress?.processedWallets || 0} / {campaign.progress?.totalWallets || 0}
                                    {' '}({progressPercent.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="w-full bg-border rounded-full h-3">
                                <motion.div
                                    className="bg-green-500 h-3 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Successful</div>
                                <div className="text-2xl font-bold text-green-400">
                                    {campaign.progress?.successfulTx || 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Failed</div>
                                <div className="text-2xl font-bold text-red-400">
                                    {campaign.progress?.failedTx || 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Pending</div>
                                <div className="text-2xl font-bold text-yellow-400">
                                    {campaign.progress?.pendingTx || 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Success Rate</div>
                                <div className="text-2xl font-bold">
                                    {(campaign.metrics?.successRate || 0).toFixed(1)}%
                                </div>
                            </div>
                        </div>

                        {/* Timing Metrics */}
                        {campaign.progress?.startedAt && (
                            <div className="mt-6 pt-6 border-t border-border">
                                <div className="flex items-center gap-2 mb-4">
                                    <FiClock className="text-blue-400" size={20} />
                                    <h3 className="text-lg font-semibold">Timing Metrics</h3>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Started At</div>
                                        <div className="text-lg font-semibold">
                                            {new Date(campaign.progress.startedAt).toLocaleTimeString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(campaign.progress.startedAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-muted-foreground">
                                            {campaign.status === 'running' ? 'Elapsed Time' : 'Total Time'}
                                        </div>
                                        <div className="text-lg font-semibold text-blue-400">
                                            {campaign.progress.completedAt
                                                ? formatDuration((new Date(campaign.progress.completedAt).getTime() - new Date(campaign.progress.startedAt).getTime()) / 1000)
                                                : formatDuration(elapsedTime)
                                            }
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-sm text-muted-foreground">Avg TX Time</div>
                                        <div className="text-lg font-semibold text-green-400">
                                            {campaign.progress.averageTxTime
                                                ? formatDuration(campaign.progress.averageTxTime)
                                                : campaign.progress.successfulTx > 0 && elapsedTime > 0
                                                    ? formatDuration(elapsedTime / campaign.progress.successfulTx)
                                                    : 'N/A'
                                            }
                                        </div>
                                    </div>

                                    {campaign.status === 'running' && campaign.progress.successfulTx > 0 && elapsedTime > 0 ? (
                                        <div>
                                            <div className="text-sm text-muted-foreground">Est. Completion</div>
                                            <div className="text-lg font-semibold text-purple-400">
                                                {formatDuration(
                                                    calculateRemainingTime(
                                                        campaign.progress.totalWallets || 0,
                                                        campaign.progress.processedWallets || 0,
                                                        campaign.progress.averageTxTime || (elapsedTime / campaign.progress.successfulTx)
                                                    )
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">remaining</div>
                                        </div>
                                    ) : campaign.progress.completedAt ? (
                                        <div>
                                            <div className="text-sm text-muted-foreground">Completed At</div>
                                            <div className="text-lg font-semibold text-green-400">
                                                {new Date(campaign.progress.completedAt).toLocaleTimeString()}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(campaign.progress.completedAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Configuration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Campaign Configuration">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Token Address:</span>
                                <span className="font-mono">{campaign.tokenAddress.slice(0, 16)}...</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Target Holders:</span>
                                <span className="font-semibold">{campaign.targetHolders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Start Time:</span>
                                <span>{new Date(campaign.timeRange?.startDate || campaign.timeRange?.start).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">End Time:</span>
                                <span>{new Date(campaign.timeRange?.endDate || campaign.timeRange?.end).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Sender Wallets:</span>
                                <span>{campaign.senderWallets.length}</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Metrics">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Gas Used:</span>
                                <span className="font-semibold">
                                    {campaign.metrics?.totalGasSpent
                                        ? parseFloat(ethers.formatEther(campaign.metrics.totalGasSpent)).toFixed(6)
                                        : '0'} BNB
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Average Gas:</span>
                                <span>{campaign.metrics?.avgGasPerTx || 0} BNB/tx</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tokens Distributed:</span>
                                <span className="font-semibold">
                                    {campaign.metrics?.totalTokensDistributed
                                        ? parseFloat(ethers.formatUnits(
                                            campaign.metrics.totalTokensDistributed,
                                            campaign.tokenInfo?.decimals || 18
                                        )).toLocaleString(undefined, { maximumFractionDigits: 2 })
                                        : '0'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Net New Holders:</span>
                                <span className="font-bold text-green-400">
                                    {campaign.metrics?.netNewHolders || 0}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card title="Wallet Filters">
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${campaign.filters.excludeContracts ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span>Exclude Contract Addresses</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${campaign.filters.excludeExistingHolders ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span>Exclude Existing Token Holders</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${campaign.filters.minBNBBalance ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span>Minimum BNB Balance: {campaign.filters.minBNBBalance || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${campaign.filters.cooldownPeriod ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                            <span>Cooldown Period: {campaign.filters.cooldownPeriod || 0} days</span>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
