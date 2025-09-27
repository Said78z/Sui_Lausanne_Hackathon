import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuthStore } from '@/stores/authStore';
import Dashboard from '@/features/Dashboard';
import CreateEvent from '@/features/CreateEvent';

const PrivateRoutes = () => {
    // const { isAuthenticated } = useAuthStore();
    const isAuthenticated = true;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/*" element={<Dashboard />} />
            {/* Add other private routes here as they're developed */}
        </Routes>
    );
};

export default PrivateRoutes;
