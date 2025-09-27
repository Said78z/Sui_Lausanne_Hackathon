import { useEffect } from 'react';

import { useSuiClientContext } from '@mysten/dapp-kit';
import { registerEnokiWallets } from '@mysten/enoki';

export const RegisterEnokiWallets: React.FC = () => {
    const { client, network } = useSuiClientContext();

    useEffect(() => {
        // Force registration even if network check fails
        if (!import.meta.env.VITE_ENOKI_API_KEY || !import.meta.env.VITE_GOOGLE_CLIENT_ID) {
            console.warn('Missing Enoki environment variables');
            return;
        }

        console.log('Registering Enoki wallets...', { network: network?.name });

        const { unregister } = registerEnokiWallets({
            apiKey: import.meta.env.VITE_ENOKI_API_KEY,
            providers: {
                google: {
                    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                },
                facebook: {
                    clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID,
                },
                twitch: {
                    clientId: import.meta.env.VITE_TWITCH_CLIENT_ID,
                },
            },
            client,
            network,
        });

        console.log('Enoki wallets registered successfully');
        return unregister;
    }, [client, network]);

    return null;
};
