'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import { usersAPI } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

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
            setSuccess('User created successfully!');
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
            await usersAPI.update(selectedUser._id, {
                role: formData.role,
            });
            setSuccess('User updated successfully!');
            setIsEditModalOpen(false);
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (error: any) {
            setError(error.response?.data?.error || 'Failed to update user');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            await usersAPI.delete(userId);
            setSuccess('User deleted successfully!');
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
                        <h1 className="text-3xl font-bold">Users</h1>
                        <p className="text-muted-foreground">Manage system users and roles</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                        <FiPlus size={20} />
                        Add User
                    </Button>
                </div>

                {error && <Alert type="critical" onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4">Username</th>
                                    <th className="text-left py-3 px-4">Email</th>
                                    <th className="text-left py-3 px-4">Role</th>
                                    <th className="text-left py-3 px-4">Status</th>
                                    <th className="text-right py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-border hover:bg-white/5"
                                    >
                                        <td className="py-3 px-4 font-medium">{user.username}</td>
                                        <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <Badge variant={user.role === 'super_admin' ? 'success' : 'default'}>
                                                {user.role.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            {user.isLocked ? (
                                                <Badge variant="error">Locked</Badge>
                                            ) : user.isActive ? (
                                                <Badge variant="success">Active</Badge>
                                            ) : (
                                                <Badge variant="default">Inactive</Badge>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-2 hover:bg-white/10 rounded transition-colors"
                                                    title="Edit user"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400"
                                                    title="Delete user"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Create User Modal */}
                <Modal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    title="Create New User"
                >
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            label="Username"
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                        <Select
                            label="Role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            options={[
                                { value: 'operator', label: 'Operator' },
                                { value: 'super_admin', label: 'Super Admin' },
                            ]}
                        />
                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Create User
                            </Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit User Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit User"
                >
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <Input
                            label="Username"
                            type="text"
                            value={formData.username}
                            disabled
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            disabled
                        />
                        <Select
                            label="Role"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            options={[
                                { value: 'operator', label: 'Operator' },
                                { value: 'super_admin', label: 'Super Admin' },
                            ]}
                        />
                        <div className="flex gap-3 justify-end pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary">
                                Update User
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}
