import { useNavigate } from 'react-router-dom';

import {
    ArrowUpRight,
    BarChart3,
    Bell,
    Calendar,
    MapPin,
    Moon,
    Plus,
    QrCode,
    Search,
    Sparkles,
    Sun,
    Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useThemeStore } from '@/stores/themeStore';

export default function Dashboard() {
    const { theme, toggleTheme } = useThemeStore();
    const navigate = useNavigate();

    // Sample data with Luma-style structure
    const quickStats = [
        {
            title: 'Total Events',
            value: '24',
            change: '+12%',
            trend: 'up',
            color: 'purple',
        },
        {
            title: 'Active Users',
            value: '1,234',
            change: '+8%',
            trend: 'up',
            color: 'green',
        },
        {
            title: 'This Month',
            value: '89',
            change: '+23%',
            trend: 'up',
            color: 'orange',
        },
        {
            title: 'Revenue',
            value: '$12.4k',
            change: '+15%',
            trend: 'up',
            color: 'blue',
        },
    ];

    const upcomingEvents = [
        {
            id: 1,
            title: 'SUI <> BSA Hackathon 3rd Edition',
            description: 'BC Building (building of the IC faculty)',
            time: 'Today, 9:00',
            status: 'LIVE',
            attendees: '248',
            priority: 'high',
            category: 'Tech',
            image: '/api/placeholder/80/60',
        },
        {
            id: 2,
            title: 'Hack Seasons Conference Singapore',
            description: 'The Westin Singapore',
            time: '2 Oct, 4:00 - 10:00 GMT+8',
            status: 'Invited',
            attendees: '1.4k',
            priority: 'medium',
            category: 'Conference',
            image: '/api/placeholder/80/60',
        },
        {
            id: 3,
            title: 'EASYCON SINGAPORE',
            description: 'Maxwell Food Centre',
            time: '2 Oct, 12:00 - 18:00 GMT+8',
            status: 'Invited',
            attendees: '1.1k',
            priority: 'medium',
            category: 'Networking',
            image: '/api/placeholder/80/60',
        },
        {
            id: 4,
            title: 'NASA Space Apps Challenge - Paris 2025',
            description: "École Supérieure d'Informatique",
            time: '4 Oct, 9:00',
            status: 'Going',
            attendees: '892',
            priority: 'high',
            category: 'Competition',
            image: '/api/placeholder/80/60',
        },
    ];

    const categories = [
        { name: 'Tech', count: '3K Events', icon: '💻', color: 'purple' },
        { name: 'Food & Drink', count: '134 Events', icon: '🍽️', color: 'orange' },
        { name: 'AI', count: '2K Events', icon: '🤖', color: 'blue' },
        { name: 'Arts & Culture', count: '1K Events', icon: '🎨', color: 'green' },
        { name: 'Climate', count: '822 Events', icon: '🌱', color: 'emerald' },
        { name: 'Fitness', count: '947 Events', icon: '💪', color: 'red' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LIVE':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'Going':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Invited':
                return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getCategoryColor = (color: string) => {
        const colors = {
            purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            green: 'bg-green-500/10 text-green-400 border-green-500/20',
            emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            red: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Background pattern and glow effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-900/30 via-cyan-900/20 to-transparent" />

            {/* Top Navigation - Hack'n'Sui Style */}
            <nav className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left side - Navigation */}
                        <div className="flex items-center space-x-8">
                            <div className="animate-fade-in flex items-center space-x-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 transition-transform duration-300 hover:rotate-12 hover:scale-110">
                                    <Sparkles className="h-6 w-6 animate-pulse text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-2xl font-bold text-transparent text-white">
                                    Hack'n'Sui
                                </span>
                            </div>

                            <div className="hidden items-center space-x-6 md:flex">
                                <button className="flex items-center space-x-2 text-white transition-colors hover:text-blue-300">
                                    <Calendar className="h-4 w-4" />
                                    <span className="font-medium">Events</span>
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/calendar')}
                                    className="flex items-center space-x-2 text-gray-300 transition-colors hover:text-white"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="font-medium">Calendars</span>
                                </button>
                                <button className="flex items-center space-x-2 text-gray-300 transition-colors hover:text-white">
                                    <Search className="h-4 w-4" />
                                    <span className="font-medium">Discover</span>
                                </button>
                            </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center space-x-4">
                            <span className="hidden text-sm text-gray-400 sm:block">
                                17:43 CEST
                            </span>

                            <Button
                                onClick={() => navigate('/dashboard/create-event')}
                                className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-cyan-500 hover:shadow-blue-500/25"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Event
                            </Button>

                            <button className="p-2 text-gray-300 transition-colors hover:text-white">
                                <Search className="h-5 w-5" />
                            </button>

                            <button className="relative p-2 text-gray-300 transition-colors hover:text-white">
                                <Bell className="h-5 w-5" />
                                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500"></div>
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="p-2 text-gray-300 transition-colors hover:text-white"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-5 w-5" />
                                ) : (
                                    <Moon className="h-5 w-5" />
                                )}
                            </button>

                            <button
                                onClick={() => navigate('/dashboard/profile')}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-sm font-semibold text-white transition-transform duration-300 hover:scale-110"
                                title="View Profile"
                            >
                                JD
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="mb-3 text-4xl font-light tracking-tight text-white">Events</h1>
                    <p className="text-lg font-light text-gray-400">
                        Manage and discover amazing events in your area
                    </p>

                    {/* Toggle */}
                    <div className="mt-6 flex items-center space-x-1">
                        <button className="rounded-lg bg-gray-800 px-4 py-2 font-medium text-white">
                            Upcoming
                        </button>
                        <button className="px-4 py-2 text-gray-400 transition-colors hover:text-white">
                            Past
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {quickStats.map((stat, index) => (
                        <div
                            key={index}
                            className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-300">{stat.title}</h3>
                                <div
                                    className={`h-2 w-2 rounded-full ${
                                        stat.color === 'purple'
                                            ? 'bg-purple-400'
                                            : stat.color === 'green'
                                              ? 'bg-green-400'
                                              : stat.color === 'orange'
                                                ? 'bg-orange-400'
                                                : 'bg-blue-400'
                                    }`}
                                />
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-light text-white">{stat.value}</span>
                                <span className="text-sm font-medium text-cyan-400">
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Timeline - Events List */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h2 className="mb-2 text-2xl font-light text-white">Upcoming Events</h2>
                            <p className="text-gray-400">Don't miss these important dates</p>
                        </div>

                        <div className="space-y-8">
                            {upcomingEvents.map((event, index) => (
                                <div key={event.id} className="flex">
                                    {/* Timeline Date */}
                                    <div className="mr-8 w-24 flex-shrink-0">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-white">
                                                {event.time.split(',')[0]}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {event.time.split(',')[1]?.trim() || ''}
                                            </div>
                                        </div>
                                        {index < upcomingEvents.length - 1 && (
                                            <div className="ml-auto mt-4 h-16 w-px bg-gray-700"></div>
                                        )}
                                    </div>

                                    {/* Event Card */}
                                    <div className="group flex-1 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:bg-white/10">
                                        <div className="flex items-start space-x-4">
                                            {/* Event Image */}
                                            <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                                                <span className="text-2xl">
                                                    {event.category === 'Tech'
                                                        ? '💻'
                                                        : event.category === 'Conference'
                                                          ? '🎤'
                                                          : event.category === 'Networking'
                                                            ? '🤝'
                                                            : '🚀'}
                                                </span>
                                            </div>

                                            {/* Event Details */}
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-3 flex items-start justify-between">
                                                    <h3 className="text-lg font-semibold leading-tight text-white transition-colors group-hover:text-blue-300">
                                                        {event.title}
                                                    </h3>
                                                    <span
                                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(event.status)}`}
                                                    >
                                                        {event.status}
                                                    </span>
                                                </div>

                                                <div className="mb-3 flex items-center space-x-4 text-sm text-gray-300">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{event.description}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm text-gray-300">
                                                            {event.attendees}
                                                        </span>
                                                        <span className="text-gray-500">•</span>
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs ${getCategoryColor(event.category === 'Tech' ? 'blue' : event.category === 'Conference' ? 'purple' : 'cyan')}`}
                                                        >
                                                            {event.category}
                                                        </span>
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar - Categories & Quick Actions */}
                    <div className="space-y-8">
                        {/* Browse by Category */}
                        <div>
                            <h3 className="mb-6 text-xl font-light text-white">
                                Browse by Category
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map((category) => (
                                    <div
                                        key={category.name}
                                        className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10"
                                    >
                                        <div className="mb-2 flex items-center space-x-3">
                                            <span className="text-lg">{category.icon}</span>
                                            <span className="text-sm font-medium text-white">
                                                {category.name}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300">{category.count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h3 className="mb-6 text-xl font-light text-white">Quick Actions</h3>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => navigate('/dashboard/create-event')}
                                    className="h-14 w-full justify-start rounded-xl border-0 bg-gradient-to-r from-blue-500 to-cyan-400 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-600 hover:to-cyan-500 hover:shadow-blue-500/25"
                                >
                                    <Plus className="mr-3 h-6 w-6" />
                                    Create Event
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 w-full justify-start rounded-xl border-white/20 font-medium text-gray-300 transition-all duration-300 hover:scale-[1.01] hover:border-white/30 hover:bg-white/10"
                                >
                                    <QrCode className="mr-3 h-5 w-5" />
                                    Scan QR Code
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-12 w-full justify-start rounded-xl border-white/20 font-medium text-gray-300 transition-all duration-300 hover:scale-[1.01] hover:border-white/30 hover:bg-white/10"
                                >
                                    <BarChart3 className="mr-3 h-5 w-5" />
                                    View Analytics
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
