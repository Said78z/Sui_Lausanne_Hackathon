import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/themeStore';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
    Search, 
    Bell, 
    Users, 
    BarChart3, 
    Plus, 
    Calendar,
    Sun,
    Moon,
    Sparkles,
    ArrowLeft
} from 'lucide-react';

interface NavbarProps {
    variant?: 'landing' | 'auth' | 'dashboard' | 'calendar';
    showBackButton?: boolean;
    currentPage?: string;
}

export default function Navbar({ variant = 'dashboard', showBackButton = false, currentPage }: NavbarProps) {
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleGetStarted = () => {
        navigate('/register');
    };

    // Landing page navbar
    if (variant === 'landing') {
        return (
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8 backdrop-blur-sm bg-white/5 border-b border-white/10">
                <div className="flex items-center space-x-2 animate-fade-in">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:scale-110 transition-transform duration-300 hover:rotate-12">
                        <Sparkles className="h-6 w-6 text-white animate-pulse" />
                    </div>
                    <span className="text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                        Hack'n'Sui
                    </span>
                </div>
                <div className="flex items-center space-x-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Button
                        variant="ghost"
                        onClick={handleLogin}
                        className="text-white hover:bg-white/10 transition-all duration-300"
                    >
                        Login
                    </Button>
                    <Button
                        onClick={handleGetStarted}
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500 font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                    >
                        Get Started
                    </Button>
                </div>
            </nav>
        );
    }

    // Auth pages (login/register) navbar
    if (variant === 'auth') {
        return (
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
                {showBackButton && (
                    <Button
                        variant="ghost"
                        onClick={handleBackToHome}
                        className="text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                )}
                <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-white">Hack'n'Sui</span>
                </div>
            </nav>
        );
    }

    // Calendar page navbar
    if (variant === 'calendar') {
        return (
            <nav className="relative z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Left side - Navigation */}
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-2 animate-fade-in">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:scale-110 transition-transform duration-300 hover:rotate-12">
                                    <Sparkles className="h-6 w-6 text-white animate-pulse" />
                                </div>
                                <span className="text-2xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                    Hack'n'Sui
                                </span>
                            </div>
                            
                            <div className="hidden md:flex items-center space-x-6">
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="font-medium">Dashboard</span>
                                </button>
                                <button className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Calendar</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                                    <Search className="h-4 w-4" />
                                    <span className="font-medium">Discover</span>
                                </button>
                            </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-400 text-sm hidden sm:block">{formatTime(currentTime)}</span>
                            
                            <button 
                                onClick={() => navigate('/dashboard/create-event')}
                                className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500 font-medium px-4 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 text-sm"
                            >
                                <Plus className="h-4 w-4 mr-1.5" />
                                Create Event
                            </button>
                            
                            <button className="p-2 text-gray-300 hover:text-white transition-colors">
                                <Search className="h-5 w-5" />
                            </button>
                            
                            <button className="p-2 text-gray-300 hover:text-white transition-colors relative">
                                <Bell className="h-5 w-5" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    // Default dashboard navbar
    return (
        <nav className="relative z-50 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Navigation */}
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2 animate-fade-in">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 hover:scale-110 transition-transform duration-300 hover:rotate-12">
                                <Sparkles className="h-6 w-6 text-white animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Hack'n'Sui</h1>
                                <p className="text-xs text-gray-600 dark:text-gray-300">Event Management</p>
                            </div>
                        </div>
                        
                        <div className="hidden md:flex items-center space-x-6">
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className={`flex items-center space-x-2 transition-colors ${
                                    currentPage === 'dashboard' || !currentPage
                                        ? 'text-gray-900 dark:text-white' 
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <BarChart3 className="h-4 w-4" />
                                <span className="font-medium">Dashboard</span>
                            </button>
                            <button 
                                onClick={() => navigate('/dashboard/calendar')}
                                className={`flex items-center space-x-2 transition-colors ${
                                    currentPage === 'calendar' 
                                        ? 'text-gray-900 dark:text-white' 
                                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Calendar</span>
                            </button>
                            <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Search className="h-4 w-4" />
                                <span className="font-medium">Discover</span>
                            </button>
                        </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600 dark:text-gray-400 text-sm hidden sm:block">{formatTime(currentTime)}</span>
                        
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="hidden sm:flex items-center space-x-2 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/30 transition-all duration-300"
                        >
                            <Users className="h-4 w-4" />
                            <span>Join Community</span>
                        </Button>
                        
                        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Search className="h-5 w-5" />
                        </button>
                        
                        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                        </button>
                        
                        <button 
                            onClick={toggleTheme}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}