'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AlertProps {
    type?: 'info' | 'warning' | 'critical' | 'success';
    children: React.ReactNode;
    onClose?: () => void;
}

export default function Alert({ type = 'info', children, onClose }: AlertProps) {
    const types = {
        info: 'bg-blue-500/10 border-blue-500 text-blue-400',
        warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-400',
        critical: 'bg-red-500/10 border-red-500 text-red-400',
        success: 'bg-green-500/10 border-green-500 text-green-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`border-l-4 p-4 rounded ${types[type]} flex items-start justify-between`}
        >
            <div className="flex-1">{children}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
                >
                    ✕
                </button>
            )}
        </motion.div>
    );
}
