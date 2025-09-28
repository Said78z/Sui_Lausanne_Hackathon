import { useCategories, useUpcomingEvents } from '@/api/queries/dashboardQueries';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    BarChart3,
    Bell,
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    MapPin,
    Plus,
    Search,
    Sparkles,
    Users,
} from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime?: string;
    status: string;
    category: string;
    priority: string;
    attendees: number;
    maxAttendees?: number;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

const Calendar = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    // const [searchTerm, setSearchTerm] = useState('');
    // const [filterType, setFilterType] = useState<string>('all');
    const dayViewRef = useRef<HTMLDivElement>(null);

    // Get authentication state
    const { isAuthenticated } = useAuthStore();

    // Fetch events from backend (get more events for calendar view)
    const {
        data: eventsData,
        isLoading: isEventsLoading,
        error: eventsError,
    } = useUpcomingEvents(50, { enabled: isAuthenticated }); // Get up to 50 events

    // Fetch categories from backend
    const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories({
        enabled: isAuthenticated,
    });

    // Process events data - fix the data access path
    const events: CalendarEvent[] = (eventsData as any)?.data?.events || [];
    const categories = (categoriesData as any)?.data?.categories || [];

    console.log('🔍 Calendar Debug:');
    console.log('🔍 events:', events);
    console.log('🔍 events count:', events.length);
    console.log('🔍 categories:', categories);
    console.log('🔍 isEventsLoading:', isEventsLoading);
    console.log('🔍 eventsError:', eventsError);

    // Debug today's date and events (timezone-safe)
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayString = `${todayYear}-${todayMonth}-${todayDay}`;
    console.log('🔍 Today is:', todayString);

    const todaysEvents = events.filter((event) => {
        const eventDate = new Date(event.startTime);
        const eventYear = eventDate.getFullYear();
        const eventMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
        const eventDay = String(eventDate.getDate()).padStart(2, '0');
        const eventDateString = `${eventYear}-${eventMonth}-${eventDay}`;
        return eventDateString === todayString;
    });
    console.log('🔍 Events for today:', todaysEvents);

    // Debug current calendar month
    console.log('🔍 Current calendar date:', currentDate);
    console.log(
        '🔍 Current calendar month:',
        currentDate.getMonth() + 1,
        'year:',
        currentDate.getFullYear()
    );

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('Calendar: User not authenticated, redirecting to login');
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getEventsForDate = (date: Date) => {
        // Use local date string to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;

        const filteredEvents = events.filter((event) => {
            const eventDate = new Date(event.startTime);
            const eventYear = eventDate.getFullYear();
            const eventMonth = String(eventDate.getMonth() + 1).padStart(2, '0');
            const eventDay = String(eventDate.getDate()).padStart(2, '0');
            const eventDateString = `${eventYear}-${eventMonth}-${eventDay}`;

            const matches = eventDateString === dateString;

            // Debug logging for today's date
            const today = new Date();
            const todayYear = today.getFullYear();
            const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
            const todayDay = String(today.getDate()).padStart(2, '0');
            const todayString = `${todayYear}-${todayMonth}-${todayDay}`;

            // Debug logging for all events to see placement
            console.log('🔍 Event placement check:', {
                eventTitle: event.title,
                eventStartTime: event.startTime,
                eventDateString: eventDateString,
                calendarDateString: dateString,
                matches: matches,
            });

            return matches;
        });

        return filteredEvents;
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        setCurrentDate(newDate);
    };

    const navigateDay = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 1);
        } else {
            newDate.setDate(newDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    };

    const navigateCalendar = (direction: 'prev' | 'next') => {
        switch (viewMode) {
            case 'month':
                navigateMonth(direction);
                break;
            case 'week':
                navigateWeek(direction);
                break;
            case 'day':
                navigateDay(direction);
                break;
        }
    };

    const getEventColor = (categoryName: string) => {
        // Find the category to get its color
        const category = categories.find((cat: any) => cat.name === categoryName);
        const color = category?.color || 'blue';

        const colors = {
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            green: 'bg-green-500/20 text-green-400 border-green-500/30',
            orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            red: 'bg-red-500/20 text-red-400 border-red-500/30',
            cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    // Helper function to check if a date is today
    const isToday = (date: Date): boolean => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    // Helper function to format date for comparison
    const formatDateString = (date: Date): string => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // Helper function to get week dates
    const getWeekDates = (date: Date): Date[] => {
        const week = [];
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);

        for (let i = 0; i < 7; i++) {
            const weekDate = new Date(startOfWeek);
            weekDate.setDate(startOfWeek.getDate() + i);
            week.push(weekDate);
        }
        return week;
    };

    // Helper function to get hours for day view
    const getHoursArray = (): string[] => {
        const hours = [];
        for (let i = 0; i < 24; i++) {
            const hour =
                i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
            hours.push(hour);
        }
        return hours;
    };

    // Get calendar data
    const days = getDaysInMonth(currentDate);

    // Auto-scroll to current hour in day view
    useEffect(() => {
        if (viewMode === 'day' && dayViewRef.current) {
            const currentHour = new Date().getHours();
            const hourElement = dayViewRef.current.children[currentHour] as HTMLElement;
            if (hourElement) {
                setTimeout(() => {
                    const container = dayViewRef.current;
                    const containerHeight = container!.clientHeight;
                    const elementTop = hourElement.offsetTop;
                    const elementHeight = hourElement.clientHeight;
                    const scrollTop = elementTop - containerHeight / 2 + elementHeight / 2;

                    container!.scrollTo({
                        top: scrollTop,
                        behavior: 'smooth',
                    });
                }, 100);
            }
        }
    }, [viewMode, currentDate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Background pattern and glow effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-900/30 via-cyan-900/20 to-transparent" />

            {/* Top Navigation - Dashboard Style */}
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
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center space-x-2 text-gray-300 transition-colors hover:text-white"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span className="font-medium">Dashboard</span>
                                </button>
                                <button className="flex items-center space-x-2 text-white transition-colors hover:text-blue-300">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span className="font-medium">Calendar</span>
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

                            <button
                                onClick={() => navigate('/dashboard/create-event')}
                                className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-1.5 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-cyan-500 hover:shadow-blue-500/25"
                            >
                                <Plus className="mr-1.5 h-4 w-4" />
                                Create Event
                            </button>

                            <button className="p-2 text-gray-300 transition-colors hover:text-white">
                                <Search className="h-5 w-5" />
                            </button>

                            <button className="relative p-2 text-gray-300 transition-colors hover:text-white">
                                <Bell className="h-5 w-5" />
                                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-blue-500"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Calendar Controls */}
            <div className="mx-auto max-w-7xl px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* View Mode Selector */}
                    <div className="inline-flex rounded-lg border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
                        {(['month', 'week', 'day'] as const).map((mode) => (
                            <div
                                key={mode}
                                onClick={() => {
                                    console.log(`${mode} clicked!`);
                                    setViewMode(mode);
                                }}
                                className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                    viewMode === mode
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                } `}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </div>
                        ))}
                    </div>

                    {/* Search and Filter */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-white/50" />
                            <input
                                type="text"
                                placeholder="Search events..."
                                className="rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-white placeholder-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button className="flex items-center space-x-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-3">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between border-b border-white/10 p-6">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => navigateCalendar('prev')}
                                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>

                                    <h2 className="text-2xl font-bold text-white">
                                        {viewMode === 'month' &&
                                            `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                                        {viewMode === 'week' &&
                                            `Week of ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
                                        {viewMode === 'day' &&
                                            `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
                                    </h2>

                                    <button
                                        onClick={() => navigateCalendar('next')}
                                        className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setCurrentDate(new Date())}
                                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    Today
                                </button>
                            </div>

                            {/* Calendar Views */}
                            {/* Month View */}
                            {viewMode === 'month' && (
                                <>
                                    {/* Days of Week Header */}
                                    <div className="grid grid-cols-7 border-b border-white/10">
                                        {dayNames.map((day) => (
                                            <div key={day} className="p-4 text-center">
                                                <span className="text-sm font-medium text-white/70">
                                                    {day}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Days */}
                                    <div className="grid grid-cols-7">
                                        {days.map((day, index) => {
                                            if (!day) {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="h-24 border-b border-r border-white/5"
                                                    />
                                                );
                                            }

                                            const dayEvents = getEventsForDate(day);
                                            const isTodayDate = isToday(day);
                                            const isSelected =
                                                selectedDate?.toDateString() === day.toDateString();

                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedDate(day)}
                                                    className={`relative h-24 cursor-pointer border-b border-r border-white/5 p-2 transition-colors hover:bg-white/5 ${
                                                        isSelected ? 'bg-blue-500/20' : ''
                                                    } ${isTodayDate ? 'bg-blue-500/10' : ''}`}
                                                >
                                                    <div
                                                        className={`relative mb-1 text-sm font-medium ${
                                                            isTodayDate
                                                                ? 'font-bold text-blue-400'
                                                                : 'text-white/80'
                                                        }`}
                                                    >
                                                        {isTodayDate && (
                                                            <div className="absolute -inset-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                                                                <span className="text-xs font-bold text-white">
                                                                    {day.getDate()}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {!isTodayDate && day.getDate()}
                                                    </div>

                                                    <div className="space-y-1">
                                                        {dayEvents.slice(0, 2).map((event) => (
                                                            <div
                                                                key={event.id}
                                                                className={`rounded border px-2 py-1 text-xs ${getEventColor(event.category)} truncate`}
                                                            >
                                                                {event.title}
                                                            </div>
                                                        ))}
                                                        {dayEvents.length > 2 && (
                                                            <div className="text-xs text-white/50">
                                                                +{dayEvents.length - 2} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* Week View */}
                            {viewMode === 'week' && (
                                <>
                                    {/* Days of Week Header */}
                                    <div className="grid grid-cols-7 border-b border-white/10">
                                        {dayNames.map((day) => (
                                            <div key={day} className="p-4 text-center">
                                                <span className="text-sm font-medium text-white/70">
                                                    {day}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Week Days */}
                                    <div className="grid grid-cols-7">
                                        {getWeekDates(currentDate).map((day, index) => {
                                            const dayEvents = getEventsForDate(day);
                                            const isSelected =
                                                selectedDate?.toDateString() === day.toDateString();
                                            const isTodayDate = isToday(day);

                                            return (
                                                <div
                                                    key={index}
                                                    onClick={() => setSelectedDate(day)}
                                                    className={`min-h-[200px] cursor-pointer border-b border-r border-white/5 p-3 transition-colors hover:bg-white/5 ${
                                                        isSelected ? 'bg-blue-500/20' : ''
                                                    } ${isTodayDate ? 'bg-blue-500/10' : ''}`}
                                                >
                                                    <div
                                                        className={`mb-3 text-lg font-medium ${
                                                            isTodayDate
                                                                ? 'font-bold text-blue-400'
                                                                : 'text-white'
                                                        }`}
                                                    >
                                                        {day.getDate()}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {dayEvents.map((event) => (
                                                            <div
                                                                key={event.id}
                                                                className={`rounded border p-2 text-xs ${getEventColor(event.category)}`}
                                                            >
                                                                <div className="font-medium">
                                                                    {event.title}
                                                                </div>
                                                                <div className="text-white/70">
                                                                    {new Date(
                                                                        event.startTime
                                                                    ).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: false,
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {/* Day View */}
                            {viewMode === 'day' && (
                                <div className="p-6">
                                    <div
                                        ref={dayViewRef}
                                        className="max-h-[600px] space-y-1 overflow-y-auto"
                                    >
                                        {getHoursArray().map((hour, index) => {
                                            const hourEvents = events.filter((event) => {
                                                const eventDate = new Date(event.startTime);
                                                const eventDateString = formatDateString(eventDate);
                                                const eventHour = eventDate.getHours();
                                                const targetHour =
                                                    hour === '12 AM'
                                                        ? 0
                                                        : hour.includes('AM')
                                                          ? parseInt(hour.split(' ')[0]) === 12
                                                              ? 0
                                                              : parseInt(hour.split(' ')[0])
                                                          : hour === '12 PM'
                                                            ? 12
                                                            : parseInt(hour.split(' ')[0]) + 12;

                                                return (
                                                    eventDateString ===
                                                        formatDateString(currentDate) &&
                                                    eventHour === targetHour
                                                );
                                            });

                                            const currentHour = new Date().getHours();
                                            const isCurrentHour =
                                                index === currentHour &&
                                                formatDateString(currentDate) ===
                                                    formatDateString(new Date());

                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex min-h-[60px] border-b border-white/10 ${
                                                        isCurrentHour
                                                            ? 'border-blue-400/30 bg-blue-500/10'
                                                            : ''
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-20 border-r border-white/10 p-3 text-sm ${
                                                            isCurrentHour
                                                                ? 'font-semibold text-blue-300'
                                                                : 'text-white/70'
                                                        }`}
                                                    >
                                                        {hour}
                                                    </div>
                                                    <div className="flex-1 p-3">
                                                        {hourEvents.map((event) => (
                                                            <div
                                                                key={event.id}
                                                                className={`mb-2 rounded-lg border p-3 ${getEventColor(event.category)}`}
                                                            >
                                                                <div className="font-medium text-white">
                                                                    {event.title}
                                                                </div>
                                                                <div className="text-sm text-white/70">
                                                                    {new Date(
                                                                        event.startTime
                                                                    ).toLocaleTimeString('en-US', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        hour12: false,
                                                                    })}
                                                                    {event.endTime && (
                                                                        <span>
                                                                            {' - '}
                                                                            {new Date(
                                                                                event.endTime
                                                                            ).toLocaleTimeString(
                                                                                'en-US',
                                                                                {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                    hour12: false,
                                                                                }
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {event.location && (
                                                                    <div className="mt-1 flex items-center text-sm text-white/70">
                                                                        <MapPin className="mr-1 h-3 w-3" />
                                                                        {event.location}
                                                                    </div>
                                                                )}
                                                                {event.description && (
                                                                    <div className="mt-1 text-sm text-white/60">
                                                                        {event.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Mini Calendar */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-lg font-semibold text-white">Quick View</h3>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-400">
                                    {new Date().getDate()}
                                </div>
                                <div className="text-sm text-white/70">
                                    {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-lg font-semibold text-white">
                                Upcoming Events
                            </h3>
                            {isEventsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="animate-pulse rounded-lg border border-white/10 bg-white/5 p-3"
                                        >
                                            <div className="mb-2 h-4 rounded bg-white/10"></div>
                                            <div className="h-3 w-2/3 rounded bg-white/5"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : events.length > 0 ? (
                                <div className="space-y-3">
                                    {events.slice(0, 4).map((event) => {
                                        const category = categories.find(
                                            (cat: any) => cat.name === event.category
                                        );
                                        const categoryColor = category?.color || 'blue';

                                        return (
                                            <div
                                                key={event.id}
                                                className="flex items-start space-x-3 rounded-lg border border-white/10 bg-white/5 p-3"
                                            >
                                                <div
                                                    className={`mt-1 h-3 w-3 rounded-full ${
                                                        categoryColor === 'blue'
                                                            ? 'bg-blue-500'
                                                            : categoryColor === 'purple'
                                                              ? 'bg-purple-500'
                                                              : categoryColor === 'green'
                                                                ? 'bg-green-500'
                                                                : categoryColor === 'orange'
                                                                  ? 'bg-orange-500'
                                                                  : categoryColor === 'red'
                                                                    ? 'bg-red-500'
                                                                    : categoryColor === 'cyan'
                                                                      ? 'bg-cyan-500'
                                                                      : categoryColor === 'yellow'
                                                                        ? 'bg-yellow-500'
                                                                        : categoryColor === 'pink'
                                                                          ? 'bg-pink-500'
                                                                          : 'bg-blue-500'
                                                    }`}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-medium text-white">
                                                        {event.title}
                                                    </div>
                                                    <div className="mt-1 flex items-center space-x-2">
                                                        <Clock className="h-3 w-3 text-white/50" />
                                                        <span className="text-xs text-white/70">
                                                            {new Date(
                                                                event.startTime
                                                            ).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                hour12: false,
                                                            })}
                                                        </span>
                                                    </div>
                                                    {event.location && (
                                                        <div className="mt-1 flex items-center space-x-2">
                                                            <MapPin className="h-3 w-3 text-white/50" />
                                                            <span className="truncate text-xs text-white/70">
                                                                {event.location}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="mt-1 flex items-center space-x-2">
                                                        <Users className="h-3 w-3 text-white/50" />
                                                        <span className="text-xs text-white/70">
                                                            {event.attendees} attendees
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <CalendarIcon className="mx-auto mb-3 h-12 w-12 text-white/20" />
                                    <p className="text-sm text-white/50">No upcoming events</p>
                                    <button
                                        onClick={() => navigate('/dashboard/create-event')}
                                        className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
                                    >
                                        Create your first event
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Event Categories */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                            <h3 className="mb-4 text-lg font-semibold text-white">Categories</h3>
                            {isCategoriesLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="animate-pulse rounded-lg p-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="h-3 w-3 rounded-full bg-white/10"></div>
                                                <div className="h-3 flex-1 rounded bg-white/10"></div>
                                                <div className="h-3 w-6 rounded bg-white/5"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : categories.length > 0 ? (
                                <div className="space-y-2">
                                    {categories.map((category: any) => (
                                        <div
                                            key={category.name}
                                            className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-white/5"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`h-3 w-3 rounded-full ${
                                                        category.color === 'blue'
                                                            ? 'bg-blue-500'
                                                            : category.color === 'green'
                                                              ? 'bg-green-500'
                                                              : category.color === 'purple'
                                                                ? 'bg-purple-500'
                                                                : category.color === 'orange'
                                                                  ? 'bg-orange-500'
                                                                  : category.color === 'red'
                                                                    ? 'bg-red-500'
                                                                    : category.color === 'cyan'
                                                                      ? 'bg-cyan-500'
                                                                      : category.color === 'yellow'
                                                                        ? 'bg-yellow-500'
                                                                        : category.color === 'pink'
                                                                          ? 'bg-pink-500'
                                                                          : 'bg-blue-500'
                                                    }`}
                                                />
                                                <span className="text-sm text-white/80">
                                                    {category.name}
                                                </span>
                                            </div>
                                            <span className="text-xs text-white/50">
                                                {category.eventCount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <p className="text-sm text-white/50">No categories available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;
