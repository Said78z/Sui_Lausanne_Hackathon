'use client';

import CFPLogo from '@/assets/brand/cfp-logo-horizontal-fond-noir.svg';
import CFPLogoReductible from '@/assets/brand/cfp-logo-reductible-couleur-fond-noir.svg';

import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { AnimatePresence, motion } from 'framer-motion';
import {
    Building2,
    ChevronLeft,
    FolderOpen,
    LayoutDashboard,
    LockKeyhole,
    LogOut,
    Mail,
    Map,
    MessageCircle,
    NotebookTabs,
    ScanSearch,
    Settings,
    User2,
} from 'lucide-react';

import { useSidebarStore } from '@/stores/sidebarStore';

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

export default function Sidebar() {
    const { t } = useTranslation();
    const { isOpen: isExpanded, toggleSidebar } = useSidebarStore();
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const navigate = useNavigate();

    // Définition des sections du menu
    const sections: SidebarSection[] = [
        {
            title: t('sidebar.sections.index.title'),
            items: [
                {
                    icon: <FolderOpen size={20} />,
                    label: t('sidebar.sections.index.items.folders'),
                    href: '/folders',
                },
                {
                    icon: <NotebookTabs size={20} />,
                    label: t('sidebar.sections.index.items.addressBook'),
                    href: '/address-book',
                },
                {
                    icon: <Building2 size={20} />,
                    label: t('sidebar.sections.index.items.opportunities'),
                    href: '/opportunities',
                },
            ],
        },
        {
            title: t('sidebar.sections.tools.title'),
            items: [
                {
                    icon: <LayoutDashboard size={20} />,
                    label: t('sidebar.sections.tools.items.dashboard'),
                    href: '/dashboard',
                },
                {
                    icon: <User2 size={20} />,
                    label: t('sidebar.sections.tools.items.users'),
                    href: '/users',
                },
                {
                    icon: <ScanSearch size={20} />,
                    label: t('sidebar.sections.tools.items.powerdialer'),
                    href: '/powerdialer',
                },
                {
                    icon: <Map size={20} />,
                    label: t('sidebar.sections.tools.items.cities'),
                    href: '/cities',
                },
            ],
        },
        {
            title: t('sidebar.sections.management.title'),
            items: [
                {
                    icon: <Settings size={20} />,
                    label: t('sidebar.sections.management.items.settings'),
                    href: '/profil',
                },
                {
                    icon: <Mail size={20} />,
                    label: t('sidebar.sections.management.items.invitations'),
                    href: '/invitation',
                },
                {
                    icon: <MessageCircle size={20} />,
                    // label: t('sidebar.sections.management.items.messages'),
                    label: 'Messages',
                    href: '/messages',
                },
            ],
        },
        {
            title: t('sidebar.sections.administration.title'),
            items: [
                {
                    icon: <LockKeyhole size={20} />,
                    label: t('sidebar.sections.administration.items.admin'),
                    href: '/admin',
                },
                {
                    icon: <Settings size={20} />,
                    label: t('sidebar.sections.administration.items.settings'),
                    href: '/settings',
                },
            ],
        },
    ];

    // Élément de déconnexion séparé
    const logoutItem: SidebarItem = {
        icon: <LogOut size={20} />,
        label: t('sidebar.logout'),
        href: '#',
    };

    const isActive = (href: string) => {
        if (href === '/folders') {
            return currentPath === href || currentPath.startsWith('/folder/');
        }
        if (href === '/dashboard') {
            return currentPath === href || currentPath.startsWith('/notifications-hub');
        }
        if (href === '/cities') {
            return currentPath === href || currentPath.startsWith('/city/');
        }
        if (href === '/address-book') {
            return (
                currentPath === href ||
                currentPath.startsWith('/client/') ||
                currentPath.startsWith('/agent/') ||
                currentPath.startsWith('/lead/') ||
                currentPath.startsWith('/cgp/')
            );
        }
        if (href === '/opportunities') {
            return currentPath === href || currentPath.startsWith('/opportunity/');
        }
        if (href === '/messages') {
            return currentPath === href || currentPath.startsWith('/messages/');
        }
        return currentPath === href;
    };

    // Fonction de rendu d'un élément de la sidebar
    const renderSidebarItem = (item: SidebarItem) => (
        <a
            key={item.label}
            onClick={() => navigate(item.href)}
            className={`group relative flex cursor-pointer items-center gap-4 rounded-lg px-3 py-2.5 transition-colors ${
                isActive(item.href) ? 'text-blue-400' : 'text-white hover:bg-white/10'
            }`}
        >
            <AnimatePresence mode="wait">
                {isActive(item.href) && (
                    <motion.div
                        layoutId="activeBackground"
                        className="absolute inset-0 rounded-lg bg-white/10"
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            <motion.span
                animate={{
                    color: isActive(item.href) ? '#60a5fa' : 'currentColor',
                }}
                transition={{ duration: 0.2 }}
                className="relative z-10 flex-shrink-0"
            >
                {item.icon}
            </motion.span>

            <AnimatePresence>
                {isExpanded && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            color: isActive(item.href) ? '#3FA2FF' : 'currentColor',
                        }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="relative z-10 whitespace-nowrap text-sm"
                    >
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </a>
    );

    return (
        <div
            className={`fixed left-0 top-0 z-50 flex h-screen flex-col bg-gradient-to-b from-primary to-tertiary p-4 pl-3 text-white transition-all duration-300 ${isExpanded ? 'w-72' : 'w-20'}`}
        >
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-8 rounded-full bg-secondary p-1.5 text-white transition-colors hover:bg-blue-700"
            >
                <motion.div
                    animate={{ rotate: isExpanded ? 0 : 180 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronLeft size={16} />
                </motion.div>
            </button>

            {/* Profile Section */}
            <div className="mb-8 mt-4 flex items-center justify-center gap-4">
                <img
                    src={isExpanded ? CFPLogo : CFPLogoReductible}
                    alt="Logo"
                    className={`${isExpanded ? 'w-4/6' : 'w-1/2'}`}
                />
            </div>

            {/* Navigation Items */}
            <nav className="relative flex flex-1 flex-col justify-between overflow-y-auto">
                {/* Sections principales */}
                <div className="relative flex flex-col space-y-6">
                    {sections.map((section) => (
                        <div key={section.title}>
                            {isExpanded ? (
                                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                    {section.title}
                                </h3>
                            ) : (
                                <div className="my-2 h-px w-full bg-gray-700"></div>
                            )}

                            {section.items.map((item) => renderSidebarItem(item))}
                        </div>
                    ))}
                </div>

                {/* Section déconnexion (toujours en bas) */}
                <div className="mt-auto overflow-hidden border-t border-gray-700/50 pt-4">
                    {renderSidebarItem(logoutItem)}
                </div>
            </nav>
        </div>
    );
}
