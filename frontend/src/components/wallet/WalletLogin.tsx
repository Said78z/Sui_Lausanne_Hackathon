import React from 'react';

import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { type AuthProvider, type EnokiWallet, isEnokiWallet } from '@mysten/enoki';

import { Button } from '@/components/ui/button';

interface WalletLoginProps {
    onSuccess?: () => void;
    className?: string;
    showGoogle?: boolean;
    showFacebook?: boolean;
    showTwitch?: boolean;
}

export const WalletLogin: React.FC<WalletLoginProps> = ({
    onSuccess,
    className = '',
    showGoogle = true,
    showFacebook = false,
    showTwitch = false,
}) => {
    const currentAccount = useCurrentAccount();
    const { mutate: connect } = useConnectWallet();

    const wallets = useWallets().filter(isEnokiWallet);
    const walletsByProvider = wallets.reduce(
        (map, wallet) => map.set(wallet.provider, wallet),
        new Map<AuthProvider, EnokiWallet>()
    );

    const googleWallet = walletsByProvider.get('google');
    const facebookWallet = walletsByProvider.get('facebook');
    const twitchWallet = walletsByProvider.get('twitch');

    const handleConnect = (wallet: EnokiWallet) => {
        connect(
            { wallet },
            {
                onSuccess: () => {
                    onSuccess?.();
                },
            }
        );
    };

    // If already connected, don't show login buttons
    if (currentAccount) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            {showGoogle && googleWallet && (
                <Button
                    onClick={() => handleConnect(googleWallet)}
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                    variant="default"
                >
                    Sign in with Google
                </Button>
            )}

            {showFacebook && facebookWallet && (
                <Button
                    onClick={() => handleConnect(facebookWallet)}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    variant="default"
                >
                    Sign in with Facebook
                </Button>
            )}

            {showTwitch && twitchWallet && (
                <Button
                    onClick={() => handleConnect(twitchWallet)}
                    className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    variant="default"
                >
                    Sign in with Twitch
                </Button>
            )}
        </div>
    );
};
