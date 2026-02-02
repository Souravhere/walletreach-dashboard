'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import { analyticsAPI } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
    const [overview, setOverview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await analyticsAPI.getOverview();
            setOverview(response.data.overview);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch analytics');
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
                    <h1 className="text-3xl font-bold">Analytics</h1>
                    <p className="text-muted-foreground">System-wide metrics and statistics</p>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Total Campaigns</div>
                            <div className="text-3xl font-bold">{overview?.totalCampaigns || 0}</div>
                            <div className="text-xs text-muted-foreground">
                                {overview?.activeCampaigns || 0} active
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Total Transactions</div>
                            <div className="text-3xl font-bold">{overview?.totalTransactions || 0}</div>
                            <div className="text-xs text-green-400">
                                {overview?.successfulTransactions || 0} successful
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Holders Added</div>
                            <div className="text-3xl font-bold">{overview?.totalHoldersAdded || 0}</div>
                            <div className="text-xs text-muted-foreground">All time</div>
                        </div>
                    </Card>

                    <Card>
                        <div className="space-y-2">
                            <div className="text-sm text-muted-foreground">Success Rate</div>
                            <div className="text-3xl font-bold">
                                {overview?.successRate?.toFixed(1) || 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">Average</div>
                        </div>
                    </Card>
                </div>

                <Card title="Campaign Performance">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={overview?.campaignStats || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                />
                                <Legend />
                                <Bar dataKey="holders" fill="#22c55e" name="Holders Added" />
                                <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Success vs Failed Transactions">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                                    <span>Successful</span>
                                </div>
                                <span className="font-bold">{overview?.successfulTransactions || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                                    <span>Failed</span>
                                </div>
                                <span className="font-bold">{overview?.failedTransactions || 0}</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="System Status">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span>Active Wallets</span>
                                <span className="font-bold">{overview?.activeWallets || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Total Users</span>
                                <span className="font-bold">{overview?.totalUsers || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Unread Alerts</span>
                                <span className="font-bold">{overview?.unreadAlerts || 0}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
