'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome,
    FiUsers,
    FiKey,
    FiTarget,
    FiBell,
    FiFileText,
    FiBarChart2,
    FiSettings,
    FiChevronLeft,
    FiChevronRight,
    FiZap,
} from 'react-icons/fi';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    // Mock user - in production this would come from auth context
    const user = { role: 'super_admin' };

    const menuItems = [
        { name: 'Dashboard', icon: FiHome, href: '/dashboard', roles: ['operator', 'super_admin'] },
        { name: 'Campaigns', icon: FiTarget, href: '/dashboard/campaigns', roles: ['operator', 'super_admin'] },
        { name: 'Large Campaigns', icon: FiZap, href: '/dashboard/large-campaigns', roles: ['operator', 'super_admin'] },
        { name: 'Wallets', icon: FiKey, href: '/dashboard/keys', roles: ['operator', 'super_admin'] },
        { name: 'Analytics', icon: FiBarChart2, href: '/dashboard/analytics', roles: ['operator', 'super_admin'] },
        { name: 'Alerts', icon: FiBell, href: '/dashboard/alerts', roles: ['operator', 'super_admin'] },
        { name: 'Logs', icon: FiFileText, href: '/dashboard/logs', roles: ['operator', 'super_admin'] },
        { name: 'Users', icon: FiUsers, href: '/dashboard/users', roles: ['super_admin'] },
        { name: 'Settings', icon: FiSettings, href: '/dashboard/settings', roles: ['super_admin'] },
    ];

    const filteredItems = menuItems.filter(item =>
        item.roles.includes(user?.role)
    );

    const toggleCollapse = () => setCollapsed(!collapsed);

    return (
        <motion.aside
            initial={{ width: 256 }}
            animate={{ width: collapsed ? 80 : 256 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-0 top-0 h-screen bg-black border-r border-[var(--border-subtle)] z-50 flex flex-col"
            style={{ willChange: 'width' }}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-subtle)]">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            key="logo"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[var(--shadow-glow)]">
                                <span className="text-black font-bold text-sm">WR</span>
                            </div>
                            <div>
                                <h1 className="text-base font-semibold tracking-tight">WalletReach</h1>
                                <p className="text-xs text-[var(--text-tertiary)]">Internal Engine</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleCollapse}
                    className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-all duration-200 hover:scale-110"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {collapsed ? (
                        <FiChevronRight className="w-5 h-5" />
                    ) : (
                        <FiChevronLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6">
                <ul className="space-y-1 px-3">
                    {filteredItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <motion.li
                                key={item.href}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                            >
                                <Link
                                    href={item.href}
                                    className={`
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive
                                            ? 'bg-white text-black shadow-lg'
                                            : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
                                        }
                  `}
                                >
                                    {/* Active Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute inset-0 bg-white rounded-lg"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            style={{ zIndex: -1 }}
                                        />
                                    )}

                                    {/* Content */}
                                    <div className="relative flex items-center gap-3 w-full z-10">
                                        <Icon
                                            className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-black scale-110' : 'group-hover:scale-110'
                                                }`}
                                        />

                                        <AnimatePresence mode="wait">
                                            {!collapsed && (
                                                <motion.span
                                                    key="label"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className={`text-sm font-medium ${isActive ? 'text-black' : ''}`}
                                                >
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Hover Effect */}
                                    {!isActive && (
                                        <motion.div
                                            className="absolute inset-0 bg-white rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-200"
                                            style={{ zIndex: -1 }}
                                        />
                                    )}
                                </Link>
                            </motion.li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[var(--border-subtle)]">
                <AnimatePresence mode="wait">
                    {!collapsed ? (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="px-3 py-3 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-subtle)]"
                        >
                            <p className="text-xs text-[var(--text-tertiary)] mb-2 font-medium">System Status</p>
                            <div className="flex items-center gap-2">
                                <motion.div
                                    className="w-2 h-2 bg-[var(--color-success)] rounded-full"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className="text-xs font-medium">All Systems Operational</span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="status-dot"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex justify-center"
                        >
                            <motion.div
                                className="w-3 h-3 bg-[var(--color-success)] rounded-full"
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.aside>
    );
}
