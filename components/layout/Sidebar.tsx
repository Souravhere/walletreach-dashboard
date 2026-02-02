'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
// Premium React Icons Selection
import { 
    HiOutlineSquares2X2, 
    HiOutlineCube, 
    HiOutlineUsers, 
    HiOutlineCog6Tooth,
    HiOutlineChartBar,
    HiOutlineEnvelope,
    HiOutlineClipboardDocumentList,
    HiOutlineChevronRight,
    HiOutlineChevronLeft,
    HiOutlineSparkles
} from "react-icons/hi2";
import { RiWallet3Line, RiCheckFill } from "react-icons/ri";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const user = { role: 'super_admin' };

    // Grouping items to match the "Shop" vs "Tools" layout in your image
    const navigationGroups = [
        {
            group: "Main",
            items: [
                { name: 'Dashboard', icon: HiOutlineSquares2X2, href: '/dashboard', roles: ['operator', 'super_admin'] },
                { name: 'Campaigns', icon: HiOutlineCube, href: '/dashboard/campaigns', roles: ['operator', 'super_admin'] },
                { name: 'Wallets', icon: RiWallet3Line, href: '/dashboard/keys', roles: ['operator', 'super_admin'], badge: "12" },
                { name: 'Large Campaigns', icon: HiOutlineSparkles, href: '/dashboard/large-campaigns', roles: ['operator', 'super_admin'] },
            ]
        },
        {
            group: "Tools",
            items: [
                { name: 'Analytics', icon: HiOutlineChartBar, href: '/dashboard/analytics', roles: ['operator', 'super_admin'], isNew: true },
                { name: 'Alerts', icon: HiOutlineEnvelope, href: '/dashboard/alerts', roles: ['operator', 'super_admin'] },
                { name: 'Logs', icon: HiOutlineClipboardDocumentList, href: '/dashboard/logs', roles: ['operator', 'super_admin'] },
                { name: 'Users', icon: HiOutlineUsers, href: '/dashboard/users', roles: ['super_admin'] },
                { name: 'Settings', icon: HiOutlineCog6Tooth, href: '/dashboard/settings', roles: ['super_admin'] },
            ]
        }
    ];

    const toggleCollapse = () => setCollapsed(!collapsed);

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 84 : 280 }}
            className="fixed left-0 top-0 h-screen bg-[#050505] text-white border-r border-white/5 z-50 flex flex-col transition-all ease-in-out"
        >
            {/* Header: Logo Area */}
            <div className="h-20 flex items-center px-6 mb-4 relative">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="min-w-[32px] h-8 w-8 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        <RiCheckFill className="text-black text-xl" />
                    </div>
                    {!collapsed && (
                        <motion.span 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }}
                            className="text-xl font-bold tracking-tight whitespace-nowrap"
                        >
                            123done
                        </motion.span>
                    )}
                </div>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-8">
                {navigationGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-2">
                        {/* Group Label */}
                        <p className={`px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 transition-opacity ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
                            {group.group}
                        </p>

                        <ul className="space-y-1.5">
                            {group.items.filter(i => i.roles.includes(user.role)).map((item) => {
                                const isActive = pathname === item.href;
                                const Icon = item.icon;

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className={`
                                                group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                                                ${isActive ? 'bg-[#1a1a1a] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                                            `}
                                        >
                                            {/* Glow effect for active item */}
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="glow"
                                                    className="absolute inset-0 bg-white/[0.03] rounded-xl blur-md"
                                                />
                                            )}

                                            <Icon className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                            
                                            {!collapsed && (
                                                <motion.div 
                                                    className="flex flex-1 items-center justify-between"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                >
                                                    <span className="text-[14px] font-medium tracking-wide">{item.name}</span>
                                                    
                                                    {/* Badge Logic */}
                                                    {item.badge && (
                                                        <span className="bg-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {item.isNew && (
                                                        <span className="bg-green-500/10 text-green-500 text-[9px] px-1.5 py-0.5 rounded border border-green-500/20 font-bold">
                                                            NEW
                                                        </span>
                                                    )}
                                                </motion.div>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer / Toggle */}
            <div className="p-4 mt-auto">
                <button
                    onClick={toggleCollapse}
                    className="w-full flex items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-all border border-white/5"
                >
                    {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
                </button>
            </div>
        </motion.aside>
    );
}