'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { isAuthenticated } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    if (!isAuthenticated()) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-black">
            <Sidebar />

            {/* Main Content - Offset for sidebar */}
            <div className="flex-1 ml-64 transition-all duration-300">
                <Navbar />

                <motion.main
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="p-6 lg:p-8"
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
}

