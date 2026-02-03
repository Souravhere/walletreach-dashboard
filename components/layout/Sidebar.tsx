'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
// Premium Icons
import { 
    RiHome4Line, 
    RiTeamLine, 
    RiKey2Line, 
    RiFocus3Line, 
    RiNotification4Line, 
    RiFileTextLine, 
    RiBarChartGroupedLine, 
    RiSettings3Line,
    RiMenu4Fill,
    RiCloseFill,
    RiCheckboxCircleFill
} from 'react-icons/ri';
import { GiTargeting } from "react-icons/gi";
// --- Types ---
interface NavItem {
    name: string;
    icon: React.ElementType;
    href: string;
    roles: string[];
    badge?: string;
}

const MENU_ITEMS: NavItem[  ] = [
    { name: 'Dashboard', icon: RiHome4Line, href: '/dashboard', roles: ['operator', 'super_admin'] },
    { name: 'Campaigns', icon: RiFocus3Line, href: '/dashboard/campaigns', roles: ['operator', 'super_admin'] },
    { name: 'Large Campaigns', icon: GiTargeting, href: '/dashboard/large-campaigns', roles: ['operator', 'super_admin'] },
    { name: 'Wallets', icon: RiKey2Line, href: '/dashboard/keys', roles: ['operator', 'super_admin'] },
    { name: 'Analytics', icon: RiBarChartGroupedLine, href: '/dashboard/analytics', roles: ['operator', 'super_admin'] },
    { name: 'Alerts', icon: RiNotification4Line, href: '/dashboard/alerts', roles: ['operator', 'super_admin'] },
    { name: 'Logs', icon: RiFileTextLine, href: '/dashboard/logs', roles: ['operator', 'super_admin'] },
    { name: 'Users', icon: RiTeamLine, href: '/dashboard/users', roles: ['super_admin'] },
    { name: 'Settings', icon: RiSettings3Line, href: '/dashboard/settings', roles: ['super_admin'] },
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const user = { role: 'super_admin' };

    const filteredItems = MENU_ITEMS.filter(item => item.roles.includes(user?.role));

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const NavContent = () => (
        <div className="flex flex-col h-full bg-[#050505] text-white">
            {/* Header */}
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                        <RiCheckboxCircleFill className="text-black text-2xl" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight leading-none">WalletReach</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Premium Engine</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
                <LayoutGroup id="sidebar-nav">
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link key={item.href} href={item.href} className="relative block group">
                                <div className={`
                                    relative flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500
                                    ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-200'}
                                `}>
                                    {/* Animated Active Indicator */}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activePill"
                                            className="absolute inset-0 bg-[#111] border border-white/5 rounded-2xl shadow-xl shadow-black"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}

                                    <item.icon className={`relative z-10 text-xl transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    
                                    <span className="relative z-10 text-[15px] font-medium tracking-wide">
                                        {item.name}
                                    </span>

                                    {/* Small dot for active items */}
                                    {isActive && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute left-0 w-1 h-5 bg-white rounded-r-full" 
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </LayoutGroup>
            </nav>

            {/* Footer Status */}
            <div className="p-6 border-t border-white/5">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#0a0a0a] rounded-2xl border border-white/5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">System Active</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* MOBILE TOGGLE BUTTON */}
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed top-6 left-6 z-40 p-3 bg-black border border-white/10 rounded-2xl text-white md:hidden shadow-2xl"
            >
                <RiMenu4Fill size={24} />
            </button>

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[280px] z-50 shadow-[20px_0_50px_rgba(0,0,0,0.3)]">
                <NavContent />
            </aside>

            {/* MOBILE SIDEBAR OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] md:hidden"
                        />
                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-screen w-[85%] max-w-[320px] z-[70] md:hidden shadow-2xl"
                        >
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-[-50px] text-white"
                            >
                                <RiCloseFill size={32} />
                            </button>
                            <NavContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}