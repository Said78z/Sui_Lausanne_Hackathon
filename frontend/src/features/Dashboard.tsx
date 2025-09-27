import { useState } from 'react';
import { 
    LayoutDashboard, 
    Calendar, 
    Users, 
    Trophy, 
    FolderOpen, 
    Settings, 
    Bell, 
    Search,
    Plus,
    BarChart3,
    Zap,
    Shield,
    QrCode,
    Award,
    Coins,
    ChevronRight,
    Activity,
    TrendingUp,
    Clock,
    Star,
    Menu,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigationItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, color: 'text-blue-400' },
        { id: 'events', label: 'Events', icon: Calendar, color: 'text-green-400' },
        { id: 'teams', label: 'Teams', icon: Users, color: 'text-purple-400' },
        { id: 'projects', label: 'Projects', icon: FolderOpen, color: 'text-orange-400' },
        { id: 'competitions', label: 'Competitions', icon: Trophy, color: 'text-yellow-400' },
        { id: 'rewards', label: 'Rewards', icon: Coins, color: 'text-emerald-400' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-cyan-400' },
        { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-400' },
    ];

    const quickStats = [
        { label: 'Active Events', value: '12', change: '+3', icon: Calendar, color: 'bg-blue-500' },
        { label: 'Total Teams', value: '248', change: '+15', icon: Users, color: 'bg-green-500' },
        { label: 'Projects Submitted', value: '89', change: '+7', icon: FolderOpen, color: 'bg-purple-500' },
        { label: 'Rewards Distributed', value: '1.2M SUI', change: '+120K', icon: Coins, color: 'bg-yellow-500' },
    ];

    const recentActivities = [
        { type: 'event', message: 'New hackathon "DeFi Innovation" started', time: '2 hours ago', icon: Calendar },
        { type: 'team', message: 'Team "Blockchain Builders" joined event', time: '4 hours ago', icon: Users },
        { type: 'project', message: 'Project "SuiSwap V2" submitted', time: '6 hours ago', icon: FolderOpen },
        { type: 'reward', message: '50,000 SUI distributed to winners', time: '1 day ago', icon: Coins },
    ];

    const upcomingEvents = [
        { name: 'DeFi Innovation Challenge', date: 'Dec 15, 2024', participants: 45, prize: '100K SUI' },
        { name: 'NFT Marketplace Hackathon', date: 'Dec 20, 2024', participants: 32, prize: '75K SUI' },
        { name: 'Gaming on Sui', date: 'Jan 5, 2025', participants: 28, prize: '150K SUI' },
    ];

    const renderOverview = () => (
        <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {quickStats.map((stat, index) => (
                    <div 
                        key={index} 
                        className="p-6 rounded-lg border border-slate-600 hover:border-slate-500 transition-all duration-300 hover:scale-105"
                        style={{
                            background: 'rgba(30, 41, 59, 0.8)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-300">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-xs text-green-400 mt-2">{stat.change} this week</p>
                            </div>
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color.replace('bg-', 'text-').replace('-500', '-400')}`}>
                                <stat.icon className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Recent Activities */}
          <div 
            className="p-6 rounded-lg border border-slate-600"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                <Activity className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">New team registered</p>
                  <p className="text-xs text-slate-400">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                <FolderOpen className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-sm font-medium text-white">Project submitted</p>
                  <p className="text-xs text-slate-400">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                <Award className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Reward distributed</p>
                  <p className="text-xs text-slate-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div 
            className="p-6 rounded-lg border border-slate-600"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                <Clock className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-white">Hackathon Finals</p>
                  <p className="text-xs text-slate-400">Tomorrow at 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                <Calendar className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">Team Building Workshop</p>
                  <p className="text-xs text-slate-400">Friday at 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors duration-200">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-white">Awards Ceremony</p>
                  <p className="text-xs text-slate-400">Next Monday at 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

            {/* Performance Metrics */}
            <div 
              className="rounded-2xl p-6 border border-slate-600"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
                <h3 className="text-xl font-semibold text-white mb-6">Platform Performance</h3>
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="text-center">
                        <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400">
                            <Activity className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-2">Platform Uptime</h4>
                        <p className="text-2xl font-bold text-blue-400">99.9%</p>
                        <p className="text-slate-400 text-sm">Last 30 days</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-400">
                            <TrendingUp className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-2">User Growth</h4>
                        <p className="text-2xl font-bold text-green-400">+24%</p>
                        <p className="text-slate-400 text-sm">This month</p>
                    </div>
                    
                    <div className="text-center">
                        <div className="mb-4 flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-400">
                            <Star className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="font-semibold text-white mb-2">Satisfaction</h4>
                        <p className="text-2xl font-bold text-purple-400">4.8/5</p>
                        <p className="text-slate-400 text-sm">User rating</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPlaceholder = (title: string, description: string, icon: any) => (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20">
                    {icon && <icon className="h-10 w-10 text-blue-400" />}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-400 mb-6 max-w-md">{description}</p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Coming Soon
                </Button>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return renderOverview();
            case 'events':
                return renderPlaceholder('Event Management', 'Create, manage, and track hackathon events with ease. Set up registration, manage participants, and monitor progress.', Calendar);
            case 'teams':
                return renderPlaceholder('Team Management', 'Facilitate team formation, manage team members, and track team progress throughout events.', Users);
            case 'projects':
                return renderPlaceholder('Project Hub', 'Centralized space for project submissions, reviews, and collaboration tools.', FolderOpen);
            case 'competitions':
                return renderPlaceholder('Competition Center', 'Manage competitions, judging criteria, and leaderboards for fair and transparent evaluation.', Trophy);
            case 'rewards':
                return renderPlaceholder('Reward System', 'Distribute rewards, manage prize pools, and track token distributions on the Sui blockchain.', Coins);
            case 'analytics':
                return renderPlaceholder('Analytics Dashboard', 'Comprehensive analytics and insights about platform usage, event performance, and user engagement.', BarChart3);
            case 'settings':
                return renderPlaceholder('Platform Settings', 'Configure platform settings, manage user permissions, and customize your hackathon experience.', Settings);
            default:
                return renderOverview();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        }}>
            <div className="flex">


                {/* Sidebar */}
                <div 
                    className={`
                        fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-screen border-r border-slate-700
                        transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    style={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                    }}
                >
                    <div className="p-6">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Hack'n'sui</h1>
                                <p className="text-xs text-gray-400">Dashboard V1</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full rounded-lg bg-white/5 py-2 pl-10 pr-4 text-white placeholder-gray-400 ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-2">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveSection(item.id);
                                        setSidebarOpen(false); // Close sidebar on mobile when item is selected
                                    }}
                                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                                        activeSection === item.id
                                            ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <item.icon className={`h-5 w-5 ${activeSection === item.id ? item.color : ''}`} />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="flex-1">
                    {/* Header */}
                    <header 
                        className="border-b border-slate-700 sticky top-0 z-30"
                        style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)'
                        }}
                    >
                        <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
                            {/* Left side - Mobile menu + Title */}
                            <div className="flex items-center space-x-3">
                                {/* Mobile menu button - integrated into header */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                                >
                                    {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                                </Button>
                                
                                {/* Title section - more compact on mobile */}
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-lg lg:text-2xl font-bold text-white truncate">
                                        {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                                    </h2>
                                    <p className="text-xs lg:text-sm text-slate-400 hidden sm:block">
                                        {activeSection === 'overview' 
                                            ? 'Welcome to your hackathon management hub' 
                                            : `Manage your ${activeSection} efficiently`
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            {/* Right side - Actions */}
                            <div className="flex items-center space-x-2 lg:space-x-4">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg"
                                >
                                    <Bell className="h-5 w-5" />
                                </Button>
                                <Button 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm lg:text-base px-3 lg:px-4 py-2 rounded-lg"
                                >
                                    <Plus className="h-4 w-4 lg:mr-2" />
                                    <span className="hidden lg:inline">Quick Action</span>
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="p-3 sm:p-4 lg:p-8">
                        <div className="animate-in fade-in-50 duration-500">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;