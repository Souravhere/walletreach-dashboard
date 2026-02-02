'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { campaignsAPI } from '@/lib/api';
import { FiPlus, FiPlay, FiPause, FiSquare, FiEye, FiTrash2 } from 'react-icons/fi';

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCampaigns();
        const interval = setInterval(fetchCampaigns, 10000); // Refresh every 10s
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

    const handleStart = async (id: string) => {
        try {
            await campaignsAPI.start(id);
            setSuccess('Campaign started!');
            fetchCampaigns();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to start campaign');
        }
    };

    const handlePause = async (id: string) => {
        try {
            await campaignsAPI.pause(id);
            setSuccess('Campaign paused!');
            fetchCampaigns();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to pause campaign');
        }
    };

    const handleStop = async (id: string) => {
        if (!confirm('Are you sure you want to stop this campaign?')) return;
        try {
            await campaignsAPI.stop(id);
            setSuccess('Campaign stopped!');
            fetchCampaigns();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to stop campaign');
        }
    };

    const handleRestart = async (id: string) => {
        if (!confirm('Are you sure you want to restart this campaign? Progress will be reset.')) return;
        try {
            await campaignsAPI.restart(id);
            setSuccess('Campaign restarted successfully!');
            fetchCampaigns();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to restart campaign');
        }
    };


    const handleDelete = async (id: string) => {
        if (!confirm('⚠️ Are you sure you want to DELETE this campaign? This action cannot be undone!')) return;
        try {
            await campaignsAPI.delete(id);
            setSuccess('Campaign deleted successfully!');
            fetchCampaigns();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to delete campaign');
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Campaigns</h1>
                        <p className="text-muted-foreground">Manage holder growth campaigns</p>
                    </div>
                    <Button onClick={() => router.push('/dashboard/campaigns/new')} variant="primary">
                        <FiPlus size={20} />
                        New Campaign
                    </Button>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

                <div className="space-y-4">
                    {campaigns.map((campaign) => (
                        <motion.div
                            key={campaign._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold">{campaign.name}</h3>
                                            <Badge variant={getStatusVariant(campaign.status)}>
                                                {campaign.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Token:</span>
                                                <div className="font-mono">{campaign.tokenAddress.slice(0, 10)}...</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Progress:</span>
                                                <div>
                                                    {campaign.progress?.processedWallets || 0} / {campaign.progress?.totalWallets || 0}
                                                    {' '}({campaign.progress?.totalWallets > 0 ? ((campaign.progress.processedWallets / campaign.progress.totalWallets) * 100).toFixed(1) : '0'}%)
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Success Rate:</span>
                                                <div>{(campaign.metrics?.successRate || 0).toFixed(1)}%</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Created:</span>
                                                <div>{new Date(campaign.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        {campaign.status === 'running' && (
                                            <div className="mt-4">
                                                <div className="w-full bg-border rounded-full h-2">
                                                    <div
                                                        className="bg-green-500 h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${campaign.progress?.totalWallets > 0 ? (campaign.progress.processedWallets / campaign.progress.totalWallets) * 100 : 0}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            onClick={() => router.push(`/dashboard/campaigns/${campaign._id}`)}
                                            variant="secondary"
                                        >
                                            <FiEye size={16} />
                                        </Button>

                                        {campaign.status === 'draft' && (
                                            <Button onClick={() => handleStart(campaign._id)} variant="primary">
                                                <FiPlay size={16} />
                                            </Button>
                                        )}

                                        {campaign.status === 'running' && (
                                            <>
                                                <Button onClick={() => handlePause(campaign._id)} variant="secondary">
                                                    <FiPause size={16} />
                                                </Button>
                                                <Button onClick={() => handleStop(campaign._id)} variant="danger">
                                                    <FiSquare size={16} />
                                                </Button>
                                            </>
                                        )}

                                        {campaign.status === 'paused' && (
                                            <Button onClick={() => handleStart(campaign._id)} variant="primary">
                                                <FiPlay size={16} />
                                            </Button>
                                        )}


                                        {/* Restart and Delete buttons for completed/stopped/failed campaigns */}
                                        {['completed', 'stopped', 'failed'].includes(campaign.status) && (
                                            <>
                                                <Button onClick={() => handleRestart(campaign._id)} variant="primary">
                                                    <FiPlay size={16} />
                                                </Button>
                                                <Button onClick={() => handleDelete(campaign._id)} variant="danger">
                                                    <FiTrash2 size={16} />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    {campaigns.length === 0 && (
                        <Card>
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No campaigns yet. Create your first campaign to get started!</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
