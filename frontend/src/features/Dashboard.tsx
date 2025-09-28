import { useCategories, useDashboardData, useUpcomingEvents } from '@/api/queries/dashboardQueries';

import { useNavigate } from 'react-router-dom';

import {
    AlertCircle,
    ArrowUpRight,
    BarChart3,
    Bell,
    Calendar,
    Loader2,
    MapPin,
    Moon,
    Plus,
    QrCode,
    RefreshCw,
    Search,
    Sparkles,
    Sun,
    Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

export default function Dashboard() {
    const { theme, toggleTheme } = useThemeStore();
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    // Note: Authentication is optional for viewing events and categories
    // Only redirect to login if trying to create events or access user-specific features

    // Fetch data from backend (only if authenticated)
    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        error: dashboardError,
    } = useDashboardData({ enabled: isAuthenticated });

    const {
        data: upcomingEventsData,
        isLoading: isEventsLoading,
        error: eventsError,
        refetch: refetchEvents,
    } = useUpcomingEvents(4, { enabled: true });

    const {
        data: categoriesData,
        isLoading: isCategoriesLoading,
        error: categoriesError,
    } = useCategories({ enabled: true });

    // Process data or use fallbacks
    const quickStats = dashboardData?.data?.stats
        ? [
              {
                  title: 'Total Events',
                  value: dashboardData.data.stats.totalEvents.value.toString(),
                  change: dashboardData.data.stats.totalEvents.change,
                  trend: dashboardData.data.stats.totalEvents.trend,
                  color: 'purple',
              },
              {
                  title: 'Active Users',
                  value: dashboardData.data.stats.activeUsers.value.toString(),
                  change: dashboardData.data.stats.activeUsers.change,
                  trend: dashboardData.data.stats.activeUsers.trend,
                  color: 'green',
              },
              {
                  title: 'This Month',
                  value: dashboardData.data.stats.thisMonth.value.toString(),
                  change: dashboardData.data.stats.thisMonth.change,
                  trend: dashboardData.data.stats.thisMonth.trend,
                  color: 'orange',
              },
              {
                  title: 'Revenue',
                  value: dashboardData.data.stats.revenue.value,
                  change: dashboardData.data.stats.revenue.change,
                  trend: dashboardData.data.stats.revenue.trend,
                  color: 'blue',
              },
          ]
        : [
              // Fallback data while loading
              {
                  title: 'Total Events',
                  value: '0',
                  change: '+0%',
                  trend: 'stable' as const,
                  color: 'purple',
              },
              {
                  title: 'Active Users',
                  value: '0',
                  change: '+0%',
                  trend: 'stable' as const,
                  color: 'green',
              },
              {
                  title: 'This Month',
                  value: '0',
                  change: '+0%',
                  trend: 'stable' as const,
                  color: 'orange',
              },
              {
                  title: 'Revenue',
                  value: '$0',
                  change: '+0%',
                  trend: 'stable' as const,
                  color: 'blue',
              },
          ];

    const upcomingEvents = upcomingEventsData?.data?.events || [];
    const categories = categoriesData?.data?.categories || [];

    // Debug logging to see what data we're getting
    console.log('🔍 Dashboard Data Debug:');
    console.log('🔍 isAuthenticated:', isAuthenticated);
    console.log('🔍 user:', user);
    console.log('🔍 upcomingEventsData:', upcomingEventsData);
    console.log('🔍 upcomingEvents:', upcomingEvents);
    console.log('🔍 categoriesData:', categoriesData);
    console.log('🔍 categories:', categories);
    console.log('🔍 dashboardData:', dashboardData);
    console.log('🔍 isEventsLoading:', isEventsLoading);
    console.log('🔍 eventsError:', eventsError);
    console.log('🔍 isCategoriesLoading:', isCategoriesLoading);
    console.log('🔍 categoriesError:', categoriesError);

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
                                onClick={() => {
                                    if (!isAuthenticated) {
                                        navigate('/login');
                                    } else {
                                        navigate('/dashboard/create-event');
                                    }
                                }}
                                className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-cyan-500 hover:shadow-blue-500/25"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                {isAuthenticated ? 'Create Event' : 'Login to Create Event'}
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
                                {user?.firstName?.[0]?.toUpperCase() || 'U'}
                                {user?.lastName?.[0]?.toUpperCase() || ''}
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
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="mb-2 text-2xl font-light text-white">
                                    Upcoming Events
                                </h2>
                                <p className="text-gray-400">Don't miss these important dates</p>
                            </div>
                            <button
                                onClick={() => {
                                    console.log('🔄 Manual refresh triggered');
                                    refetchEvents();
                                }}
                                className="flex items-center space-x-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                                disabled={isEventsLoading}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${isEventsLoading ? 'animate-spin' : ''}`}
                                />
                                <span>Refresh</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {isEventsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                                    <span className="ml-2 text-gray-400">Loading events...</span>
                                </div>
                            ) : eventsError ? (
                                <div className="flex items-center justify-center py-12">
                                    <AlertCircle className="h-8 w-8 text-red-400" />
                                    <span className="ml-2 text-red-400">Failed to load events</span>
                                </div>
                            ) : upcomingEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Calendar className="mb-4 h-12 w-12 text-gray-400" />
                                    <span className="text-lg text-gray-400">
                                        No upcoming events
                                    </span>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Create your first event to get started!
                                    </p>
                                </div>
                            ) : (
                                upcomingEvents.map((event, index) => {
                                    const startDate = new Date(event.startTime);
                                    const formattedDate = startDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                    });
                                    const formattedTime = startDate.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    });

                                    return (
                                        <div key={event.id} className="flex">
                                            {/* Timeline Date */}
                                            <div className="mr-8 w-24 flex-shrink-0">
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-white">
                                                        {formattedDate}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formattedTime}
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
                                                            {event.category === 'Tech' ||
                                                            event.category === 'tech'
                                                                ? '💻'
                                                                : event.category === 'Conference' ||
                                                                    event.category === 'conference'
                                                                  ? '🎤'
                                                                  : event.category ===
                                                                          'Networking' ||
                                                                      event.category ===
                                                                          'networking'
                                                                    ? '🤝'
                                                                    : event.category === 'AI' ||
                                                                        event.category === 'ai'
                                                                      ? '🤖'
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

                                                        {event.location && (
                                                            <div className="mb-3 flex items-center space-x-4 text-sm text-gray-300">
                                                                <div className="flex items-center space-x-1">
                                                                    <MapPin className="h-4 w-4" />
                                                                    <span>{event.location}</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <Users className="h-4 w-4 text-gray-400" />
                                                                <span className="text-sm text-gray-300">
                                                                    {event.attendees}
                                                                </span>
                                                                <span className="text-gray-500">
                                                                    •
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs ${getCategoryColor(event.category === 'Tech' || event.category === 'tech' ? 'blue' : event.category === 'Conference' || event.category === 'conference' ? 'purple' : 'cyan')}`}
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
                                    );
                                })
                            )}
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
                                {isCategoriesLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                                        >
                                            <div className="mb-2 flex items-center space-x-3">
                                                <div className="h-4 w-4 rounded bg-gray-600"></div>
                                                <div className="h-4 w-16 rounded bg-gray-600"></div>
                                            </div>
                                            <div className="h-3 w-20 rounded bg-gray-600"></div>
                                        </div>
                                    ))
                                ) : categoriesError ? (
                                    <div className="col-span-2 flex items-center justify-center py-8">
                                        <AlertCircle className="h-6 w-6 text-red-400" />
                                        <span className="ml-2 text-sm text-red-400">
                                            Failed to load categories
                                        </span>
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="col-span-2 flex flex-col items-center justify-center py-8">
                                        <span className="text-sm text-gray-400">
                                            No categories available
                                        </span>
                                    </div>
                                ) : (
                                    categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="group cursor-pointer rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10"
                                        >
                                            <div className="mb-2 flex items-center space-x-3">
                                                <span className="text-lg">{category.icon}</span>
                                                <span className="text-sm font-medium text-white">
                                                    {category.name}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-300">
                                                {category.eventCount} Event
                                                {category.eventCount !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h3 className="mb-6 text-xl font-light text-white">Quick Actions</h3>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => {
                                        if (!isAuthenticated) {
                                            navigate('/login');
                                        } else {
                                            navigate('/dashboard/create-event');
                                        }
                                    }}
                                    className="h-14 w-full justify-start rounded-xl border-0 bg-gradient-to-r from-blue-500 to-cyan-400 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-blue-600 hover:to-cyan-500 hover:shadow-blue-500/25"
                                >
                                    <Plus className="mr-3 h-6 w-6" />
                                    {isAuthenticated ? 'Create Event' : 'Login to Create Event'}
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
