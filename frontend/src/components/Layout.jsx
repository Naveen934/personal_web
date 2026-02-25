import React, { useState } from 'react';
import {
    Building2, PiggyBank, Landmark, FileText,
    LayoutDashboard, Menu, X, LogOut
} from 'lucide-react';

const NAV_ITEMS = [
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'economy', label: 'Bank', icon: Landmark },
    { id: 'documents', label: 'Documents', icon: FileText },
];

export default function Layout({ activeTab, onTabChange, onLogout, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-dark-900">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-dark-800 border-r border-dark-600
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-700 rounded-lg flex items-center justify-center">
                        <LayoutDashboard size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm leading-none">My Dashboard</p>
                        <p className="text-gray-500 text-xs mt-0.5">Personal Finance</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => { onTabChange(id); setSidebarOpen(false); }}
                            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${activeTab === id
                                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-900/40'
                                    : 'text-gray-400 hover:bg-dark-600 hover:text-white'}
              `}
                        >
                            <Icon size={18} className={activeTab === id ? 'text-white' : 'text-gray-500 group-hover:text-white'} />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-4 py-4 border-t border-dark-600 space-y-3">
                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-200"
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    )}
                    <p className="text-xs text-gray-600 px-2">© 2026 Personal Dashboard</p>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar (mobile) */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-dark-800 border-b border-dark-600">
                    <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white p-1">
                        <Menu size={22} />
                    </button>
                    <span className="text-white font-semibold">
                        {NAV_ITEMS.find(n => n.id === activeTab)?.label}
                    </span>
                    <div className="w-8" />
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
