import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { ArrowLeft, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { BalanceComponent, LogoutButton, TransactionComponent } from '@/components/wallet';

const WalletDashboard: React.FC = () => {
    const currentAccount = useCurrentAccount();
    const navigate = useNavigate();

    // If not connected, redirect to login
    if (!currentAccount) {
        navigate('/login');
        return null;
    }

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
                <Button
                    variant="ghost"
                    onClick={handleBackToHome}
                    className="text-white hover:bg-white/10"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>
                <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-white">Hack'n'sui</span>
                </div>
                <LogoutButton
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    redirectTo="/login"
                />
            </nav>

            {/* Dashboard Content */}
            <div className="px-6 py-8 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-white">Wallet Dashboard</h1>
                        <p className="text-gray-300">Manage your SUI assets and transactions</p>
                    </div>

                    {/* Account Info Card */}
                    <div className="mb-8 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
                        <h2 className="mb-4 text-xl font-semibold text-white">
                            Account Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-400">Wallet Address:</p>
                                <p className="mt-1 break-all rounded bg-white/10 px-3 py-2 font-mono text-sm text-white">
                                    {currentAccount.address}
                                </p>
                            </div>
                            <div className="pt-2">
                                <BalanceComponent
                                    ownerAddress={currentAccount.address}
                                    className="text-white"
                                    loadingMessage="Loading balance..."
                                    errorMessage="Error loading balance"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transactions Card */}
                    <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur-sm">
                        <h2 className="mb-4 text-xl font-semibold text-white">Transactions</h2>
                        <TransactionComponent className="space-y-4" />
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
        </div>
    );
};

export default WalletDashboard;
