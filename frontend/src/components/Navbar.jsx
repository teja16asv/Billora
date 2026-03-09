import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Search } from 'lucide-react';

const Navbar = () => {
    const { user } = useAuth();

    return (
        <header className="bg-white/60 backdrop-blur-md border-b border-gray-200/50 h-20 flex items-center justify-between px-8 sticky top-0 z-30 transition-all">
            <div className="flex-1 max-w-md">
                {/* Subtle mock search bar for visual balance */}
                <div className="relative group hidden md:block">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-brand transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border-0 bg-gray-100/50 rounded-full text-sm placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-light focus:outline-none transition-all shadow-inner"
                        placeholder={`Search ${user?.role === 'Admin' ? 'customers, invoices...' : 'invoices...'}`}
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="h-8 w-px bg-gray-200"></div>

                <div className="flex items-center space-x-3 cursor-pointer group">
                    <div className="flex flex-col text-right hidden sm:block">
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-brand transition-colors">Admin Portal</span>
                        <span className="text-xs text-gray-500 font-medium tracking-wide uppercase">{user?.role}</span>
                    </div>
                    <img
                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md"
                        src={`https://ui-avatars.com/api/?name=${user?.role}&background=e0e7ff&color=3730a3&bold=true`}
                        alt="Avatar"
                    />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
