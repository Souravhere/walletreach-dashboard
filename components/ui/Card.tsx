'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'luxury';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
}

export default function Card({ children, className = '', variant = 'luxury', hover = false, padding = 'md', onClick }: CardProps) {
    const variants = {
        default: 'bg-[#0a0a0a] border-white/5',
        glass: 'bg-white/[0.02] backdrop-blur-xl border-white/10',
        luxury: 'bg-gradient-to-b from-white/[0.04] to-transparent border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
    };

    const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-8' };

    return (
        <motion.div
            whileHover={hover ? { y: -4, borderColor: 'rgba(255,255,255,0.1)' } : {}}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-2xl border transition-colors ${variants[variant]} ${paddings[padding]} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}