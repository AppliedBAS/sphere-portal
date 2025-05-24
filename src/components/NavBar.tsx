import React from 'react';
import Profile from './Profile';
import { ThemeToggleButton } from './ThemeToggleButton';

const NavBar: React.FC = () => (
    <nav className="w-full h-16 border-b flex items-center justify-between px-8 box-border">
        <div className="font-bold text-lg">Sphere Portal</div>
        <div className="ml-auto gap-4 flex items-center">
            <ThemeToggleButton />
            <Profile />
        </div>
    </nav>
);

export default NavBar;