'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    onClick?: () => void;
    title?: string;
}

export default function Card({
    children,
    className = '',
    variant = 'default',
    hover = false,
    padding = 'md',
    onClick,
    title,
}: CardProps) {
    const baseStyles = `
    rounded-lg border transition-all duration-200
  `;

    const variants = {
        default: `
      bg-[var(--bg-secondary)] border-[var(--border-subtle)]
    `,
        glass: `
      bg-white/3 backdrop-blur-xl border-[var(--border-default)]
    `,
        elevated: `
      bg-[var(--bg-elevated)] border-[var(--border-default)]
      shadow-lg
    `,
    };

    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const hoverStyles = hover
        ? 'cursor-pointer hover:border-[var(--border-strong)] hover:shadow-xl hover:-translate-y-1'
        : '';

    return (
        <motion.div
            initial={false}
            whileHover={hover ? { y: -4 } : {}}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${hoverStyles}
        ${className}
      `}
            onClick={onClick}
        >
            {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
            {children}
        </motion.div>
    );
}
