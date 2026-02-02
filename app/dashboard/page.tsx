'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { analyticsAPI, campaignsAPI, alertsAPI } from '@/lib/api';
import { FiTarget, FiCheckCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

export default function DashboardPage() {
    const [overview, setOverview] = useState<any>(null);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your holder growth campaigns</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={FiTarget}
                        label="Total Campaigns"
                        value={overview?.totalCampaigns || 0}
                        subtext={`${overview?.activeCampaigns || 0} active`}
                    />
                    <StatCard
                        icon={FiCheckCircle}
                        label="Successful Transactions"
                        value={overview?.successfulTransactions || 0}
                        subtext={`${overview?.successRate?.toFixed(1) || 0}% success rate`}
                    />
                    <StatCard
                        icon={FiTrendingUp}
                        label="Holders Added"
                        value={overview?.totalHoldersAdded || 0}
                        subtext="All time"
                    />
                    <StatCard
                        icon={FiAlertCircle}
                        label="Active Alerts"
                        value={alerts.length}
                        subtext="Unread notifications"
                    />
                </div>

                {/* Running Campaigns */}
                <Card title="Running Campaigns">
                    {campaigns.length === 0 ? (
                        <p className="text-muted-foreground">No campaigns currently running</p>
                    ) : (
                        <div className="space-y-3">
                            {campaigns.map((campaign) => (
                                <motion.div
                                    key={campaign._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-between p-4 border border-border rounded hover:border-border-light transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium">{campaign.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {campaign.progress.processedWallets} / {campaign.progress.totalWallets} processed
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {((campaign.progress.processedWallets / campaign.progress.totalWallets) * 100).toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {campaign.progress.successfulTx} successful
                                            </div>
                                        </div>
                                        <Badge variant="success">Running</Badge>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Recent Alerts */}
                <Card title="Recent Alerts">
                    {alerts.length === 0 ? (
                        <p className="text-muted-foreground">No unread alerts</p>
                    ) : (
                        <div className="space-y-2">
                            {alerts.map((alert) => (
                                <div
                                    key={alert._id}
                                    className="flex items-start gap-3 p-3 border border-border rounded"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium text-sm">{alert.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                                    </div>
                                    <Badge variant={alert.type as any}>{alert.type}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ icon: Icon, label, value, subtext }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black border border-border rounded-lg p-6"
        >
            <div className="flex items-center gap-3 mb-2">
                <Icon size={20} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <div className="text-3xl font-bold">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">{subtext}</div>
        </motion.div>
    );
}
