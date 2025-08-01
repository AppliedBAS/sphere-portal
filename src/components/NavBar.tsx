"use client";

import React from 'react';
import { Button } from './ui/button';
import { FileText, Home, HomeIcon, Search } from 'lucide-react';
import Link from 'next/link';
import { useNavBar } from '@/contexts/NavBarContext';

const NavBar: React.FC = () => {
    const { page, setPage } = useNavBar();
    const handleNavClick = (newPage: string) => {
        setPage(newPage as any);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex justify-around p-2 shadow-md z-10">
            {/* Add nav items here */}
            <Link
                href="/dashboard"
                className={`flex flex-col items-center p-2 rounded ${page === 'dashboard' ? 'text-primary' : 'text-muted-foreground'} hover:bg-accent`}
                onClick={() => handleNavClick('dashboard')}
            >
                <Home className="mb-1" size={24} />
            </Link>
            <Link
                href="/search"
                className={`flex flex-col items-center p-2 rounded ${page === 'search' ? 'text-primary' : 'text-muted-foreground'} hover:bg-accent`}
                onClick={() => handleNavClick('search')}
            >
                <Search className="mb-1" size={24} />
            </Link>
        </nav>
    );
};

export default NavBar;