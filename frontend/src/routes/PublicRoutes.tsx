import { Navigate, Outlet } from 'react-router-dom';

const PublicRoutes = () => {
    // const { isAuthenticated } = useAuthStore();
    const isAuthenticated = false;

    return !isAuthenticated ? <Outlet /> : <Navigate to="/folders" replace />;
};

export default PublicRoutes;
