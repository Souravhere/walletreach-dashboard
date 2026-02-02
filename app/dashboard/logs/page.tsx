'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { logsAPI } from '@/lib/api';

export default function LogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('transactions');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [activeTab]);

    const fetchLogs = async () => {
        try {
            const response = activeTab === 'transactions'
                ? await logsAPI.getTransactions()
                : await logsAPI.getAudit();
            setLogs(response.data.logs || response.data.transactions || []);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch logs');
        } finally {
            setLoading(false);
        }
    };

    const formatTokenAmount = (amount: string, decimals: number = 18) => {
        try {
            return parseFloat(ethers.formatUnits(amount, decimals)).toLocaleString(undefined, {
                maximumFractionDigits: 6
            });
        } catch (e) {
            return amount;
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
                    <h1 className="text-3xl font-bold">Logs</h1>
                    <p className="text-muted-foreground">Transaction and audit logs</p>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                <div className="flex gap-2">
                    <Button
                        onClick={() => setActiveTab('transactions')}
                        variant={activeTab === 'transactions' ? 'primary' : 'secondary'}
                    >
                        Transactions
                    </Button>
                    <Button
                        onClick={() => setActiveTab('audit')}
                        variant={activeTab === 'audit' ? 'primary' : 'secondary'}
                    >
                        Audit Logs
                    </Button>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    {activeTab === 'transactions' ? (
                                        <>
                                            <th className="text-left py-3 px-4">TX Hash</th>
                                            <th className="text-left py-3 px-4">Recipient</th>
                                            <th className="text-left py-3 px-4">Amount</th>
                                            <th className="text-left py-3 px-4">Status</th>
                                            <th className="text-left py-3 px-4">Date</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="text-left py-3 px-4">Action</th>
                                            <th className="text-left py-3 px-4">User</th>
                                            <th className="text-left py-3 px-4">Resource</th>
                                            <th className="text-left py-3 px-4">IP Address</th>
                                            <th className="text-left py-3 px-4">Date</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log: any) => (
                                    <motion.tr
                                        key={log._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-border hover:bg-white/5"
                                    >
                                        {activeTab === 'transactions' ? (
                                            <>
                                                <td className="py-3 px-4 font-mono text-sm">
                                                    {log.txHash ? `${log.txHash.slice(0, 10)}...` : 'Pending'}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-sm">
                                                    {log.recipientAddress.slice(0, 10)}...
                                                </td>
                                                <td className="py-3 px-4">{formatTokenAmount(log.amount)} tokens</td>
                                                <td className="py-3 px-4">
                                                    <Badge variant={log.status === 'success' ? 'success' : 'error'}>
                                                        {log.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-3 px-4">{log.action}</td>
                                                <td className="py-3 px-4">{log.userId?.username || 'System'}</td>
                                                <td className="py-3 px-4">
                                                    {log.resourceType}: {log.resourceId}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-sm">{log.ipAddress}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                            </>
                                        )}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {logs.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No logs to display</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
}
