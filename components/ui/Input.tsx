'use client';

import { motion } from 'framer-motion';
import { useState, InputHTMLAttributes } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    helper?: string;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    inputSize?: 'sm' | 'md' | 'lg';
}

export default function Input({
    label,
    error,
    helper,
    icon,
    iconPosition = 'left',
    type = 'text',
    fullWidth = false,
    inputSize = 'md',
    className = '',
    ...props
}: InputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base',
    };

    const containerStyle = fullWidth ? 'w-full' : '';

    return (
        <div className={`${containerStyle} ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-white mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Left Icon */}
                {icon && iconPosition === 'left' && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
                        {icon}
                    </div>
                )}

                {/* Input */}
                <motion.input
                    type={inputType}
                    className={`
            w-full rounded-lg
            bg-[var(--bg-elevated)] text-white
            border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-white/20
            placeholder:text-[var(--text-tertiary)]
            ${error
                            ? 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
                            : 'border-[var(--border-default)] focus:border-white'
                        }
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${isPassword ? 'pr-10' : ''}
            ${sizes[inputSize]}
          `}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    animate={{
                        scale: isFocused ? 1.01 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    {...props}
                />

                {/* Right Icon or Password Toggle */}
                {(icon && iconPosition === 'right') || isPassword ? (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isPassword ? (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-[var(--text-tertiary)] hover:text-white transition-colors duration-200"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <FiEyeOff className="w-5 h-5" />
                                ) : (
                                    <FiEye className="w-5 h-5" />
                                )}
                            </button>
                        ) : (
                            <div className="text-[var(--text-tertiary)]">{icon}</div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Helper or Error Message */}
            {(helper || error) && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-1.5 text-xs ${error ? 'text-[var(--color-error)]' : 'text-[var(--text-tertiary)]'
                        }`}
                >
                    {error || helper}
                </motion.p>
            )}
        </div>
    );
}
