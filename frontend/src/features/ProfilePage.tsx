import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCurrentAccount } from '@mysten/dapp-kit';
import {
    Activity,
    ArrowLeft,
    Award,
    Bell,
    Calendar,
    Camera,
    Edit3,
    Mail,
    MapPin,
    Moon,
    Phone,
    Save,
    Settings,
    Shield,
    Sparkles,
    Sun,
    User,
    Wallet,
    X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

const ProfilePage = () => {
    const navigate = useNavigate();
    const currentAccount = useCurrentAccount();
    const { user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        firstName: user?.firstName || 'John',
        lastName: user?.lastName || 'Doe',
        email: user?.email || 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Passionate about blockchain technology and decentralized applications. Love attending hackathons and building innovative solutions.',
        location: 'Lausanne, Switzerland',
        website: 'https://johndoe.dev',
        twitter: '@johndoe',
    });

    // Mock user stats
    const userStats = [
        {
            title: 'Events Attended',
            value: '24',
            change: '+3 this month',
            color: 'purple',
            icon: Calendar,
        },
        {
            title: 'Events Created',
            value: '8',
            change: '+2 this month',
            color: 'blue',
            icon: Award,
        },
        {
            title: 'Network Size',
            value: '156',
            change: '+12 connections',
            color: 'green',
            icon: Activity,
        },
        {
            title: 'SUI Balance',
            value: '1,234.56',
            change: 'SUI',
            color: 'orange',
            icon: Wallet,
        },
    ];

    const handleSave = () => {
        // Here you would typically save to your backend
        console.log('Saving profile:', editedProfile);
        setIsEditing(false);
        // You could also update the auth store here
    };

    const handleCancel = () => {
        // Reset to original values
        setEditedProfile({
            firstName: user?.firstName || 'John',
            lastName: user?.lastName || 'Doe',
            email: user?.email || 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            bio: 'Passionate about blockchain technology and decentralized applications. Love attending hackathons and building innovative solutions.',
            location: 'Lausanne, Switzerland',
            website: 'https://johndoe.dev',
            twitter: '@johndoe',
        });
        setIsEditing(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setEditedProfile((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Background pattern and glow effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-900/30 via-cyan-900/20 to-transparent" />

            {/* Top Navigation */}
            <nav className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex h-16 items-center justify-between">
                        {/* Left side - Navigation */}
                        <div className="flex items-center space-x-8">
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/dashboard')}
                                className="text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>

                            <div className="flex items-center space-x-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold text-white">Hack'n'Sui</span>
                            </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center space-x-4">
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

                            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="mb-3 text-4xl font-light tracking-tight text-white">
                        My Profile
                    </h1>
                    <p className="text-lg font-light text-gray-400">
                        Manage your account information and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
                            {/* Profile Picture */}
                            <div className="relative mb-6">
                                <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-4xl font-bold text-white">
                                    {editedProfile.firstName.charAt(0)}
                                    {editedProfile.lastName.charAt(0)}
                                </div>
                                <button className="absolute bottom-2 right-1/2 translate-x-1/2 translate-y-1/2 transform rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600">
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Basic Info */}
                            <div className="mb-6 text-center">
                                <h2 className="mb-1 text-2xl font-semibold text-white">
                                    {editedProfile.firstName} {editedProfile.lastName}
                                </h2>
                                <p className="mb-2 text-gray-300">{editedProfile.email}</p>
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                                    <MapPin className="h-4 w-4" />
                                    <span>{editedProfile.location}</span>
                                </div>
                            </div>

                            {/* Wallet Info */}
                            {currentAccount && (
                                <div className="mb-6 rounded-xl bg-white/5 p-4">
                                    <h3 className="mb-2 flex items-center font-medium text-white">
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Connected Wallet
                                    </h3>
                                    <p className="break-all font-mono text-sm text-gray-300">
                                        {currentAccount.address}
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {!isEditing ? (
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-cyan-500"
                                    >
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <div className="space-y-2">
                                        <Button
                                            onClick={handleSave}
                                            className="w-full rounded-xl bg-green-500 font-semibold text-white transition-all duration-300 hover:bg-green-600"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </Button>
                                        <Button
                                            onClick={handleCancel}
                                            variant="outline"
                                            className="w-full rounded-xl border-white/20 text-gray-300 transition-all duration-300 hover:border-white/30 hover:bg-white/10"
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </div>
                                )}

                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl border-white/20 text-gray-300 transition-all duration-300 hover:border-white/30 hover:bg-white/10"
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Account Settings
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details & Stats */}
                    <div className="space-y-8 lg:col-span-2">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {userStats.map((stat, index) => {
                                const IconComponent = stat.icon;
                                return (
                                    <div
                                        key={index}
                                        className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10"
                                    >
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-300">
                                                {stat.title}
                                            </h3>
                                            <IconComponent
                                                className={`h-5 w-5 ${
                                                    stat.color === 'purple'
                                                        ? 'text-purple-400'
                                                        : stat.color === 'blue'
                                                          ? 'text-blue-400'
                                                          : stat.color === 'green'
                                                            ? 'text-green-400'
                                                            : 'text-orange-400'
                                                }`}
                                            />
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <span className="text-3xl font-light text-white">
                                                {stat.value}
                                            </span>
                                            <span className="text-sm font-medium text-cyan-400">
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Personal Information */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                            <h3 className="mb-6 flex items-center text-2xl font-light text-white">
                                <User className="mr-3 h-6 w-6" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* First Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        First Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.firstName}
                                            onChange={(e) =>
                                                handleInputChange('firstName', e.target.value)
                                            }
                                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="rounded-xl bg-white/5 px-4 py-3 text-white">
                                            {editedProfile.firstName}
                                        </p>
                                    )}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Last Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.lastName}
                                            onChange={(e) =>
                                                handleInputChange('lastName', e.target.value)
                                            }
                                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="rounded-xl bg-white/5 px-4 py-3 text-white">
                                            {editedProfile.lastName}
                                        </p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedProfile.email}
                                            onChange={(e) =>
                                                handleInputChange('email', e.target.value)
                                            }
                                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="flex items-center rounded-xl bg-white/5 px-4 py-3 text-white">
                                            <Mail className="mr-2 h-4 w-4 text-gray-400" />
                                            {editedProfile.email}
                                        </p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editedProfile.phone}
                                            onChange={(e) =>
                                                handleInputChange('phone', e.target.value)
                                            }
                                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="flex items-center rounded-xl bg-white/5 px-4 py-3 text-white">
                                            <Phone className="mr-2 h-4 w-4 text-gray-400" />
                                            {editedProfile.phone}
                                        </p>
                                    )}
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Location
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedProfile.location}
                                            onChange={(e) =>
                                                handleInputChange('location', e.target.value)
                                            }
                                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="flex items-center rounded-xl bg-white/5 px-4 py-3 text-white">
                                            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                                            {editedProfile.location}
                                        </p>
                                    )}
                                </div>

                                {/* Website */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Website
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="url"
                                            value={editedProfile.website}
                                            onChange={(e) =>
                                                handleInputChange('website', e.target.value)
                                            }
                                            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <p className="rounded-xl bg-white/5 px-4 py-3 text-white">
                                            <a
                                                href={editedProfile.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 transition-colors hover:text-blue-300"
                                            >
                                                {editedProfile.website}
                                            </a>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mt-6">
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Bio
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={editedProfile.bio}
                                        onChange={(e) => handleInputChange('bio', e.target.value)}
                                        rows={4}
                                        className="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tell us about yourself..."
                                    />
                                ) : (
                                    <p className="rounded-xl bg-white/5 px-4 py-3 leading-relaxed text-white">
                                        {editedProfile.bio}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                            <h3 className="mb-6 flex items-center text-2xl font-light text-white">
                                <Shield className="mr-3 h-6 w-6" />
                                Security & Privacy
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                                    <div>
                                        <h4 className="font-medium text-white">
                                            Two-Factor Authentication
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            Add an extra layer of security to your account
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-white/20 text-gray-300 hover:border-white/30 hover:bg-white/10"
                                    >
                                        Enable
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                                    <div>
                                        <h4 className="font-medium text-white">Login Activity</h4>
                                        <p className="text-sm text-gray-400">
                                            View your recent login history
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-white/20 text-gray-300 hover:border-white/30 hover:bg-white/10"
                                    >
                                        View
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                                    <div>
                                        <h4 className="font-medium text-white">Privacy Settings</h4>
                                        <p className="text-sm text-gray-400">
                                            Control who can see your profile information
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="border-white/20 text-gray-300 hover:border-white/30 hover:bg-white/10"
                                    >
                                        Manage
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
        </div>
    );
};

export default ProfilePage;
