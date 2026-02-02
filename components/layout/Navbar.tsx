'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiLogOut, FiUser } from 'react-icons/fi';
import { getUser, logout } from '@/lib/auth';
import { alertsAPI } from '@/lib/api';
import Badge from '../ui/Badge';

export default function Navbar() {
    const user = getUser();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Fetch unread alerts count
        const fetchUnreadCount = async () => {
            try {
                const response = await alertsAPI.getUnreadCount();
                setUnreadCount(response.data.count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();

        // Poll every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-16 border-b border-[var(--border-subtle)] flex items-center justify-between px-6 bg-black/80 backdrop-blur-xl sticky top-0 z-40"
        >
            {/* Left side - could be breadcrumbs */}
            <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-[var(--color-success)] rounded-full animate-pulse" />
                <span className="text-xs text-[var(--text-tertiary)] font-medium">Live</span>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center gap-4">
                {/* Alerts */}
                <motion.a
                    href="/dashboard/alerts"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2.5 hover:bg-[var(--bg-hover)] rounded-lg transition-all duration-200"
                >
                    <FiBell className="w-5 h-5 text-[var(--text-secondary)] hover:text-white transition-colors" />
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 bg-[var(--color-error)] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </motion.a>

                {/* Divider */}
                <div className="w-px h-8 bg-[var(--border-subtle)]" />

                {/* User info */}
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-9 h-9 bg-[var(--bg-elevated)] rounded-lg flex items-center justify-center border border-[var(--border-default)]"
                    >
                        <FiUser className="w-5 h-5 text-[var(--text-secondary)]" />
                    </motion.div>

                    {/* User details */}
                    <div className="text-right">
                        <div className="text-sm font-medium text-white">{user?.username}</div>
                        <Badge variant="default" size="sm">
                            {user?.role?.replace('_', ' ')}
                        </Badge>
                    </div>

                    {/* Logout button */}
                    <motion.button
                        onClick={logout}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 hover:bg-[var(--bg-hover)] hover:text-[var(--color-error)] rounded-lg transition-all duration-200 text-[var(--text-secondary)]"
                        title="Logout"
                    >
                        <FiLogOut className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </motion.nav>
    );
}

