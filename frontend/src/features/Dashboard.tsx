import { Button } from '@/components/ui/button';
import { Navbar } from '@/components';
import { useNavigate } from 'react-router-dom';
import { 
    QrCode, 
    Plus, 
    ArrowUpRight,
    MapPin,
    Users,
    BarChart3
} from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();

    // Sample data with Luma-style structure
    const quickStats = [
        { 
            title: 'Total Events', 
            value: '24', 
            change: '+12%', 
            trend: 'up',
            color: 'purple'
        },
        { 
            title: 'Active Users', 
            value: '1,234', 
            change: '+8%', 
            trend: 'up',
            color: 'green'
        },
        { 
            title: 'This Month', 
            value: '89', 
            change: '+23%', 
            trend: 'up',
            color: 'orange'
        },
        { 
            title: 'Revenue', 
            value: '$12.4k', 
            change: '+15%', 
            trend: 'up',
            color: 'blue'
        }
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
            image: '/api/placeholder/80/60'
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
            image: '/api/placeholder/80/60'
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
            image: '/api/placeholder/80/60'
        },
        {
            id: 4,
            title: 'NASA Space Apps Challenge - Paris 2025',
            description: 'École Supérieure d\'Informatique',
            time: '4 Oct, 9:00',
            status: 'Going',
            attendees: '892',
            priority: 'high',
            category: 'Competition',
            image: '/api/placeholder/80/60'
        }
    ];

    const categories = [
        { name: 'Tech', count: '3K Events', icon: '💻', color: 'purple' },
        { name: 'Food & Drink', count: '134 Events', icon: '🍽️', color: 'orange' },
        { name: 'AI', count: '2K Events', icon: '🤖', color: 'blue' },
        { name: 'Arts & Culture', count: '1K Events', icon: '🎨', color: 'green' },
        { name: 'Climate', count: '822 Events', icon: '🌱', color: 'emerald' },
        { name: 'Fitness', count: '947 Events', icon: '💪', color: 'red' }
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
            red: 'bg-red-500/10 text-red-400 border-red-500/20'
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
            {/* Background pattern and glow effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-100/50 via-cyan-100/30 to-transparent dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-transparent pointer-events-none" />
            
            {/* Navbar */}
            <Navbar variant="dashboard" currentPage="dashboard" />

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-3 tracking-tight">
                        Events
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg font-light">
                        Manage and discover amazing events in your area
                    </p>
                    
                    {/* Toggle */}
                    <div className="flex items-center space-x-1 mt-6">
                        <button className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium">
                            Upcoming
                        </button>
                        <button className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            Past
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {quickStats.map((stat, index) => (
                        <div 
                            key={index}
                            className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group hover:scale-105 shadow-sm dark:shadow-none"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-gray-600 dark:text-gray-300 font-medium text-sm">{stat.title}</h3>
                                <div className={`w-2 h-2 rounded-full ${
                                    stat.color === 'purple' ? 'bg-purple-400' :
                                    stat.color === 'green' ? 'bg-green-400' :
                                    stat.color === 'orange' ? 'bg-orange-400' :
                                    'bg-blue-400'
                                }`} />
                            </div>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-light text-gray-900 dark:text-white">{stat.value}</span>
                                <span className="text-cyan-600 dark:text-cyan-400 text-sm font-medium">{stat.change}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Timeline - Events List */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-2">Upcoming Events</h2>
                            <p className="text-gray-600 dark:text-gray-400">Don't miss these important dates</p>
                        </div>
                        
                        <div className="space-y-8">
                            {upcomingEvents.map((event, index) => (
                                <div key={event.id} className="flex">
                                    {/* Timeline Date */}
                                    <div className="flex-shrink-0 w-24 mr-8">
                                        <div className="text-right">
                                            <div className="text-gray-900 dark:text-white font-medium text-sm">
                                                {event.time.split(',')[0]}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-500 text-xs">
                                                {event.time.split(',')[1]?.trim() || ''}
                                            </div>
                                        </div>
                                        {index < upcomingEvents.length - 1 && (
                                            <div className="w-px h-16 bg-gray-300 dark:bg-gray-700 ml-auto mt-4"></div>
                                        )}
                                    </div>
                                    
                                    {/* Event Card */}
                                    <div className="flex-1 bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 group hover:scale-[1.02] shadow-sm dark:shadow-none">
                                        <div className="flex items-start space-x-4">
                                            {/* Event Image */}
                                            <div className="w-20 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex-shrink-0 flex items-center justify-center">
                                                <span className="text-2xl">{event.category === 'Tech' ? '💻' : event.category === 'Conference' ? '🎤' : event.category === 'Networking' ? '🤝' : '🚀'}</span>
                                            </div>
                                            
                                            {/* Event Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                                                        {event.title}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-300 text-sm mb-3">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{event.description}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        <span className="text-gray-600 dark:text-gray-300 text-sm">{event.attendees}</span>
                                                        <span className="text-gray-500">•</span>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category === 'Tech' ? 'blue' : event.category === 'Conference' ? 'purple' : 'cyan')}`}>
                                                            {event.category}
                                                        </span>
                                                    </div>
                                                    <ArrowUpRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
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
                            <h3 className="text-xl font-light text-gray-900 dark:text-white mb-6">Browse by Category</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {categories.map((category) => (
                                    <div 
                                        key={category.name}
                                        className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4 hover:bg-white dark:hover:bg-white/10 transition-all duration-300 cursor-pointer group hover:scale-105 shadow-sm dark:shadow-none"
                                    >
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="text-lg">{category.icon}</span>
                                            <span className="text-gray-900 dark:text-white font-medium text-sm">{category.name}</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-xs">{category.count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-xl font-light text-gray-900 dark:text-white mb-6">Quick Actions</h3>
                            <div className="space-y-3">
                                <Button 
                                    onClick={() => navigate('/dashboard/create-event')}
                                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-0 rounded-xl h-14 font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25 text-lg"
                                >
                                    <Plus className="h-6 w-6 mr-3" />
                                    Create Event
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start h-12 font-medium rounded-xl transition-all duration-300 hover:scale-[1.01] border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/30"
                                >
                                    <QrCode className="h-5 w-5 mr-3" />
                                    Scan QR Code
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start h-12 font-medium rounded-xl transition-all duration-300 hover:scale-[1.01] border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:border-gray-400 dark:hover:border-white/30"
                                >
                                    <BarChart3 className="h-5 w-5 mr-3" />
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