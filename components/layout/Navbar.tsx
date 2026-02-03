'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    RiNotification3Line, 
    RiLogoutCircleRLine, 
    RiUser6Line, 
    RiShieldCheckLine,
    RiRadioButtonLine,
    RiCheckboxCircleFill
} from 'react-icons/ri';
import { getUser, logout } from '@/lib/auth';
import { alertsAPI } from '@/lib/api';

export default function Navbar() {
    const user = getUser();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const response = await alertsAPI.getUnreadCount();
                setUnreadCount(response.data.count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.nav
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-[#050505]/60 backdrop-blur-3xl sticky top-0 z-40"
        >
            {/* Left side - Status (Desktop) / Logo (Mobile) */}
            <div className="flex items-center gap-4">
                {/* Desktop Status */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/[0.02] border border-white/5 rounded-full shadow-inner">
                    <RiRadioButtonLine className="text-green-500 animate-pulse text-sm" />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Live</span>
                </div>

                {/* Mobile Logo (Visible only on small screens) */}
                <div className="flex md:hidden items-center gap-2 ml-10">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        <RiCheckboxCircleFill className="text-black text-xl" />
                    </div>
                    <span className="font-bold text-base tracking-tighter text-white">123done</span>
                </div>
            </div>

            {/* Right side - User Hub */}
            <div className="flex items-center gap-3 md:gap-5">
                
                {/* Premium Icon Container: Notifications */}
                <motion.a
                    href="/dashboard/alerts"
                    whileHover={{ y: -2, backgroundColor: "rgba(255,255,255,0.06)" }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-10 h-10 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-xl transition-all duration-300 shadow-lg group"
                >
                    <RiNotification3Line className="text-xl text-gray-400 group-hover:text-white transition-colors" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 bg-white text-black text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-[#050505] shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.a>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-white/10 mx-1" />

                {/* User Profile Hub */}
                <div className="flex items-center gap-3">
                    {/* User Text */}
                    <div className="hidden sm:flex flex-col text-right">
                        <span className="text-sm font-bold text-white tracking-tight leading-none">
                            {user?.username || 'Administrator'}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">
                            {user?.role?.replace('_', ' ') || 'Super User'}
                        </span>
                    </div>

                    {/* Premium Icon Container: Avatar */}
                    <motion.div
                        whileHover={{ y: -2, borderColor: "rgba(255,255,255,0.2)" }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 flex items-center justify-center shadow-2xl group cursor-pointer"
                    >
                        <RiUser6Line className="text-lg text-gray-400 group-hover:text-white transition-colors" />
                    </motion.div>

                    {/* Logout Container */}
                    <motion.button
                        onClick={logout}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all duration-300"
                    >
                        <RiLogoutCircleRLine className="text-xl" />
                    </motion.button>
                </div>
            </div>
        </motion.nav>
    );
}