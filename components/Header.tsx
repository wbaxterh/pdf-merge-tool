
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-white">
                           <span className="text-indigo-400">PDF</span> Fusion
                        </h1>
                    </div>
                    <p className="hidden md:block text-gray-400">Merge PDFs and images with ease.</p>
                </div>
            </div>
        </header>
    );
};

export default Header;
