import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Users, Trophy, Sparkles, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/register');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
                <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">Hack'n'sui</span>
                </div>
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={handleLogin}
                        className="text-white hover:bg-white/10 hover:text-white"
                    >
                        Login
                    </Button>
                    <Button
                        onClick={handleGetStarted}
                    >
                        Get Started
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="mb-8 inline-flex items-center rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-300 ring-1 ring-blue-500/20">
                        <Zap className="mr-2 h-4 w-4" />
                        Powered by Sui Blockchain
                    </div>
                    
                    <h1 className="mb-6 text-5xl font-bold tracking-tight text-white lg:text-7xl">
                        The Future of{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            Hackathon Rewards
                        </span>
                    </h1>
                    
                    <p className="mb-8 text-xl text-gray-300 lg:text-2xl">
                        Seamless Web3 reward distribution for hackathons, conferences, and tech events.
                        No wallets, no gas fees, just instant rewards.
                    </p>
                    
                    <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                        <Button
                            size="lg"
                            onClick={handleGetStarted}
                            className="px-8 py-4 text-lg"
                        >
                            Start Building
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleLogin}
                            className="px-8 py-4 text-lg border-white/20 text-white hover:bg-white/10"
                        >
                            Login to Dashboard
                        </Button>
                    </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
                <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
            </section>

            {/* Features Section */}
            <section className="px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-white">
                            Why Choose Hack'n'sui?
                        </h2>
                        <p className="text-xl text-gray-300">
                            Built for the next generation of Web3 events
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white">
                                Gasless Experience
                            </h3>
                            <p className="text-gray-300">
                                No wallet setup, no gas fees. Users authenticate with Google or GitHub and receive rewards instantly.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-400">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white">
                                Soulbound NFTs
                            </h3>
                            <p className="text-gray-300">
                                Immutable proof of participation and achievements. Your hackathon journey, permanently recorded on-chain.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-400">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white">
                                Community Driven
                            </h3>
                            <p className="text-gray-300">
                                Connect with fellow builders, track your progress, and build your Web3 reputation across events.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-400">
                                <Trophy className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white">
                                Instant Rewards
                            </h3>
                            <p className="text-gray-300">
                                Automated micro-grant distribution. Complete missions, scan QR codes, and receive rewards in real-time.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-400">
                                <Globe className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white">
                                Global Scale
                            </h3>
                            <p className="text-gray-300">
                                From local meetups to international conferences. Scale your events with our robust infrastructure.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-400">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white">
                                Analytics & Insights
                            </h3>
                            <p className="text-gray-300">
                                Real-time analytics for organizers and sponsors. Track engagement, measure impact, and optimize events.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="rounded-3xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-8 backdrop-blur-sm ring-1 ring-white/10 lg:p-16">
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="text-center">
                                <div className="mb-2 text-4xl font-bold text-white lg:text-5xl">297K</div>
                                <div className="text-gray-300">Transactions per second</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-4xl font-bold text-white lg:text-5xl">~400ms</div>
                                <div className="text-gray-300">Time to finality</div>
                            </div>
                            <div className="text-center">
                                <div className="mb-2 text-4xl font-bold text-white lg:text-5xl">$5.1B</div>
                                <div className="text-gray-300">Hackathon market by 2031</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
                        Ready to Transform Your Event?
                    </h2>
                    <p className="mb-8 text-xl text-gray-300">
                        Join the future of hackathon rewards. Simple, automated, and inclusive.
                    </p>
                    <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                        <Button
                            size="lg"
                            onClick={handleGetStarted}
                            className="px-8 py-4 text-lg"
                        >
                            Get Started Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="ghost"
                            onClick={handleLogin}
                            className="px-8 py-4 text-lg text-white hover:bg-white/10 hover:text-white"
                        >
                            Already have an account?
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 px-6 py-8 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                        <div className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                                <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-white">Hack'n'sui</span>
                        </div>
                        <div className="text-gray-400">
                            © 2024 Hack'n'sui. The new standard for Web3 event rewards.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;