'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import { usersAPI } from '@/lib/api';
import { 
    RiUserAddLine, 
    RiEditLine, 
    RiDeleteBinLine, 
    RiShieldUserLine, 
    RiMailLine, 
    RiAdminLine,
    RiLockPasswordLine,
    RiUserStarLine
} from 'react-icons/ri';

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'operator',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await usersAPI.getAll();
            setUsers(response.data.users);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await usersAPI.create(formData);
            setSuccess('Identity provisioned successfully.');
            setIsCreateModalOpen(false);
            setFormData({ username: '', email: '', password: '', role: 'operator' });
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to create user');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await usersAPI.update(selectedUser._id, { role: formData.role });
            setSuccess('Permissions updated successfully.');
            setIsEditModalOpen(false);
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to update user');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Proceed with permanent identity deletion?')) return;
        try {
            await usersAPI.delete(userId);
            setSuccess('User purged from the registry.');
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            password: '',
            role: user.role,
        });
        setIsEditModalOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 px-2 md:px-0">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-white">Registry</h1>
                    </div>
                    <Button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        variant="primary"
                        className="shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-white/20 transition-all px-6"
                    >
                        <RiUserAddLine size={18} />
                        <span>Add New Member</span>
                    </Button>
                </header>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Users Ledger Card */}
                <Card variant="luxury" padding="none" className="overflow-hidden border-white/5 bg-[#050505]/40 backdrop-blur-sm">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.01]">
                                    <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Member</th>
                                    <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Access Tier</th>
                                    <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                                    <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((user, idx) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-white/[0.02] transition-all duration-300"
                                    >
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center">
                                                    <span className="text-white font-bold text-sm">{user.username.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white tracking-wide">{user.username}</span>
                                                    <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                                                        <RiMailLine size={12} /> {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge variant={user.role === 'super_admin' ? 'success' : 'default'}>
                                                <div className="flex items-center gap-1.5">
                                                    {user.role === 'super_admin' ? <RiUserStarLine /> : <RiAdminLine />}
                                                    {user.role.replace('_', ' ')}
                                                </div>
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col w-fit gap-1">
                                                {user.isLocked ? (
                                                    <Badge variant="error">Security Lock</Badge>
                                                ) : user.isActive ? (
                                                    <Badge variant="success">Authorized</Badge>
                                                ) : (
                                                    <Badge variant="default">Inactive</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-white transition-all"
                                                >
                                                    <RiEditLine size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2.5 bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 rounded-xl text-red-500 transition-all"
                                                >
                                                    <RiDeleteBinLine size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Modals: Simplified for Premium Look */}
                <AnimatePresence>
                    {(isCreateModalOpen || isEditModalOpen) && (
                        <Modal
                            isOpen={true}
                            onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                            title={isCreateModalOpen ? "Provision New Member" : "Modify Member Access"}
                        >
                            <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-6 pt-4">
                                <div className="grid grid-cols-1 gap-6">
                                    <Input
                                        label="System Identity"
                                        placeholder="Username"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        disabled={isEditModalOpen}
                                        required
                                    />
                                    <Input
                                        label="Secure Communications"
                                        placeholder="Email Address"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={isEditModalOpen}
                                        required
                                    />
                                    {isCreateModalOpen && (
                                        <Input
                                            label="Access Password"
                                            placeholder="Min 8 characters"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                        />
                                    )}
                                    <Select
                                        label="Permission Tier"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        options={[
                                            { value: 'operator', label: 'Systems Operator' },
                                            { value: 'super_admin', label: 'Primary Administrator' },
                                        ]}
                                    />
                                </div>
                                <div className="flex flex-col-reverse md:flex-row gap-3 justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                                        className="px-6 py-3 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <Button type="submit" variant="primary" className="px-8 shadow-xl shadow-white/5">
                                        {isCreateModalOpen ? 'Add Identity' : 'Save Modifications'}
                                    </Button>
                                </div>
                            </form>
                        </Modal>
                    )}
                </AnimatePresence>
            </div>
        </DashboardLayout>
    );
}