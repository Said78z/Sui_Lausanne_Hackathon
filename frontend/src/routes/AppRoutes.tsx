import PrivateRoutes from '@/routes/PrivateRoutes';
import PublicRoutes from '@/routes/PublicRoutes';

import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Error from '@/features/Error';
import LandingPage from '@/features/LandingPage';
import LoginPage from '@/features/LoginPage';
import RegisterPage from '@/features/RegisterPage';

import { useAuthStore } from '@/stores/authStore';

const AppRoutes = () => {
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (user) {
            console.log('user', user);
        }
    }, [user]);

    // Remove this error condition - let the routes handle authentication properly

    return (
        <div className="min-h-screen">
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
        </div>
    );
};

export default AppRoutes;
