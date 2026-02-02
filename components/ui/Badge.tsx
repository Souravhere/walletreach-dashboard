'use client';

import { motion } from 'framer-motion';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
    size?: 'sm' | 'md' | 'lg';
    dot?: boolean;
    className?: string;
}

export default function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = '',
}: BadgeProps) {
    const baseStyles = `
    inline-flex items-center gap-1.5 font-medium rounded-full
    transition-all duration-200
  `;

    const variants = {
        default: 'bg-[var(--bg-elevated)] text-white border border-[var(--border-default)]',
        success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20',
        error: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20',
        warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20',
        info: 'bg-[var(--color-info)]/10 text-[var(--color-info)] border border-[var(--color-info)]/20',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
    };

    const dotColors = {
        default: 'bg-white',
        success: 'bg-[var(--color-success)]',
        error: 'bg-[var(--color-error)]',
        warning: 'bg-[var(--color-warning)]',
        info: 'bg-[var(--color-info)]',
    };

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {dot && (
                <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
                />
            )}
            {children}
        </motion.span>
    );
}
