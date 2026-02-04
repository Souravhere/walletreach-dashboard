'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RiCloseLine, RiErrorWarningFill } from 'react-icons/ri';

export default function Alert({ type = 'info', children, onClose }: any) {
    const styles = {
        critical: 'border-red-500/50 bg-red-500/5 text-red-200',
        warning: 'border-amber-500/50 bg-amber-500/5 text-amber-200',
        info: 'border-blue-500/50 bg-blue-500/5 text-blue-200',
        success: 'border-green-500/50 bg-green-500/5 text-green-200',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md ${styles[type as keyof typeof styles]}`}
        >
            <RiErrorWarningFill className="text-xl shrink-0" />
            <div className="flex-1 text-sm font-medium">{children}</div>
            {onClose && (
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                    <RiCloseLine size={20} />
                </button>
            )}
        </motion.div>
    );
}