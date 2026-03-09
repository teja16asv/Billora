import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Home,
    Users,
    FileText,
    UploadCloud,
    LogOut,
    CreditCard,
    Zap,
    Settings
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const adminLinks = [
        { name: 'Overview', path: '/admin/dashboard', icon: Home },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Invoices', path: '/admin/invoices', icon: FileText },
        { name: 'Metering', path: '/admin/usage-upload', icon: UploadCloud },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const customerLinks = [
        { name: 'My Invoices', path: '/customer/invoices', icon: FileText },
        { name: 'Payment Method', path: '/customer/payments', icon: CreditCard },
    ];

    const links = user?.role === 'Admin' ? adminLinks : customerLinks;

    return (
        <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-100 h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col relative z-20">
            <div className="h-20 flex items-center px-6 border-b border-gray-100/50">
                <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-br from-brand to-primary-400 p-2 rounded-xl shadow-inner text-white">
                        <Zap className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        SaaSBilling
                    </h1>
                </div>
            </div>

            <div className="flex-1 py-6 overflow-y-auto px-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
                <nav className="space-y-1.5">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname.includes(link.path);

                        return (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-brand/10 text-brand shadow-sm relative overflow-hidden'
                                    : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900'
                                    }`
                                }
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-r-md"></div>
                                )}
                                <Icon className={`mr-3 flex-shrink-0 h-5 w-5 transition-colors ${isActive ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {link.name}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-100/50 mx-4 mb-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 mb-4 border border-gray-200/50 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Logged in as</p>
                    <p className="font-semibold text-sm text-gray-800 truncate">{user?.role} User</p>
                </div>
                <button
                    onClick={logout}
                    className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
