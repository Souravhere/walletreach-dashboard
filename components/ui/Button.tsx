'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    isLoading?: boolean;
    fullWidth?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    isLoading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    type = 'button', // Default to 'button' to prevent form submission
    ...props
}: ButtonProps) {
    const baseStyles = `
    relative inline-flex items-center justify-center gap-2 font-medium
    rounded-lg transition-all duration-200 overflow-hidden
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  `;

    const variants = {
        primary: `
      bg-white text-black
      hover:bg-gray-100 active:bg-gray-200
      shadow-lg hover:shadow-xl
    `,
        secondary: `
      bg-[var(--bg-elevated)] text-white border border-[var(--border-default)]
      hover:bg-[var(--bg-hover)] hover:border-[var(--border-strong)]
    `,
        ghost: `
      bg-transparent text-[var(--text-secondary)]
      hover:bg-[var(--bg-hover)] hover:text-white
    `,
        danger: `
      bg-[var(--color-error)] text-white
      hover:bg-[var(--color-error-dark)] active:bg-red-700
      shadow-lg hover:shadow-xl
    `,
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <motion.button
            type={type}
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
            className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {/* Background ripple effect */}
            <motion.span
                className="absolute inset-0 bg-white opacity-0"
                whileHover={{ opacity: variant === 'primary' ? 0 : 0.05 }}
                transition={{ duration: 0.2 }}
            />

            {/* Content */}
            <span className="relative flex items-center justify-center gap-2">
                {isLoading && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                    />
                )}
                {!isLoading && icon && iconPosition === 'left' && icon}
                {children}
                {!isLoading && icon && iconPosition === 'right' && icon}
            </span>
        </motion.button>
    );
}

