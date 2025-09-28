import { enokiAuthService } from '@/api/enokiAuthService';

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { isEnokiWallet } from '@mysten/enoki';
import Cookies from 'js-cookie';
import { ArrowLeft, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useAuthStore } from '@/stores/authStore';

// Function to check for JWT token in URL (after OAuth redirect)
function checkForJWTInURL(): string | null {
    try {
        // Check if we're on a redirect URL with JWT token
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));

        // Check for id_token in URL parameters (common OAuth pattern)
        const idToken = urlParams.get('id_token') || hashParams.get('id_token');
        if (idToken) {
            console.log('Found JWT token in URL parameters');
            return idToken;
        }

        // Check for access_token
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        if (accessToken) {
            console.log('Found access token in URL parameters');
            return accessToken;
        }

        return null;
    } catch (error) {
        console.error('Error checking URL for JWT:', error);
        return null;
    }
}

// Function to decode JWT and extract user information
function decodeJWT(token: string): any {
    try {
        // JWT has 3 parts separated by dots: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid JWT format');
            return null;
        }

        // Decode the payload (second part)
        const payload = parts[1];
        // Add padding if needed for base64 decoding
        const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
        const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));

        const userInfo = JSON.parse(decodedPayload);
        console.log('Decoded JWT payload:', userInfo);

        return {
            firstName: userInfo.given_name || userInfo.name?.split(' ')[0] || 'User',
            lastName: userInfo.family_name || userInfo.name?.split(' ').slice(1).join(' ') || '',
            email: userInfo.email,
            avatar: userInfo.picture,
            sub: userInfo.sub,
            aud: userInfo.aud,
        };
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
}

// Function to get user information from various sources - UNUSED
// async function getUserInfo(walletAddress: string): Promise<any> { ... }

