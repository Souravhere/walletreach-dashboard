'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import { walletsAPI } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import Toggle from '@/components/ui/Toggle';

export default function WalletsPage() {
    const [wallets, setWallets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedWallet, setSelectedWallet] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPrivateKey, setShowPrivateKey] = useState(false);
    const [togglingWallet, setTogglingWallet] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        privateKey: '',
        description: '',
        maxTxPerDay: 500,
        maxAmountPerDay: 1000000,
        maxPendingTx: 3,
        status: 'active',
    });

    useEffect(() => {
        fetchWallets();
    }, []);

    const fetchWallets = async () => {
        try {
            const response = await walletsAPI.getAll();
            setWallets(response.data.wallets);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch wallets');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await walletsAPI.add(formData);
            setSuccess('Wallet added successfully!');
            setIsAddModalOpen(false);
            setFormData({
                name: '',
                privateKey: '',
                description: '',
                maxTxPerDay: 500,
                maxAmountPerDay: 1000000,
                maxPendingTx: 3,
                status: 'active',
            });
            fetchWallets();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to add wallet');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await walletsAPI.update(selectedWallet._id, {
                maxTxPerDay: formData.maxTxPerDay,
                maxAmountPerDay: formData.maxAmountPerDay,
                maxPendingTx: formData.maxPendingTx,
                status: formData.status,
            });
            setSuccess('Wallet updated successfully!');
            setIsEditModalOpen(false);
            fetchWallets();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to update wallet');
        }
    };

    const handleToggleStatus = async (walletId: string) => {
        setTogglingWallet(walletId);
        setError('');

        try {
            const response = await walletsAPI.toggleStatus(walletId);
            setSuccess(response.data.message || 'Wallet status updated successfully!');
            fetchWallets();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to toggle wallet status');
        } finally {
            setTogglingWallet(null);
        }
    };

    const handleDelete = async (walletId: string) => {
        if (!confirm('Are you sure you want to delete this wallet?')) return;

        try {
            await walletsAPI.delete(walletId);
            setSuccess('Wallet deleted successfully!');
            fetchWallets();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to delete wallet');
        }
    };

    const openEditModal = (wallet: any) => {
        setSelectedWallet(wallet);
        setFormData({
            name: wallet.name,
            privateKey: '',
            description: wallet.description,
            maxTxPerDay: wallet.limits.maxTxPerDay,
            maxAmountPerDay: wallet.limits.maxAmountPerDay,
            maxPendingTx: wallet.limits.maxPendingTx,
            status: wallet.status || 'active',
        });
        setIsEditModalOpen(true);
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
                        <h1 className="text-3xl font-bold">Wallets</h1>
                        <p className="text-muted-foreground">Manage sender wallets for campaigns</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} variant="primary">
                        <FiPlus size={20} />
                        Add Wallet
                    </Button>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wallets.map((wallet) => (
                        <motion.div
                            key={wallet._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card>
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{wallet.name}</h3>
                                            <p className="text-sm text-muted-foreground font-mono">
                                                {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Toggle
                                                checked={wallet.status === 'active'}
                                                onChange={() => handleToggleStatus(wallet._id)}
                                                loading={togglingWallet === wallet._id}
                                                size="md"
                                            />
                                            <span className={`text-xs font-medium ${wallet.status === 'active'
                                                    ? 'text-green-400'
                                                    : 'text-gray-500'
                                                }`}>
                                                {wallet.status === 'active' ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>

                                    {wallet.description && (
                                        <p className="text-sm text-muted-foreground">{wallet.description}</p>
                                    )}

                                    <div className="border-t border-border pt-4">
                                        <h4 className="text-sm font-medium mb-2">Daily Limits</h4>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <div>TX: {wallet.usage.txToday} / {wallet.limits.maxTxPerDay}</div>
                                            <div>Amount: {wallet.usage.amountToday} / {wallet.limits.maxAmountPerDay}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <Button
                                            onClick={() => openEditModal(wallet)}
                                            variant="secondary"
                                            className="flex-1"
                                        >
                                            <FiEdit2 size={16} />
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(wallet._id)}
                                            variant="danger"
                                            className="flex-1"
                                        >
                                            <FiTrash2 size={16} />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Add Wallet Modal */}
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Add New Wallet"
                >
                    <form onSubmit={handleAdd} className="space-y-4">
                        <Input
                            label="Wallet Name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Sender Wallet 1"
                            required
                        />
                        <div className="relative">
                            <Input
                                label="Private Key"
                                type={showPrivateKey ? 'text' : 'password'}
                                value={formData.privateKey}
                                onChange={(e) => setFormData({ ...formData, privateKey: e.target.value })}
                                placeholder="0x..."
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPrivateKey(!showPrivateKey)}
                                className="absolute right-3 top-9 text-muted-foreground hover:text-white"
                            >
                                {showPrivateKey ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                        <Input
                            label="Description (optional)"
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Main distribution wallet"
                        />
                        <Input
                            label="Max TX per Day"
                            type="number"
                            value={formData.maxTxPerDay}
                            onChange={(e) => setFormData({ ...formData, maxTxPerDay: parseInt(e.target.value) })}
                            required
                        />
                        <Input
                            label="Max Amount per Day"
                            type="number"
                            value={formData.maxAmountPerDay}
                            onChange={(e) => setFormData({ ...formData, maxAmountPerDay: parseInt(e.target.value) })}
                            required
                        />
                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Add Wallet
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Wallet Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit Wallet Limits"
                >
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Input
                            label="Wallet Name"
                            type="text"
                            value={formData.name}
                            disabled
                        />
                        <Input
                            label="Max TX per Day"
                            type="number"
                            value={formData.maxTxPerDay}
                            onChange={(e) => setFormData({ ...formData, maxTxPerDay: parseInt(e.target.value) })}
                            required
                        />
                        <Input
                            label="Max Amount per Day"
                            type="number"
                            value={formData.maxAmountPerDay}
                            onChange={(e) => setFormData({ ...formData, maxAmountPerDay: parseInt(e.target.value) })}
                            required
                        />
                        <Input
                            label="Max Pending TX"
                            type="number"
                            value={formData.maxPendingTx}
                            onChange={(e) => setFormData({ ...formData, maxPendingTx: parseInt(e.target.value) })}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium mb-2 text-white/80">
                                Wallet Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-white/30 focus:outline-none transition-colors"
                            >
                                <option value="active">Active</option>
                                <option value="paused">Paused</option>
                                <option value="disabled">Disabled</option>
                            </select>
                            <p className="text-xs text-white/40 mt-1.5">
                                Set to 'Active' to enable sending transactions.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Update Wallet
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
