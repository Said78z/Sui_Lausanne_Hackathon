import { Navigate, Route, Routes } from 'react-router-dom';

import Calendar from '@/features/Calendar';
import CreateEvent from '@/features/CreateEvent';
import Dashboard from '@/features/Dashboard';
import ProfilePage from '@/features/ProfilePage';

import { useAuthStore } from '@/stores/authStore';

const PrivateRoutes = () => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/*" element={<Dashboard />} />
            {/* Add other private routes here as they're developed */}
        </Routes>
    );
};

export default PrivateRoutes;
