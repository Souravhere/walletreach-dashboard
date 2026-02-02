'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { alertsAPI } from '@/lib/api';
import { FiTrash2, FiCheckCircle } from 'react-icons/fi';

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAlerts();
    }, [filter]);

    const fetchAlerts = async () => {
        try {
            const params = filter !== 'all' ? { type: filter } : {};
            const response = await alertsAPI.getAll(params);
            setAlerts(response.data.alerts);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await alertsAPI.markAsRead(id);
            fetchAlerts();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to mark as read');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await alertsAPI.delete(id);
            fetchAlerts();
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to delete alert');
        }
    };

    const getAlertVariant = (type: string) => {
        switch (type) {
            case 'info': return 'default';
            case 'warning': return 'paused';
            case 'critical': return 'failed';
            default: return 'default';
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
                    <h1 className="text-3xl font-bold">Alerts</h1>
                    <p className="text-muted-foreground">System notifications and alerts</p>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}

                <div className="flex gap-2">
                    {['all', 'info', 'warning', 'critical'].map((type) => (
                        <Button
                            key={type}
                            onClick={() => setFilter(type)}
                            variant={filter === type ? 'primary' : 'secondary'}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                    ))}
                </div>

                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <Card className={alert.isRead ? 'opacity-60' : ''}>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold">{alert.title}</h3>
                                            <Badge variant={getAlertVariant(alert.type)}>
                                                {alert.type}
                                            </Badge>
                                            {!alert.isRead && (
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(alert.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!alert.isRead && (
                                            <button
                                                onClick={() => handleMarkAsRead(alert._id)}
                                                className="p-2 hover:bg-green-500/20 rounded text-green-400"
                                                title="Mark as read"
                                            >
                                                <FiCheckCircle size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(alert._id)}
                                            className="p-2 hover:bg-red-500/20 rounded text-red-400"
                                            title="Delete"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    {alerts.length === 0 && (
                        <Card>
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No alerts to display</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
