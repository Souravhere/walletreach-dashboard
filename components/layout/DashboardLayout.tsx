'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { isAuthenticated } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    // Prevent hydration mismatch and handle auth redirect
    if (!isMounted || !isAuthenticated()) {
        return <div className="min-h-screen bg-black" />;
    }

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-white/10">
            {/* SIDEBAR COMPONENT 
                Fixed width is 280px as per the previous update 
            */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 w-full md:pl-[280px] transition-all duration-500 ease-in-out">
                
                {/* NAVBAR 
                    Ensuring it stays sticky or top-aligned within the content area 
                */}
                <Navbar />

                {/* MAIN CONTENT 
                    Added a max-width container and improved padding for a premium look
                */}
                <motion.main
                    key="main-content"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        duration: 0.6, 
                        ease: [0.22, 1, 0.36, 1], // Luxury "out-expo" easing
                        delay: 0.1 
                    }}
                    className="flex-1 p-4 md:p-8 lg:p-10 w-full max-w-[1600px] mx-auto"
                >
                    {/* Inner content wrapper with subtle depth */}
                    <div className="relative min-h-[calc(100vh-140px)]">
                        {children}
                    </div>
                </motion.main>

                {/* Optional: Subtle background glow for premium feel */}
                <div className="fixed top-0 right-0 -z-10 w-[500px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none" />
            </div>
        </div>
    );
}