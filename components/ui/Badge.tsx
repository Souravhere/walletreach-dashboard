'use client';

import { motion } from 'framer-motion';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'critical';
    size?: 'sm' | 'md';
    className?: string;
}

export default function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
    const variants = {
        default: 'bg-white/5 text-gray-400 border-white/10',
        success: 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
        error: 'bg-rose-500/5 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
        critical: 'bg-red-600/10 text-red-500 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
        warning: 'bg-amber-500/5 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
        info: 'bg-blue-500/5 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
    };

    const dotColors = {
        default: 'bg-gray-500',
        success: 'bg-emerald-500',
        error: 'bg-rose-500',
        critical: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500',
    };

    return (
        <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                inline-flex items-center gap-2 px-3 py-1 rounded-full border
                text-[10px] font-semibold uppercase tracking-[0.1em] backdrop-blur-md
                ${variants[variant]} ${size === 'sm' ? 'px-2 py-0.5' : ''} ${className}
            `}
        >
            {children}
        </motion.span>
    );
}