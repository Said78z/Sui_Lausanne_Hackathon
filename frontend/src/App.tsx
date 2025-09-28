import AppRoutes from '@/routes/AppRoutes';

import { useEffect } from 'react';

import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';
// Import dapp-kit styles
import '@mysten/dapp-kit/dist/index.css';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { RegisterEnokiWallets } from '@/components/wallet';

import { useAuthStore } from '@/stores/authStore';

const { networkConfig } = createNetworkConfig({
    testnet: { url: getFullnodeUrl('testnet') },
    mainnet: { url: getFullnodeUrl('mainnet') },
    devnet: { url: getFullnodeUrl('devnet') },
});

const queryClient = new QueryClient();

function App() {
    const { initializeAuth } = useAuthStore();

    // Initialize auth state from cookies on app startup
    useEffect(() => {
        console.log('App: Initializing authentication...');
        initializeAuth();
    }, [initializeAuth]);

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
                <RegisterEnokiWallets />
                <WalletProvider autoConnect>
                    <AppRoutes />
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    );
}

export default App;
