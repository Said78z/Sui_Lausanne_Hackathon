import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignup = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement zkLogin with Google
            console.log('Google zkLogin registration');
            // navigate('/dashboard');
        } catch (error) {
            console.error('Google signup failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleSignup = async () => {
        setIsLoading(true);
        try {
            // TODO: Implement zkLogin with Apple
            console.log('Apple zkLogin registration');
            // navigate('/dashboard');
        } catch (error) {
            console.error('Apple signup failed:', error);
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
            <Navbar variant="auth" showBackButton={true} />

            {/* Register Form */}
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-8">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-white">Join Hack'n'sui</h1>
                            <p className="text-gray-300">Create your account with zkLogin - secure, private, and passwordless</p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleGoogleSignup}
                                disabled={isLoading}
                                className="w-full bg-white text-gray-900 hover:bg-gray-100 flex items-center justify-center space-x-3 py-3"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                                <span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
                            </Button>

                            <Button
                                onClick={handleAppleSignup}
                                disabled={isLoading}
                                className="w-full bg-black text-white hover:bg-gray-900 flex items-center justify-center space-x-3 py-3"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                </svg>
                                <span>{isLoading ? 'Connecting...' : 'Continue with Apple'}</span>
                            </Button>
                        </div>

                        <div className="mt-8 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-blue-300">What is zkLogin?</h3>
                                    <p className="mt-1 text-sm text-blue-200">
                                        zkLogin allows you to use your existing Google or Apple account to create a Sui wallet without revealing your identity. It's secure, private, and you don't need to remember any passwords.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
        </div>
    );
};

export default RegisterPage;