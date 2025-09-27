import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Filter,
  Search,
  Sparkles,
  Bell,
  BarChart3
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  attendees?: number;
  color: string;
  type: 'event' | 'meeting' | 'reminder';
}

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const dayViewRef = useRef<HTMLDivElement>(null);

  // Sample events data
  const events: Event[] = [
    {
      id: '1',
      title: 'Tech Meetup',
      date: '2025-01-15',
      time: '18:00',
      location: 'Zurich Tech Hub',
      attendees: 45,
      color: 'blue',
      type: 'event'
    },
    {
      id: '2',
      title: 'AI Workshop',
      date: '2025-01-18',
      time: '14:00',
      location: 'EPFL',
      attendees: 120,
      color: 'purple',
      type: 'event'
    },
    {
      id: '3',
      title: 'Team Meeting',
      date: '2025-01-20',
      time: '10:00',
      attendees: 8,
      color: 'green',
      type: 'meeting'
    },
    {
      id: '4',
      title: 'Hackathon Prep',
      date: '2025-01-22',
      time: '16:00',
      location: 'Innovation Lab',
      attendees: 25,
      color: 'orange',
      type: 'event'
    }
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
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

  const getEventColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Helper function to check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
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
      const hour = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`;
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
          const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
          
          container!.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }, [viewMode, currentDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background pattern and glow effects */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-900/30 via-cyan-900/20 to-transparent pointer-events-none" />
      
      {/* Top Navigation - Dashboard Style */}
      <nav className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-sm">
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
                  <CalendarIcon className="h-4 w-4" />
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
              <span className="text-gray-400 text-sm hidden sm:block">17:43 CEST</span>
              
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

      {/* Calendar Controls */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* View Mode Selector */}
          <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <div
                key={mode}
                onClick={() => {
                  console.log(`${mode} clicked!`);
                  setViewMode(mode);
                }}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all duration-200
                  ${viewMode === mode 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </div>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
              <input
                type="text"
                placeholder="Search events..."
                className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center space-x-4">
                  <button
                  onClick={() => navigateCalendar('prev')}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <h2 className="text-2xl font-bold text-white">
                  {viewMode === 'month' && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                  {viewMode === 'week' && `Week of ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
                  {viewMode === 'day' && `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`}
                </h2>
                
                <button
                  onClick={() => navigateCalendar('next')}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                </div>

                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
                        <span className="text-sm font-medium text-white/70">{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7">
                    {days.map((day, index) => {
                      if (!day) {
                        return <div key={index} className="h-24 border-r border-b border-white/5" />;
                      }

                      const dayEvents = getEventsForDate(day);
                      const isTodayDate = isToday(day);
                      const isSelected = selectedDate?.toDateString() === day.toDateString();

                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          className={`h-24 border-r border-b border-white/5 p-2 cursor-pointer hover:bg-white/5 transition-colors relative ${
                            isSelected ? 'bg-blue-500/20' : ''
                          } ${isTodayDate ? 'bg-blue-500/10' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-1 relative ${
                            isTodayDate 
                              ? 'text-blue-400 font-bold' 
                              : 'text-white/80'
                          }`}>
                            {isTodayDate && (
                              <div className="absolute -inset-1 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{day.getDate()}</span>
                              </div>
                            )}
                            {!isTodayDate && day.getDate()}
                          </div>
                          
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs px-2 py-1 rounded border ${getEventColor(event.color)} truncate`}
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
                        <span className="text-sm font-medium text-white/70">{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Week Days */}
                  <div className="grid grid-cols-7">
                    {getWeekDates(currentDate).map((day, index) => {
                      const dayEvents = getEventsForDate(day);
                      const isSelected = selectedDate?.toDateString() === day.toDateString();
                      const isTodayDate = isToday(day);

                      return (
                        <div
                          key={index}
                          onClick={() => setSelectedDate(day)}
                          className={`min-h-[200px] p-3 border-r border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 ${
                            isSelected ? 'bg-blue-500/20' : ''
                          } ${isTodayDate ? 'bg-blue-500/10' : ''}`}
                        >
                          <div className={`text-lg font-medium mb-3 ${
                            isTodayDate ? 'text-blue-400 font-bold' : 'text-white'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-2">
                            {dayEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`text-xs p-2 rounded border ${getEventColor(event.color)}`}
                              >
                                <div className="font-medium">{event.title}</div>
                                <div className="text-white/70">{event.time}</div>
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
                  <div ref={dayViewRef} className="space-y-1 max-h-[600px] overflow-y-auto">
                    {getHoursArray().map((hour, index) => {
                      const hourEvents = events.filter(event => 
                        event.date === formatDateString(currentDate) && 
                        event.time.includes(hour.split(' ')[0])
                      );

                      const currentHour = new Date().getHours();
                      const isCurrentHour = index === currentHour && formatDateString(currentDate) === formatDateString(new Date());

                      return (
                        <div 
                          key={index} 
                          className={`flex border-b border-white/10 min-h-[60px] ${
                            isCurrentHour ? 'bg-blue-500/10 border-blue-400/30' : ''
                          }`}
                        >
                          <div className={`w-20 p-3 text-sm border-r border-white/10 ${
                            isCurrentHour ? 'text-blue-300 font-semibold' : 'text-white/70'
                          }`}>
                            {hour}
                          </div>
                          <div className="flex-1 p-3">
                            {hourEvents.map((event) => (
                              <div
                                key={event.id}
                                className={`p-3 rounded-lg mb-2 border ${getEventColor(event.color)}`}
                              >
                                <div className="font-medium text-white">{event.title}</div>
                                <div className="text-sm text-white/70">{event.time}</div>
                                {event.location && (
                                  <div className="text-sm text-white/70 flex items-center mt-1">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {event.location}
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
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Quick View</h3>
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
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {events.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      event.color === 'blue' ? 'bg-blue-500' :
                      event.color === 'purple' ? 'bg-purple-500' :
                      event.color === 'green' ? 'bg-green-500' :
                      event.color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {event.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Clock className="h-3 w-3 text-white/50" />
                        <span className="text-xs text-white/70">{event.time}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-3 w-3 text-white/50" />
                          <span className="text-xs text-white/70 truncate">{event.location}</span>
                        </div>
                      )}
                      {event.attendees && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Users className="h-3 w-3 text-white/50" />
                          <span className="text-xs text-white/70">{event.attendees} attendees</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Categories */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {[
                  { name: 'Tech Events', count: 12, color: 'blue' },
                  { name: 'Meetings', count: 8, color: 'green' },
                  { name: 'Workshops', count: 5, color: 'purple' },
                  { name: 'Social', count: 3, color: 'orange' }
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        category.color === 'blue' ? 'bg-blue-500' :
                        category.color === 'green' ? 'bg-green-500' :
                        category.color === 'purple' ? 'bg-purple-500' :
                        category.color === 'orange' ? 'bg-orange-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm text-white/80">{category.name}</span>
                    </div>
                    <span className="text-xs text-white/50">{category.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;