import PrivateRoutes from '@/routes/PrivateRoutes';
import PublicRoutes from '@/routes/PublicRoutes';

import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Error from '@/features/Error';
import LandingPage from '@/features/LandingPage';
import LoginPage from '@/features/LoginPage';
import RegisterPage from '@/features/RegisterPage';

import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSidebarStore } from '@/stores/sidebarStore';

const AppRoutes = () => {
    // const { isAuthenticated, user } = useAuthStore()
    // Only load application parameters after login
    const { setParameters } = useSettingsStore();
    const { user, isAuthenticated } = useAuthStore();

    const { isOpen: isExpanded } = useSidebarStore();

    useEffect(() => {
        if (user) {
            console.log('user', user);
        }
    }, [user]);

    if (isAuthenticated) {
        return (
            <div className="flex items-center justify-center py-8 text-red-600">
                Erreur lors du chargement des paramètres
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden">
            <main
                className={`min-h-[calc(100vh-10rem)] flex-1 transition-all duration-300 ${isAuthenticated ? `${isExpanded ? 'ml-80 max-w-[calc(100vw-23rem)]' : 'ml-20 max-w-[calc(100vw-5rem)]'}` : ''}`}
            >
                <Routes>
                    {/* Routes publiques */}
                    <Route element={<PublicRoutes />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                    </Route>

                    {/* Routes privées */}
                    <Route path="/dashboard/*" element={<PrivateRoutes />} />

                    {/* Route par défaut */}
                    {isAuthenticated && (
                        <>
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/error" element={<Error />} />
                        </>
                    )}
                    {!isAuthenticated && (
                        <>
                            <Route path="*" element={<Navigate to="/" replace />} />
                            <Route path="/error" element={<Error />} />
                        </>
                    )}
                </Routes>
            </main>
        </div>
    );
};

export default AppRoutes;
