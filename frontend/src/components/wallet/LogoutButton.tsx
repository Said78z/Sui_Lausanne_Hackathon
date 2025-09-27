import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

import { Button } from '@/components/ui/button';

interface LogoutButtonProps {
    className?: string;
    redirectTo?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
    className = '',
    redirectTo = '/login',
    variant = 'outline',
}) => {
    const account = useCurrentAccount();
    const disconnectWallet = useDisconnectWallet();
    const navigate = useNavigate();

    const handleLogout = () => {
        disconnectWallet.mutate();
        navigate(redirectTo);
    };

    if (!account) return null;

    return (
        <Button onClick={handleLogout} variant={variant} className={className}>
            Logout
        </Button>
    );
};
