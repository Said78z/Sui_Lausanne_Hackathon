import { Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';

const PublicRoutes = () => {
    const { isAuthenticated } = useAuthStore();

    return !isAuthenticated ? <Outlet /> : <Navigate to="/folders" replace />;
};

export default PublicRoutes;
