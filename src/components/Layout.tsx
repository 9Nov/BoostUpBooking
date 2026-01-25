import React from 'react';
import { ShieldCheck, Calendar as CalendarIcon, Mail } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
    children: React.ReactNode;
    isAdmin?: boolean;
    onAdminLoginClick?: () => void;
    onExitAdmin?: () => void;
    isGmailAuthorized?: boolean;
    onAuthorizeGmail?: () => void;
}

export function Layout({ children, isAdmin, onAdminLoginClick, onExitAdmin, isGmailAuthorized, onAuthorizeGmail }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg", isAdmin ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600")}>
                            <CalendarIcon size={24} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">
                            {isAdmin ? "Admin Dashboard" : "10% Boost-up Project Presentation"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {isAdmin && onAuthorizeGmail && (
                            <button
                                onClick={onAuthorizeGmail}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    isGmailAuthorized
                                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                        : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                                )}
                                title={isGmailAuthorized ? "Gmail Authorized" : "Authorize Gmail to send emails"}
                            >
                                <Mail size={16} />
                                {isGmailAuthorized ? "Gmail ✓" : "Authorize Gmail"}
                            </button>
                        )}
                        {isAdmin ? (
                            <button
                                onClick={onExitAdmin}
                                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Exit Admin
                            </button>
                        ) : (
                            <button
                                onClick={onAdminLoginClick}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                                title="Admin Login"
                            >
                                <ShieldCheck size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
