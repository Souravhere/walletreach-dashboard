'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { settingsAPI } from '@/lib/api';

export default function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleEmergencyStop = async () => {
        if (!confirm('Are you sure you want to EMERGENCY STOP all running campaigns? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await settingsAPI.emergencyStop();
            setSuccess('Emergency stop activated! All campaigns have been stopped.');
            setTimeout(() => setSuccess(''), 5000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to activate emergency stop');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">System configuration and emergency controls</p>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

                <Card title="Emergency Controls">
                    <div className="space-y-4">
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ Emergency Stop</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Immediately stop ALL running campaigns. Use this only in critical situations.
                                This action will pause all active transactions and mark campaigns as stopped.
                            </p>
                            <Button
                                onClick={handleEmergencyStop}
                                variant="danger"
                                isLoading={loading}
                            >
                                Activate Emergency Stop
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card title="System Information">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Backend URL</div>
                                <div className="font-mono text-sm">{process.env.NEXT_PUBLIC_API_URL}</div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Environment</div>
                                <div className="font-mono text-sm">
                                    {process.env.NODE_ENV || 'development'}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="BSC RPC Endpoints">
                    <div className="space-y-2 text-sm">
                        <p className="text-muted-foreground mb-4">
                            Configured RPC endpoints for BNB Smart Chain. The system automatically rotates
                            between these endpoints for load distribution and reliability.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-mono">https://bsc-dataseed1.binance.org</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-mono">https://bsc-dataseed2.binance.org</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="font-mono">https://bsc-dataseed3.binance.org</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="About">
                    <div className="text-sm text-muted-foreground space-y-2">
                        <p><strong>WalletReach</strong> - Internal Holder Growth Engine</p>
                        <p>Version 1.0.0</p>
                        <p>© 2026 Internal Use Only</p>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
