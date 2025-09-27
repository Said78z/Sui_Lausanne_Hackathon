import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Users, Trophy, Sparkles, Globe, Star, Rocket, Code, Award, UserPlus, Calendar, Share2, QrCode, UserCheck, GitBranch, Upload, Crown, Coins, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '' }: { 
    end: number; 
    duration?: number; 
    suffix?: string; 
    prefix?: string; 
}) => {
    const [count, setCount] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        if (!hasStarted) return;
        
        let startTime: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            setCount(Math.floor(progress * end));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }, [end, duration, hasStarted]);

    const startAnimation = () => setHasStarted(true);

    useEffect(() => {
        const timer = setTimeout(startAnimation, 200);
        return () => clearTimeout(timer);
    }, []);

    return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
    const [statsAnimated, setStatsAnimated] = useState(false);
    const heroRef = useRef<HTMLElement>(null);
    const featuresRef = useRef<HTMLElement>(null);
    const statsRef = useRef<HTMLElement>(null);
    const ctaRef = useRef<HTMLElement>(null);

    // Mouse tracking for interactive background
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id || 'hero';
                        setIsVisible(prev => ({ ...prev, [id]: true }));
                        
                        // Trigger stats animation
                        if (id === 'stats' && !statsAnimated) {
                            setStatsAnimated(true);
                        }
                    }
                });
            },
            { threshold: 0.1 }
        );

        const refs = [heroRef, featuresRef, statsRef, ctaRef];
        refs.forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, [statsAnimated]);

    // Parallax scrolling effect
    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach((element) => {
                const speed = 0.5;
                const yPos = -(scrolled * speed);
                (element as HTMLElement).style.transform = `translateY(${yPos}px)`;
            });
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleGetStarted = () => {
        navigate('/register');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
            {/* Interactive Background */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Mouse-following gradient */}
                <div 
                    className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-400/20 rounded-full blur-3xl transition-all duration-300 ease-out"
                    style={{
                        left: mousePosition.x - 192,
                        top: mousePosition.y - 192,
                        transform: 'translate3d(0, 0, 0)',
                    }}
                />
                
                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                        }}
                    />
                ))}
                
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8 backdrop-blur-sm bg-white/5 border-b border-white/10">
                <div className="flex items-center space-x-2 animate-fade-in">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:scale-110 transition-transform duration-300 hover:rotate-12">
                        <Sparkles className="h-6 w-6 text-white animate-pulse" />
                    </div>
                    <span className="text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        Hack'n'sui
                    </span>
                </div>
                <div className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Button
                        variant="ghost"
                        onClick={handleLogin}
                        className="text-white hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-300"
                    >
                        Login
                    </Button>
                    <Button
                        onClick={handleGetStarted}
                        className="hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                    >
                        Get Started
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} id="hero" className="relative px-6 py-20 lg:px-8 min-h-screen flex items-center">
                <div className="mx-auto max-w-4xl text-center">
                    <div className={`mb-8 inline-flex items-center rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-300 ring-1 ring-blue-500/20 backdrop-blur-sm hover:bg-blue-500/20 transition-all duration-500 ${isVisible.hero ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <Zap className="mr-2 h-4 w-4 animate-pulse" />
                        Powered by Sui Blockchain
                        <Rocket className="ml-2 h-4 w-4" />
                    </div>
                    
                    <h1 className={`mb-6 text-5xl font-bold tracking-tight text-white lg:text-7xl ${isVisible.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                        The Future of{' '}
                        <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                            Hackathon Rewards
                        </span>
                    </h1>
                    
                    <p className={`mb-8 text-xl text-gray-300 lg:text-2xl leading-relaxed ${isVisible.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                        Seamless Web3 reward distribution for hackathons, conferences, and tech events.
                        <br />
                        <span className="text-blue-300 font-semibold">No wallets, no gas fees, just instant rewards.</span>
                    </p>
                    
                    <div className={`flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 ${isVisible.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                        <Button
                            size="lg"
                            onClick={handleGetStarted}
                            className="px-8 py-4 text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 group"
                        >
                            <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                            Start Building
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={handleLogin}
                            className="px-8 py-4 text-lg border-white/20 text-white hover:bg-white/10 hover:scale-105 transition-all duration-300 backdrop-blur-sm"
                        >
                            <Code className="mr-2 h-5 w-5" />
                            Login to Dashboard
                        </Button>
                    </div>

                    {/* Achievement badges */}
                    <div className={`mt-16 flex flex-wrap justify-center gap-4 ${isVisible.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
                        <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                            <Award className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-white">YC Backed</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                            <Star className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-white">297K TPS</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                            <Users className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-white">10K+ Developers</span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Floating Elements */}
                <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse parallax"></div>
                <div className="absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl animate-pulse parallax" style={{ animationDelay: '1s' }}></div>
                <div className="absolute left-1/2 top-1/2 h-32 w-32 rounded-full bg-purple-500/10 blur-2xl animate-ping parallax" style={{ animationDelay: '2s' }}></div>
                
                {/* Floating icons */}
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float opacity-20 hover:opacity-60 transition-opacity duration-300 parallax"
                        style={{
                            left: `${20 + (i * 10)}%`,
                            top: `${30 + (i % 3) * 20}%`,
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: `${3 + (i % 3)}s`,
                        }}
                    >
                        {i % 4 === 0 && <Zap className="h-6 w-6 text-blue-400" />}
                        {i % 4 === 1 && <Code className="h-6 w-6 text-cyan-400" />}
                        {i % 4 === 2 && <Trophy className="h-6 w-6 text-yellow-400" />}
                        {i % 4 === 3 && <Star className="h-6 w-6 text-purple-400" />}
                    </div>
                ))}
            </section>

            {/* Features Section */}
            <section ref={featuresRef} id="features" className="px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className={`mb-16 text-center ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <h2 className="mb-4 text-4xl font-bold text-white">
                            Why Choose{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                Hack'n'sui?
                            </span>
                        </h2>
                        <p className="text-xl text-gray-300">
                            Built for the next generation of Web3 events
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <div className={`group rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500 hover:scale-105 hover:ring-blue-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/20 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 group-hover:scale-110">
                                <Zap className="h-6 w-6 text-white transition-all duration-300 group-hover:animate-pulse" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-blue-300">
                                Gasless Experience
                            </h3>
                            <p className="text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                                No wallet setup, no gas fees. Users authenticate with Google or GitHub and receive rewards instantly.
                            </p>
                            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-500 group-hover:w-full"></div>
                        </div>

                        <div className={`group rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500 hover:scale-105 hover:ring-purple-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-purple-500/20 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-300 group-hover:scale-110">
                                <Shield className="h-6 w-6 text-white transition-all duration-300 group-hover:animate-pulse" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-purple-300">
                                Soulbound NFTs
                            </h3>
                            <p className="text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                                Immutable proof of participation and achievements. Your hackathon journey, permanently recorded on-chain.
                            </p>
                            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-purple-400 to-pink-300 transition-all duration-500 group-hover:w-full"></div>
                        </div>

                        <div className={`group rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500 hover:scale-105 hover:ring-green-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-green-500/20 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300 group-hover:scale-110">
                                <Users className="h-6 w-6 text-white transition-all duration-300 group-hover:animate-pulse" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-green-300">
                                Community Driven
                            </h3>
                            <p className="text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                                Connect with fellow builders, track your progress, and build your Web3 reputation across events.
                            </p>
                            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-green-400 to-emerald-300 transition-all duration-500 group-hover:w-full"></div>
                        </div>

                        <div className={`group rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500 hover:scale-105 hover:ring-orange-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-orange-500/20 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-400 transition-all duration-300 group-hover:scale-110">
                                <Trophy className="h-6 w-6 text-white transition-all duration-300 group-hover:animate-pulse" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-orange-300">
                                Instant Rewards
                            </h3>
                            <p className="text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                                Automated micro-grant distribution. Complete missions, scan QR codes, and receive rewards in real-time.
                            </p>
                            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-orange-400 to-red-300 transition-all duration-500 group-hover:w-full"></div>
                        </div>

                        <div className={`group rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500 hover:scale-105 hover:ring-indigo-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/20 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-300 group-hover:scale-110">
                                <Globe className="h-6 w-6 text-white transition-all duration-300 group-hover:animate-pulse" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-indigo-300">
                                Global Scale
                            </h3>
                            <p className="text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                                From local meetups to international conferences. Scale your events with our robust infrastructure.
                            </p>
                            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-indigo-400 to-purple-300 transition-all duration-500 group-hover:w-full"></div>
                        </div>

                        <div className={`group rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 transition-all duration-500 hover:scale-105 hover:ring-cyan-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyan-500/20 ${isVisible.features ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-300 group-hover:scale-110">
                                <Sparkles className="h-6 w-6 text-white transition-all duration-300 group-hover:animate-pulse" />
                            </div>
                            <h3 className="mb-3 text-xl font-semibold text-white transition-colors duration-300 group-hover:text-cyan-300">
                                Analytics & Insights
                            </h3>
                            <p className="text-gray-300 transition-colors duration-300 group-hover:text-gray-200">
                                Real-time analytics for organizers and sponsors. Track engagement, measure impact, and optimize events.
                            </p>
                            <div className="mt-4 h-1 w-0 bg-gradient-to-r from-cyan-400 to-blue-300 transition-all duration-500 group-hover:w-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="px-6 py-20 lg:px-8 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-white">
                            How{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                Hack'n'sui Works
                            </span>
                        </h2>
                        <p className="text-xl text-gray-300">
                            Simple steps to transform your hackathon experience
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* For Organizers */}
                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-400">
                                <Crown className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-6 text-2xl font-semibold text-white">For Organizers</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-semibold text-sm">1</div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Calendar className="h-4 w-4 text-purple-300" />
                                            <span className="font-medium text-white">Create Event</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">Set up your hackathon with custom rewards and missions</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-semibold text-sm">2</div>
                                     <div>
                                         <div className="flex items-center space-x-2 mb-2">
                                             <QrCode className="h-4 w-4 text-purple-300" />
                                             <span className="font-medium text-white">Scan Participant QR Codes</span>
                                         </div>
                                         <p className="text-gray-300 text-sm">Scan participants' unique QR codes to validate activities and distribute rewards</p>
                                     </div>
                                 </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-semibold text-sm">3</div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <BarChart3 className="h-4 w-4 text-purple-300" />
                                            <span className="font-medium text-white">Track & Analyze</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">Monitor engagement and reward distribution in real-time</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* For Participants */}
                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                                <UserCheck className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-6 text-2xl font-semibold text-white">For Participants</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-semibold text-sm">1</div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <UserPlus className="h-4 w-4 text-blue-300" />
                                            <span className="font-medium text-white">Quick Signup</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">Register with Google/GitHub - no wallet setup required</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-semibold text-sm">2</div>
                                     <div>
                                         <div className="flex items-center space-x-2 mb-2">
                                             <QrCode className="h-4 w-4 text-blue-300" />
                                             <span className="font-medium text-white">Get Scanned & Earn</span>
                                         </div>
                                         <p className="text-gray-300 text-sm">Show your unique QR code to organizers for activity validation and rewards</p>
                                     </div>
                                 </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-semibold text-sm">3</div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Coins className="h-4 w-4 text-blue-300" />
                                            <span className="font-medium text-white">Instant Rewards</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">Receive tokens and NFTs instantly - no gas fees</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* For Sponsors */}
                        <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10">
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-400">
                                <Share2 className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-6 text-2xl font-semibold text-white">For Sponsors</h3>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-300 font-semibold text-sm">1</div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Upload className="h-4 w-4 text-green-300" />
                                            <span className="font-medium text-white">Fund Pool</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">Contribute to reward pools with custom branding</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-300 font-semibold text-sm">2</div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <GitBranch className="h-4 w-4 text-green-300" />
                                            <span className="font-medium text-white">Target Developers</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">Reach specific developer communities and skill sets</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-300 font-semibold text-sm">3</div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <BarChart3 className="h-4 w-4 text-green-300" />
                                            <span className="font-medium text-white">Measure Impact</span>
                                        </div>
                                        <p className="text-gray-300 text-sm">Get detailed analytics on engagement and ROI</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Process Flow */}
                    <div className="mt-20">
                        <div className="text-center mb-12">
                            <h3 className="text-2xl font-bold text-white mb-4">The Complete Flow</h3>
                            <p className="text-gray-300">From event creation to reward distribution</p>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-8">
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-400 group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="font-semibold text-white mb-2">Event Setup</h4>
                                <p className="text-gray-300 text-sm max-w-32">Create hackathon with custom rewards</p>
                            </div>
                            
                            <div className="hidden lg:block w-16 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400"></div>
                            
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 group-hover:scale-110 transition-transform duration-300">
                                    <UserPlus className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="font-semibold text-white mb-2">Registration</h4>
                                <p className="text-gray-300 text-sm max-w-32">Participants join with social login</p>
                            </div>
                            
                            <div className="hidden lg:block w-16 h-0.5 bg-gradient-to-r from-blue-400 to-green-400"></div>
                            
                            <div className="flex flex-col items-center text-center group">
                                 <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-400 group-hover:scale-110 transition-transform duration-300">
                                     <QrCode className="h-8 w-8 text-white" />
                                 </div>
                                 <h4 className="font-semibold text-white mb-2">Validation</h4>
                                 <p className="text-gray-300 text-sm max-w-32">Organizers scan participant QR codes</p>
                             </div>
                            
                            <div className="hidden lg:block w-16 h-0.5 bg-gradient-to-r from-green-400 to-yellow-400"></div>
                            
                            <div className="flex flex-col items-center text-center group">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-400 group-hover:scale-110 transition-transform duration-300">
                                    <Coins className="h-8 w-8 text-white" />
                                </div>
                                <h4 className="font-semibold text-white mb-2">Rewards</h4>
                                <p className="text-gray-300 text-sm max-w-32">Instant token and NFT distribution</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section ref={statsRef} id="stats" className="px-6 py-20 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className={`rounded-3xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-8 backdrop-blur-sm ring-1 ring-white/10 lg:p-16 transition-all duration-1000 ${isVisible.stats ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <div className="grid gap-8 md:grid-cols-3">
                            <div className="text-center group hover:scale-105 transition-transform duration-300">
                                <div className="mb-2 text-4xl font-bold text-white lg:text-5xl group-hover:text-blue-300 transition-colors duration-300">
                                    {statsAnimated ? <AnimatedCounter end={297} suffix="K" /> : '0K'}
                                </div>
                                <div className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Transactions per second</div>
                                <div className="mt-2 h-1 w-0 bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-1000 group-hover:w-full mx-auto"></div>
                            </div>
                            <div className="text-center group hover:scale-105 transition-transform duration-300">
                                <div className="mb-2 text-4xl font-bold text-white lg:text-5xl group-hover:text-purple-300 transition-colors duration-300">
                                    {statsAnimated ? <AnimatedCounter end={400} prefix="~" suffix="ms" /> : '~0ms'}
                                </div>
                                <div className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Time to finality</div>
                                <div className="mt-2 h-1 w-0 bg-gradient-to-r from-purple-400 to-pink-300 transition-all duration-1000 group-hover:w-full mx-auto"></div>
                            </div>
                            <div className="text-center group hover:scale-105 transition-transform duration-300">
                                <div className="mb-2 text-4xl font-bold text-white lg:text-5xl group-hover:text-green-300 transition-colors duration-300">
                                    {statsAnimated ? <AnimatedCounter end={5.1} prefix="$" suffix="B" /> : '$0B'}
                                </div>
                                <div className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Hackathon market by 2031</div>
                                <div className="mt-2 h-1 w-0 bg-gradient-to-r from-green-400 to-emerald-300 transition-all duration-1000 group-hover:w-full mx-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

              {/* Team Collaboration Section */}
              <section className="px-6 py-20 lg:px-8 bg-gradient-to-r from-slate-900/50 to-blue-900/20">
                  <div className="mx-auto max-w-6xl">
                      <div className="mb-16 text-center">
                          <h2 className="mb-4 text-4xl font-bold text-white">
                              Team{' '}
                              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                  Collaboration
                              </span>
                          </h2>
                          <p className="text-xl text-gray-300">
                              Build together, win together
                          </p>
                      </div>

                      <div className="grid gap-8 lg:grid-cols-2">
                          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300">
                              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                                  <Users className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="mb-4 text-xl font-semibold text-white">Smart Team Formation</h3>
                              <ul className="space-y-3 text-gray-300">
                                  <li className="flex items-start space-x-3">
                                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-400"></div>
                                      <span>Create or join teams with skill-based matching</span>
                                  </li>
                                  <li className="flex items-start space-x-3">
                                      <div className="mt-1 h-2 w-2 rounded-full bg-purple-400"></div>
                                      <span>Share team invite links for easy recruitment</span>
                                  </li>
                                  <li className="flex items-start space-x-3">
                                      <div className="mt-1 h-2 w-2 rounded-full bg-cyan-400"></div>
                                      <span>Real-time team member verification</span>
                                  </li>
                              </ul>
                          </div>

                          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300">
                              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-teal-500">
                                  <GitBranch className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="mb-4 text-xl font-semibold text-white">Collaborative Tools</h3>
                              <ul className="space-y-3 text-gray-300">
                                  <li className="flex items-start space-x-3">
                                      <div className="mt-1 h-2 w-2 rounded-full bg-green-400"></div>
                                      <span>Shared project workspace and resources</span>
                                  </li>
                                  <li className="flex items-start space-x-3">
                                      <div className="mt-1 h-2 w-2 rounded-full bg-teal-400"></div>
                                      <span>Team progress tracking and milestones</span>
                                  </li>
                                  <li className="flex items-start space-x-3">
                                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400"></div>
                                      <span>Integrated communication channels</span>
                                  </li>
                              </ul>
                          </div>
                      </div>

                      <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-8 backdrop-blur-sm ring-1 ring-white/10">
                          <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
                              <div className="flex-1">
                                   <h3 className="mb-4 text-2xl font-semibold text-white">Team Verification System</h3>
                                   <p className="text-gray-300 mb-4">
                                       Each team member receives a unique QR code linked to their NFT badge that proves their participation. 
                                       Admins scan participants' QR codes to verify attendance and team composition in real-time.
                                   </p>
                                   <div className="flex items-center space-x-4">
                                       <div className="flex items-center space-x-2">
                                           <QrCode className="h-5 w-5 text-blue-400" />
                                           <span className="text-sm text-gray-300">Participant QR Codes</span>
                                       </div>
                                       <div className="flex items-center space-x-2">
                                           <Shield className="h-5 w-5 text-green-400" />
                                           <span className="text-sm text-gray-300">Secure NFT Badges</span>
                                       </div>
                                   </div>
                               </div>
                              <div className="flex space-x-4">
                                  <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center">
                                      <QrCode className="h-12 w-12 text-blue-400" />
                                  </div>
                                  <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-green-400/20 to-teal-400/20 flex items-center justify-center">
                                      <Shield className="h-12 w-12 text-green-400" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* Project Submission & Rewards Section */}
              <section className="px-6 py-20 lg:px-8 bg-gradient-to-b from-transparent to-slate-900/50">
                  <div className="mx-auto max-w-6xl">
                      <div className="mb-16 text-center">
                          <h2 className="mb-4 text-4xl font-bold text-white">
                              Project Submission &{' '}
                              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                  Rewards
                              </span>
                          </h2>
                          <p className="text-xl text-gray-300">
                              From submission to celebration
                          </p>
                      </div>

                      <div className="grid gap-8 lg:grid-cols-3">
                          {/* Submission Process */}
                          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300">
                              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                                  <Upload className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="mb-6 text-xl font-semibold text-white">Easy Submission</h3>
                              
                              <div className="space-y-4">
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-semibold text-xs">1</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Upload Project</p>
                                          <p className="text-gray-400 text-xs">GitHub repo, demo links, documentation</p>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-semibold text-xs">2</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Team Verification</p>
                                          <p className="text-gray-400 text-xs">Confirm all team members participated</p>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-semibold text-xs">3</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Submit & Track</p>
                                          <p className="text-gray-400 text-xs">Real-time submission status updates</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Judging Process */}
                          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300">
                              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-400">
                                  <Award className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="mb-6 text-xl font-semibold text-white">Fair Judging</h3>
                              
                              <div className="space-y-4">
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-semibold text-xs">1</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Admin Review</p>
                                          <p className="text-gray-400 text-xs">Transparent evaluation criteria</p>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-semibold text-xs">2</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Scoring System</p>
                                          <p className="text-gray-400 text-xs">Multi-criteria evaluation framework</p>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-semibold text-xs">3</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Final Rankings</p>
                                          <p className="text-gray-400 text-xs">Automated leaderboard generation</p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Reward Distribution */}
                          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur-sm ring-1 ring-white/10 hover:bg-white/10 transition-all duration-300">
                              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-500 to-orange-400">
                                  <Coins className="h-6 w-6 text-white" />
                              </div>
                              <h3 className="mb-6 text-xl font-semibold text-white">Instant Rewards</h3>
                              
                              <div className="space-y-4">
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-300 font-semibold text-xs">1</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Automatic Distribution</p>
                                          <p className="text-gray-400 text-xs">Winners receive tokens instantly</p>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-300 font-semibold text-xs">2</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Exchange Ready</p>
                                          <p className="text-gray-400 text-xs">Send to any supported exchange</p>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-start space-x-3">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-300 font-semibold text-xs">3</div>
                                      <div>
                                          <p className="font-medium text-white text-sm">Zero Gas Fees</p>
                                          <p className="text-gray-400 text-xs">All transactions covered by organizers</p>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Reward Pool Visualization */}
                      <div className="mt-16 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-8 backdrop-blur-sm ring-1 ring-white/10">
                          <div className="text-center mb-8">
                              <h3 className="text-2xl font-bold text-white mb-4">Reward Pool Management</h3>
                              <p className="text-gray-300">Transparent and automated reward distribution</p>
                          </div>
                          
                          <div className="grid gap-6 lg:grid-cols-4">
                              <div className="text-center">
                                  <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400">
                                      <Crown className="h-8 w-8 text-white" />
                                  </div>
                                  <h4 className="font-semibold text-white mb-2">1st Place</h4>
                                  <p className="text-2xl font-bold text-blue-400">50%</p>
                                  <p className="text-gray-400 text-sm">of total pool</p>
                              </div>
                              
                              <div className="text-center">
                                  <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-400">
                                      <Trophy className="h-8 w-8 text-white" />
                                  </div>
                                  <h4 className="font-semibold text-white mb-2">2nd Place</h4>
                                  <p className="text-2xl font-bold text-purple-400">30%</p>
                                  <p className="text-gray-400 text-sm">of total pool</p>
                              </div>
                              
                              <div className="text-center">
                                  <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-400">
                                      <Award className="h-8 w-8 text-white" />
                                  </div>
                                  <h4 className="font-semibold text-white mb-2">3rd Place</h4>
                                  <p className="text-2xl font-bold text-green-400">15%</p>
                                  <p className="text-gray-400 text-sm">of total pool</p>
                              </div>
                              
                              <div className="text-center">
                                  <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-r from-yellow-500 to-orange-400">
                                      <Star className="h-8 w-8 text-white" />
                                  </div>
                                  <h4 className="font-semibold text-white mb-2">Participation</h4>
                                  <p className="text-2xl font-bold text-yellow-400">5%</p>
                                  <p className="text-gray-400 text-sm">for all participants</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* CTA Section */}
            <section ref={ctaRef} id="cta" className="px-6 py-20 lg:px-8 relative overflow-hidden">
                {/* Parallax Background Elements */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float"></div>
                    <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
                </div>
                
                <div className="mx-auto max-w-4xl text-center relative z-10">
                    <div className={`${isVisible.cta ? 'animate-fade-in-up' : 'opacity-0'}`}>
                        <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
                            Ready to revolutionize your{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent animate-gradient-x">
                                hackathon experience?
                            </span>
                        </h2>
                        <p className="mb-8 text-xl text-gray-300">
                            Join thousands of developers already building the future with Hack'n'sui
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button
                                size="lg"
                                onClick={handleGetStarted}
                                className="px-8 py-4 text-lg group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
                            >
                                <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                                Get Started Now
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleLogin}
                                className="px-8 py-4 text-lg border-white/20 text-white hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-300"
                            >
                                <Code className="mr-2 h-5 w-5" />
                                Learn More
                            </Button>
                        </div>
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