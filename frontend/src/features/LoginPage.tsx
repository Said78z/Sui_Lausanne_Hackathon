import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet } from '@mysten/enoki';
import { ArrowLeft, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const currentAccount = useCurrentAccount();
    const { mutate: connect } = useConnectWallet();

    // Get available Enoki wallets
    const wallets = useWallets();
    const enokiWallets = wallets.filter(isEnokiWallet);
    // Find Google wallet by checking the wallet name/features
    const googleWallet = enokiWallets.find(
        (wallet) =>
            wallet.name?.toLowerCase().includes('google') ||
            wallet.name?.toLowerCase().includes('enoki')
    );

    // Handle successful connection - redirect to dashboard
    useEffect(() => {
        if (currentAccount) {
            navigate('/dashboard');
        }
    }, [currentAccount, navigate]);

    const handleGoogleLogin = async () => {
        if (!googleWallet) {
            console.error('Google wallet not available');
            return;
        }

        setIsLoading(true);
        try {
            connect(
                { wallet: googleWallet },
                {
                    onSuccess: () => {
                        console.log('Google zkLogin authentication successful');
                        // Navigation will be handled by useEffect when currentAccount updates
                    },
                    onError: (error) => {
                        console.error('Google login failed:', error);
                        setIsLoading(false);
                    },
                }
            );
        } catch (error) {
            console.error('Google login failed:', error);
            setIsLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setIsLoading(true);
        try {
            // Apple zkLogin not implemented yet - keeping original placeholder
            console.log('Apple zkLogin authentication - Not implemented yet');
            // You can implement Apple login here when available
        } catch (error) {
            console.error('Apple login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
            </nav>

            {/* Login Form */}
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur-sm">
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Welcome to Hack'n'sui
                            </h1>
                            <p className="text-gray-300">
                                Sign in with zkLogin - secure, private, and decentralized
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleGoogleLogin}
                                disabled={isLoading || !googleWallet}
                                className="h-12 w-full bg-white text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                {isLoading
                                    ? 'Connecting...'
                                    : !googleWallet
                                      ? 'Google Wallet Loading...'
                                      : 'Continue with Google'}
                            </Button>

                            <Button
                                onClick={handleAppleLogin}
                                disabled={true}
                                className="h-12 w-full bg-black text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <svg
                                    className="mr-3 h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                Coming Soon - Apple zkLogin
                            </Button>
                        </div>

                        <div className="mt-8 text-center">
                            <div className="mb-4">
                                <p className="text-sm text-gray-400">
                                    Powered by zkLogin - Zero-knowledge authentication
                                </p>
                            </div>
                            <p className="text-gray-400">
                                New to Hack'n'sui?{' '}
                                <Link to="/about" className="text-blue-400 hover:text-blue-300">
                                    Learn more
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
        </div>
    );
};

export default LoginPage;
