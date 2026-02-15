import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function Toggle({
    checked,
    onChange,
    disabled = false,
    loading = false,
    size = 'md',
}: ToggleProps) {
    const sizes = {
        sm: { container: 'w-10 h-5', thumb: 'w-4 h-4', translate: 'translate-x-5' },
        md: { container: 'w-12 h-6', thumb: 'w-5 h-5', translate: 'translate-x-6' },
        lg: { container: 'w-14 h-7', thumb: 'w-6 h-6', translate: 'translate-x-7' },
    };

    const currentSize = sizes[size];

    return (
        <button
            type="button"
            onClick={() => !disabled && !loading && onChange(!checked)}
            disabled={disabled || loading}
            className={`relative inline-flex ${currentSize.container} items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${disabled || loading
                    ? 'opacity-50 cursor-not-allowed bg-gray-700'
                    : checked
                        ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                        : 'bg-gray-600 hover:bg-gray-500 focus:ring-gray-500'
                }`}
            aria-pressed={checked}
            aria-label={`Toggle switch ${checked ? 'on' : 'off'}`}
        >
            <motion.span
                className={`inline-block ${currentSize.thumb} transform rounded-full bg-white shadow-lg flex items-center justify-center`}
                initial={false}
                animate={{
                    x: checked ? currentSize.translate.replace('translate-x-', '') : '2px',
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                }}
            >
                {loading && (
                    <svg
                        className="animate-spin h-3 w-3 text-gray-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                )}
            </motion.span>
        </button>
    );
}