// Function to get fresh Google user info via direct OAuth popup
async function getGoogleUserInfoDirect(): Promise<any> {
    return new Promise((resolve, reject) => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            reject(new Error('Google Client ID not configured'));
            return;
        }

        console.log('🔄 Opening Google OAuth popup for fresh user info...');

        // Create OAuth URL for popup with proper callback URL
        const scope = 'openid profile email';
        const responseType = 'token id_token';
        const redirectUri = `${window.location.origin}/auth/callback.html`;
        const nonce = Math.random().toString(36).substring(2, 15);
        const state = Math.random().toString(36).substring(2, 15);

        const authUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${encodeURIComponent(clientId)}&` +
            `redirect_uri=${encodeURIComponent(redirectUri)}&` +
            `scope=${encodeURIComponent(scope)}&` +
            `response_type=${encodeURIComponent(responseType)}&` +
            `nonce=${encodeURIComponent(nonce)}&` +
            `state=${encodeURIComponent(state)}`;

        const popup = window.open(
            authUrl,
            'googleAuthDirect',
            'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
            reject(new Error('Popup blocked'));
            return;
        }

        // Listen for messages from the callback page
        const messageListener = (event: MessageEvent) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) {
                return;
            }

            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                console.log('✅ Received fresh Google auth success:', event.data.userInfo);
                window.removeEventListener('message', messageListener);
                resolve(event.data.userInfo);
            } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                console.error('❌ Received fresh Google auth error:', event.data.error);
                window.removeEventListener('message', messageListener);
                reject(new Error(event.data.error));
            }
        };

        window.addEventListener('message', messageListener);

        // Check if popup is closed manually
        const checkPopup = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkPopup);
                window.removeEventListener('message', messageListener);
                reject(new Error('Popup closed by user'));
            }
        }, 1000);

        // Timeout after 30 seconds
        setTimeout(() => {
            if (!popup.closed) {
                popup.close();
            }
            clearInterval(checkPopup);
            window.removeEventListener('message', messageListener);
            reject(new Error('Authentication timeout'));
        }, 30000);
    });
}

// Function to extract Google user info from Enoki zkLogin JWT token
function extractGoogleUserFromEnokiJWT(walletAccount: any): any | null {
    try {
        console.log('🔍 Attempting to extract Google user info from Enoki wallet...');
        console.log('🔍 Full wallet account structure:', walletAccount);
        console.log('🔍 Wallet account keys:', Object.keys(walletAccount));

        // Deep inspection of the wallet account structure
        if (walletAccount.zkLoginAccount) {
            console.log('🔍 zkLoginAccount found:', walletAccount.zkLoginAccount);
            console.log('🔍 zkLoginAccount keys:', Object.keys(walletAccount.zkLoginAccount));
        }

        // Try different possible locations for the JWT token in Enoki
        let jwtToken = null;

        // Check various possible locations for the JWT
        const possibleJWTLocations = [
            'zkLoginAccount.jwt',
            'zkLoginAccount.idToken',
            'zkLoginAccount.credential',
            'jwt',
            'idToken',
            'credential',
            'token',
            'authToken',
            'googleJWT',
            'zkLogin.jwt',
            'zkLogin.idToken',
            'account.jwt',
            'account.idToken',
        ];

        for (const location of possibleJWTLocations) {
            const pathParts = location.split('.');
            let current = walletAccount;

            for (const part of pathParts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                } else {
                    current = null;
                    break;
                }
            }

            if (current && typeof current === 'string' && current.includes('.')) {
                jwtToken = current;
                console.log(`✅ Found JWT token at: ${location}`);
                break;
            }
        }

        // Also try to find any string that looks like a JWT (has 3 parts separated by dots)
        if (!jwtToken) {
            console.log('🔍 Searching for JWT-like strings in the entire wallet object...');
            const searchForJWT = (obj: any, path = ''): string | null => {
                if (typeof obj === 'string' && obj.split('.').length === 3) {
                    console.log(`🎯 Found potential JWT at path: ${path}`);
                    return obj;
                }

                if (typeof obj === 'object' && obj !== null) {
                    for (const [key, value] of Object.entries(obj)) {
                        const result = searchForJWT(value, path ? `${path}.${key}` : key);
                        if (result) return result;
                    }
                }

                return null;
            };

            jwtToken = searchForJWT(walletAccount);
        }

        if (!jwtToken) {
            console.log('❌ No JWT token found in wallet account');
            console.log(
                '🔍 Available data in wallet account:',
                JSON.stringify(walletAccount, null, 2)
            );
            return null;
        }

        console.log('🎯 Found JWT token, attempting to decode...');
        console.log('🎯 JWT token preview:', jwtToken.substring(0, 50) + '...');

        // Decode the JWT token (it's base64 encoded)
        const parts = jwtToken.split('.');
        if (parts.length !== 3) {
            console.log('❌ Invalid JWT format - expected 3 parts, got:', parts.length);
            return null;
        }

        // Decode the payload (second part of JWT)
        const payload = parts[1];
        const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
        const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
        const jwtData = JSON.parse(decodedPayload);

        console.log('🎉 Successfully decoded JWT payload:', jwtData);
        console.log('🔍 Available JWT claims:', Object.keys(jwtData));
        console.log('🔍 JWT payload details:', {
            sub: jwtData.sub,
            aud: jwtData.aud,
            iss: jwtData.iss,
            email: jwtData.email,
            name: jwtData.name,
            given_name: jwtData.given_name,
            family_name: jwtData.family_name,
            picture: jwtData.picture,
            email_verified: jwtData.email_verified,
        });

        // Check if we have the minimum required user data
        const hasUserData = jwtData.email || jwtData.name || jwtData.given_name;

        if (!hasUserData) {
            console.warn(
                '⚠️ JWT contains minimal data - Enoki may be filtering user details for privacy'
            );
            console.log('🔍 This is common in zero-knowledge implementations');
            console.log('🔍 Available claims in JWT:', Object.keys(jwtData));
            return null; // Return null to indicate no user data available
        }

        // Extract Google user information from JWT
        const googleUserInfo = {
            firstName: jwtData.given_name || jwtData.name?.split(' ')[0] || 'User',
            lastName: jwtData.family_name || jwtData.name?.split(' ').slice(1).join(' ') || '',
            email: jwtData.email || `user@${walletAccount.address.slice(2, 8)}.sui`,
            avatar: jwtData.picture || null,
            name: jwtData.name || 'User',
            sub: jwtData.sub,
            aud: jwtData.aud,
        };

        console.log('✅ Extracted Google user info from Enoki JWT:', googleUserInfo);
        return googleUserInfo;
    } catch (error) {
        console.error('❌ Failed to extract Google user info from JWT:', error);
        return null;
    }
}

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const currentAccount = useCurrentAccount();
    const { mutate: connect } = useConnectWallet();
    const { setUser, setIsAuthenticated, isAuthenticated, login } = useAuthStore();

    // Get available Enoki wallets
    const wallets = useWallets();
    const enokiWallets = wallets.filter(isEnokiWallet);
    // Find Google wallet by checking the wallet name/features
    const googleWallet = enokiWallets.find(
        (wallet) =>
            wallet.name?.toLowerCase().includes('google') ||
            wallet.name?.toLowerCase().includes('enoki')
    );

    // Handle successful connection - redirect to dashboard (only if authenticated)
    useEffect(() => {
        if (currentAccount && isAuthenticated) {
            navigate('/dashboard');
        }
    }, [currentAccount, isAuthenticated, navigate]);

    // Check for JWT token on component mount (in case user is returning from OAuth redirect)
    useEffect(() => {
        const checkForExistingAuth = async () => {
            console.log('Checking for existing authentication on page load...');
            console.log('🔍 Current account on mount:', currentAccount);
            console.log('🔍 Is authenticated on mount:', isAuthenticated);

            // Only run if not already authenticated
            if (isAuthenticated) {
                console.log('User already authenticated, skipping JWT check');
                return;
            }

            // Check if there's a JWT in the URL (OAuth redirect)
            const urlJWT = checkForJWTInURL();
            if (urlJWT) {
                console.log('Found JWT in URL on page load, processing...');
                const userInfo = decodeJWT(urlJWT);
                if (userInfo) {
                    console.log('Decoded user info from URL JWT:', userInfo);

                    // Store the JWT for later use
                    sessionStorage.setItem('enoki_jwt', urlJWT);

                    // Create user object
                    const user = {
                        id: userInfo.sub || 'unknown',
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        email: userInfo.email,
                        avatar: userInfo.avatar,
                    };

                    setUser(user);
                    setIsAuthenticated(true);
                    console.log('User authenticated from URL JWT:', user);

                    // Clean up URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        };

        checkForExistingAuth();
    }, []); // Empty dependency array - only run once on mount

    // Function to clear stored Google user info (for testing/debugging)
    const clearStoredGoogleInfo = () => {
        localStorage.removeItem('real_google_user');
        sessionStorage.removeItem('real_google_user');
        console.log('🗑️ Cleared stored Google user info');
    };

    // Make debugging functions available in console
    useEffect(() => {
        (window as any).clearStoredGoogleInfo = clearStoredGoogleInfo;

        // Add cookie debugging function
        (window as any).checkCookies = () => {
            console.log('🍪 Manual Cookie Check:');
            console.log('🍪 document.cookie:', document.cookie);
            console.log('🍪 Cookies.get("accessToken"):', Cookies.get('accessToken'));
            console.log('🍪 Cookies.get("refreshToken"):', Cookies.get('refreshToken'));
            console.log('🍪 localStorage:', localStorage);
            console.log('🍪 sessionStorage:', sessionStorage);
        };

        console.log(
            '🍪 Debug functions available: window.clearStoredGoogleInfo(), window.checkCookies()'
        );
    }, []);

    const handleGoogleLogin = async () => {
        if (!googleWallet) {
            console.error('Google wallet not available');
            return;
        }

        setIsLoading(true);

        console.log('🚀 Starting REAL zkLogin authentication with user data capture...');

        // REAL FIX: Get Google user info BEFORE Enoki processes it
        try {
            console.log('📋 Step 1: Getting fresh Google user info via direct OAuth...');
            const googleUserInfo = await getGoogleUserInfoDirect();

            if (googleUserInfo) {
                console.log('✅ Step 1 SUCCESS: Got real Google user info:', googleUserInfo);

                // Store the real user info for use after Enoki connection
                sessionStorage.setItem('fresh_google_user', JSON.stringify(googleUserInfo));
                localStorage.setItem('real_google_user', JSON.stringify(googleUserInfo));

                console.log('📋 Step 2: Now connecting Enoki wallet with zkLogin...');

                // Longer delay to ensure popup is fully closed and avoid browser popup blocking
                console.log('⏳ Waiting 2 seconds to avoid popup conflicts...');

                // Show user feedback during the delay
                setIsLoading(true);
                await new Promise((resolve) => setTimeout(resolve, 2000));
            } else {
                console.warn('⚠️ Could not get Google user info, proceeding with wallet-only auth');
            }
        } catch (oauthError) {
            console.warn('⚠️ Direct Google OAuth failed, proceeding with Enoki-only:', oauthError);
        }

        try {
            console.log('🔍 Current account before Enoki connection:', currentAccount);
            console.log(
                '🔍 Available wallets:',
                wallets.map((w) => w.name)
            );

            connect(
                { wallet: googleWallet },
                {
                    onSuccess: async (result) => {
                        console.log('Google zkLogin authentication successful', result);
                        console.log('Connection result structure:', {
                            accounts: result.accounts,
                            accountsLength: result.accounts?.length,
                            firstAccount: result.accounts?.[0],
                            firstAccountKeys: result.accounts?.[0]
                                ? Object.keys(result.accounts[0])
                                : 'no first account',
                        });

                        try {
                            const walletAccount = result.accounts?.[0];
                            if (!walletAccount) {
                                console.error('❌ No wallet account found in result');
                                setIsLoading(false);
                                return;
                            }

                            console.log('✅ Wallet connected:', walletAccount.address);

                            console.log('📋 Step 3: Processing authentication result...');

                            // REAL FIX: Prioritize fresh Google user info from Step 1
                            let googleUserInfo = null;

                            // First, check for fresh Google user info from our direct OAuth (Step 1)
                            const freshGoogleUser = sessionStorage.getItem('fresh_google_user');
                            if (freshGoogleUser) {
                                try {
                                    googleUserInfo = JSON.parse(freshGoogleUser);
                                    console.log(
                                        '✅ Step 3: Using FRESH Google user info from Step 1:',
                                        googleUserInfo
                                    );
                                    console.log('🔍 Available JWT fields:', {
                                        hasJwtToken: !!googleUserInfo.jwtToken,
                                        hasIdToken: !!googleUserInfo.idToken,
                                        jwtTokenLength: googleUserInfo.jwtToken?.length,
                                        idTokenLength: googleUserInfo.idToken?.length,
                                    });

                                    // NEW: Authenticate with backend using Google JWT and wallet address
                                    if (googleUserInfo.jwtToken || googleUserInfo.idToken) {
                                        try {
                                            console.log(
                                                '🚀 Step 3: Authenticating with BACKEND...'
                                            );
                                            const jwtToken =
                                                googleUserInfo.jwtToken || googleUserInfo.idToken;
                                            console.log(
                                                '🔍 Selected JWT token length:',
                                                jwtToken.length
                                            );

                                            const authResponse =
                                                await enokiAuthService.authenticateWithGoogleJWT(
                                                    jwtToken,
                                                    walletAccount.address
                                                );

                                            console.log(
                                                '✅ Step 3: BACKEND authentication successful:',
                                                authResponse
                                            );
                                            console.log(
                                                '🔍 Access Token:',
                                                authResponse.accessToken
                                            );
                                            console.log(
                                                '🔍 Refresh Token:',
                                                authResponse.refreshToken
                                            );

                                            // Update auth store with tokens and user data
                                            if (
                                                authResponse.accessToken &&
                                                authResponse.refreshToken
                                            ) {
                                                console.log('✅ Storing tokens in auth store...');
                                                login(
                                                    authResponse.accessToken,
                                                    authResponse.refreshToken
                                                );
                                                setUser(authResponse.user);
                                                setIsAuthenticated(true);
                                                setIsLoading(false);

                                                console.log('✅ Tokens stored successfully!');
                                            } else {
                                                console.error(
                                                    '❌ No tokens received from backend!'
                                                );
                                                console.log(
                                                    '🔍 AuthResponse structure:',
                                                    Object.keys(authResponse)
                                                );
                                            }

                                            // Clean up temporary storage
                                            sessionStorage.removeItem('fresh_google_user');

                                            console.log(
                                                '🎉 BACKEND authentication completed successfully!'
                                            );
                                            navigate('/dashboard');
                                            return; // Exit early - backend authentication successful
                                        } catch (backendError) {
                                            console.error(
                                                '❌ Backend authentication failed:',
                                                backendError
                                            );
                                            console.log(
                                                '📋 Falling back to frontend-only authentication...'
                                            );
                                        }
                                    }

                                    // Clean up the temporary storage (if backend auth wasn't attempted)
                                    sessionStorage.removeItem('fresh_google_user');
                                } catch (error) {
                                    console.error('Failed to parse fresh Google user info:', error);
                                }
                            }

                            // Fallback 1: Try to extract from Enoki JWT (unlikely to work due to privacy filtering)
                            if (!googleUserInfo) {
                                console.log('📋 Fallback 1: Trying to extract from Enoki JWT...');
                                googleUserInfo = extractGoogleUserFromEnokiJWT(walletAccount);
                            }

                            // Fallback 2: Check stored user info from previous sessions
                            if (!googleUserInfo) {
                                console.log('📋 Fallback 2: Checking stored user info...');
                                const storedGoogleUser = localStorage.getItem('real_google_user');
                                if (storedGoogleUser) {
                                    try {
                                        googleUserInfo = JSON.parse(storedGoogleUser);
                                        console.log(
                                            '✅ Using stored Google user info:',
                                            googleUserInfo
                                        );
                                    } catch (error) {
                                        console.error(
                                            'Failed to parse stored Google user info:',
                                            error
                                        );
                                    }
                                }
                            }

                            let user;
                            if (googleUserInfo) {
                                // Create user with real Google information
                                user = {
                                    id: walletAccount.address,
                                    firstName: googleUserInfo.firstName,
                                    lastName: googleUserInfo.lastName,
                                    email: googleUserInfo.email,
                                    avatar: googleUserInfo.avatar,
                                };
                                console.log('🎉 Created user with REAL Google info:', user);
                            } else {
                                // Fallback to enhanced wallet-based profile
                                const addressShort = walletAccount.address.slice(2, 8);
                                user = {
                                    id: walletAccount.address,
                                    firstName: 'Wallet',
                                    lastName: `User #${addressShort}`,
                                    email: `wallet.${addressShort}@sui.network`,
                                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAccount.address}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`,
                                };
                                console.warn(
                                    '⚠️ Using wallet-based profile - Enoki may be filtering user data for privacy'
                                );
                                console.log('💡 This is common in zero-knowledge implementations');
                            }

                            // Add wallet address as a separate property for our internal use
                            (user as any).walletAddress = walletAccount.address;

                            // Set user and authenticate
                            setUser(user);
                            setIsAuthenticated(true);
                            setIsLoading(false);

                            console.log('✅ Authentication completed successfully!');

                            // Navigate to dashboard
                            navigate('/dashboard');
                        } catch (error) {
                            console.error('❌ Error processing authentication result:', error);
                            setIsLoading(false);
                        }
                    },
                    onError: async (error) => {
                        console.error('❌ Enoki zkLogin authentication failed:', error);
                        setIsLoading(false);

                        // Check if it's a popup blocking issue
                        if (
                            error.message?.includes('Failed to open popup') ||
                            error.message?.includes('popup')
                        ) {
                            console.log('🔄 Popup blocked, trying alternative approach...');

                            // Try to use the Google user info we already have
                            const freshGoogleUser = sessionStorage.getItem('fresh_google_user');
                            const realGoogleUser = localStorage.getItem('real_google_user');

                            if (freshGoogleUser || realGoogleUser) {
                                try {
                                    const googleUserInfo = JSON.parse(
                                        freshGoogleUser || realGoogleUser
                                    );
                                    console.log(
                                        '✅ Using stored Google user info for authentication:',
                                        googleUserInfo
                                    );

                                    // TRY TO AUTHENTICATE WITH BACKEND FIRST (if we have JWT)
                                    if (googleUserInfo.jwtToken || googleUserInfo.idToken) {
                                        try {
                                            console.log(
                                                '🚀 Fallback: Authenticating with BACKEND using stored JWT...'
                                            );
                                            const jwtToken =
                                                googleUserInfo.jwtToken || googleUserInfo.idToken;

                                            // Check if we have a current account (wallet might be connected despite popup failure)
                                            const walletAddress = currentAccount?.address;
                                            console.log(
                                                '🔍 Fallback: Current wallet address:',
                                                walletAddress
                                            );

                                            const authResponse =
                                                await enokiAuthService.authenticateWithGoogleJWT(
                                                    jwtToken,
                                                    walletAddress // Include wallet address if available
                                                );

                                            console.log(
                                                '✅ Fallback: BACKEND authentication successful:',
                                                authResponse
                                            );

                                            // Update auth store with tokens and user data
                                            if (
                                                authResponse.accessToken &&
                                                authResponse.refreshToken
                                            ) {
                                                console.log(
                                                    '✅ Fallback: Storing tokens in auth store...'
                                                );
                                                login(
                                                    authResponse.accessToken,
                                                    authResponse.refreshToken
                                                );
                                                setUser(authResponse.user);
                                                setIsAuthenticated(true);
                                                setIsLoading(false);

                                                console.log(
                                                    '✅ Fallback: Tokens stored successfully!'
                                                );
                                                console.log(
                                                    '🎉 Fallback: BACKEND authentication completed successfully!'
                                                );
                                                navigate('/dashboard');
                                                return;
                                            }
                                        } catch (backendError) {
                                            console.error(
                                                '❌ Fallback: Backend authentication failed:',
                                                backendError
                                            );
                                            console.log(
                                                '📋 Fallback: Proceeding with frontend-only authentication...'
                                            );
                                        }
                                    }

                                    // FALLBACK TO FRONTEND-ONLY (no backend tokens)
                                    console.log(
                                        '⚠️ Fallback: Using frontend-only authentication (no backend tokens)'
                                    );

                                    // Check if we have a current account (wallet might be connected despite popup failure)
                                    const walletAddress = currentAccount?.address;
                                    console.log(
                                        '🔍 Fallback: Current wallet address for frontend-only auth:',
                                        walletAddress
                                    );

                                    // Create user object with wallet connection if available
                                    const user = {
                                        id: `google-${googleUserInfo.sub}`,
                                        firstName: googleUserInfo.firstName,
                                        lastName: googleUserInfo.lastName,
                                        email: googleUserInfo.email,
                                        avatar: googleUserInfo.avatar,
                                        walletAddress: walletAddress, // Include wallet address if available
                                    };

                                    setUser(user);
                                    setIsAuthenticated(true);
                                    setIsLoading(false);

                                    console.log(
                                        '✅ Authentication completed with Google-only (no wallet, no backend tokens)'
                                    );
                                    navigate('/dashboard');
                                    return;
                                } catch (fallbackError) {
                                    console.error(
                                        '❌ Fallback authentication failed:',
                                        fallbackError
                                    );
                                }
                            }
                        }

                        // Show error message to user
                        alert(
                            'Authentication failed due to popup blocking. Please disable popup blocker and try again.'
                        );
                    },
                }
            );
        } catch (error) {
            console.error('Google login failed:', error);
            setIsLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        setIsLoading(true);
        try {
            // Apple zkLogin not implemented yet - keeping original placeholder
            console.log('Apple zkLogin authentication - Not implemented yet');
            // You can implement Apple login here when available
        } catch (error) {
            console.error('Apple login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Navigation */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-8">
                <Button
                    variant="ghost"
                    onClick={handleBackToHome}
                    className="text-white hover:bg-white/10"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>
                <div className="flex items-center space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-white">Hack'n'sui</span>
                </div>
            </nav>

            {/* Login Form */}
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur-sm">
                        <div className="mb-8 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-white">
                                Welcome to Hack'n'sui
                            </h1>
                            <p className="text-gray-300">
                                Sign in with zkLogin - secure, private, and decentralized
                            </p>
                        </div>

                        <div className="space-y-4">
                            <Button
                                onClick={handleGoogleLogin}
                                disabled={isLoading || !googleWallet}
                                className="h-12 w-full bg-white text-gray-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                {isLoading
                                    ? 'Connecting...'
                                    : !googleWallet
                                      ? 'Google Wallet Loading...'
                                      : 'Continue with Google'}
                            </Button>

                            <Button
                                onClick={handleAppleLogin}
                                disabled={true}
                                className="h-12 w-full bg-black text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <svg
                                    className="mr-3 h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                Coming Soon - Apple zkLogin
                            </Button>
                        </div>

                        <div className="mt-8 text-center">
                            <div className="mb-4">
                                <p className="text-sm text-gray-400">
                                    Powered by zkLogin - Zero-knowledge authentication
                                </p>
                            </div>
                            <p className="text-gray-400">
                                New to Hack'n'sui?{' '}
                                <Link to="/about" className="text-blue-400 hover:text-blue-300">
                                    Learn more
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl"></div>
        </div>
    );
};

export default LoginPage;
