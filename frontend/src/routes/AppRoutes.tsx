import { useAllApplicationParameters } from '@/api/queries/applicationParameterQueries';
import { useAutoLogin } from '@/api/queries/authQueries';
import PrivateRoutes from '@/routes/PrivateRoutes';
import PublicRoutes from '@/routes/PublicRoutes';

import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Messages from '@/components/layout/Messages';
import Notifications from '@/components/layout/Notifications';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import Loader from '@/components/ui/Loader/Loader';

import Error from '@/features/Error';
import Admin from '@/features/admin/Admin';
import AdressBook from '@/features/adressBook/AdressBook';
import AcceptInvitation from '@/features/auth/AcceptInvitation';
import Login from '@/features/auth/Login';
import Cities from '@/features/cities/Cities';
import City from '@/features/city/City';
import Dashboard from '@/features/dashboard/Dashboard';
import Folder from '@/features/folder/Folder';
import Folders from '@/features/folders/Folders';
import Invitation from '@/features/invitation/Invitation';
import ConversationDetail from '@/features/messages/Conversation';
import MessagePage from '@/features/messages/Messages';
import NotificationsHub from '@/features/notificationsHub/NotificationsHub';
import Opportunities from '@/features/opportunities/Opportunities';
import Opportunity from '@/features/opportunity/Opportunity';
import Powerdialer from '@/features/powerdialer/Powerdialer';
import Profile from '@/features/profile/Profile';
import SearchDefinition from '@/features/searchDefinition/SearchDefinition';
import Settings from '@/features/settings/Settings';
import Agent from '@/features/showAdressBook/agent/Agent';
import CGP from '@/features/showAdressBook/cgp/CGP';
import Client from '@/features/showAdressBook/client/Client';
import Lead from '@/features/showAdressBook/lead/Lead';
import Users from '@/features/users/Users';

import { useAuthStore } from '@/stores/authStore';
import { useMessagesStore } from '@/stores/messagesStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSidebarStore } from '@/stores/sidebarStore';

const AppRoutes = () => {
    // const { isAuthenticated, user } = useAuthStore()
    // Only load application parameters after login
    const { setParameters } = useSettingsStore();
    const { user, isAuthenticated } = useAuthStore();
    const {
        data: parametersResponse,
        isLoading: isParamsLoading,
        error: paramsError,
    } = useAllApplicationParameters({ enabled: isAuthenticated });

    // Only set parameters after login
    useEffect(() => {
        if (isAuthenticated && parametersResponse?.data) {
            setParameters(parametersResponse.data);
        }
    }, [isAuthenticated, parametersResponse?.data, setParameters]);
    const { refetch: autoLogin, isPending } = useAutoLogin();
    const { isOpen: isExpanded } = useSidebarStore();
    const { isNotificationsOpen, closeNotifications } = useNotificationsStore();
    const { isMessagesOpen, closeMessages } = useMessagesStore();

    useEffect(() => {
        if (user) {
            console.log('user', user);
        }
    }, [user]);

    useEffect(() => {
        autoLogin();
    }, [autoLogin]);

    if (isPending) return <Loader />;
    if (isAuthenticated && isParamsLoading) return <Loader />;
    if (isAuthenticated && paramsError) {
        return (
            <div className="flex items-center justify-center py-8 text-red-600">
                Erreur lors du chargement des paramètres
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden">
            {isAuthenticated && <Sidebar />}
            {isAuthenticated && <Topbar />}
            {isAuthenticated && isNotificationsOpen && (
                <Notifications onClose={closeNotifications} />
            )}
            {isAuthenticated && isMessagesOpen && <Messages onClose={closeMessages} />}
            <main
                className={`min-h-[calc(100vh-10rem)] flex-1 transition-all duration-300 ${isAuthenticated ? `${isExpanded ? 'ml-80 max-w-[calc(100vw-23rem)]' : 'ml-20 max-w-[calc(100vw-5rem)]'}` : ''}`}
            >
                <Routes>
                    {/* Routes publiques */}
                    <Route element={<PublicRoutes />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                    </Route>

                    {/* Routes privées */}
                    <Route element={<PrivateRoutes />}>
                        <Route path="/folders" element={<Folders />} />
                        <Route path="/folder/:id" element={<Folder />} />
                        <Route
                            path="/folder/:id/search-definition"
                            element={<SearchDefinition />}
                        />
                        <Route path="/address-book" element={<AdressBook />} />
                        <Route path="/agent/:id" element={<Agent />} />
                        <Route path="/cgp/:id" element={<CGP />} />
                        <Route path="/client/:id" element={<Client />} />
                        <Route path="/lead/:id" element={<Lead />} />
                        <Route path="/opportunities" element={<Opportunities />} />
                        <Route path="/opportunity/:id" element={<Opportunity />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/notifications-hub" element={<NotificationsHub />} />
                        <Route path="/messages" element={<MessagePage />} />
                        <Route path="/messages/:id" element={<ConversationDetail />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/powerdialer" element={<Powerdialer />} />
                        <Route path="/cities" element={<Cities />} />
                        <Route path="/city/:id" element={<City />} />
                        <Route path="/profil" element={<Profile />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/invitation" element={<Invitation />} />
                    </Route>

                    {/* Route par défaut */}
                    {isAuthenticated && (
                        <>
                            <Route path="/" element={<Navigate to="/folders" replace />} />
                            <Route path="*" element={<Navigate to="/folders" replace />} />
                            <Route path="/error" element={<Error />} />
                        </>
                    )}
                    {!isAuthenticated && (
                        <>
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="*" element={<Navigate to="/login" replace />} />
                            <Route path="/error" element={<Error />} />
                        </>
                    )}
                </Routes>
            </main>
        </div>
    );
};

export default AppRoutes;
