import { create } from 'zustand';
import { PassportInfoDto } from '@shared/dto';

interface PassportState {
    // State
    userPassports: PassportInfoDto[];
    currentPassport: PassportInfoDto | null;
    isLoading: boolean;
    error: string | null;
    
    // Passport minting state
    isMinting: boolean;
    mintingProgress: 'idle' | 'creating-transaction' | 'sponsoring' | 'executing' | 'completed' | 'failed';
    lastMintedPassport: PassportInfoDto | null;

    // Actions
    setUserPassports: (passports: PassportInfoDto[]) => void;
    setCurrentPassport: (passport: PassportInfoDto | null) => void;
    addPassport: (passport: PassportInfoDto) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Minting actions
    setMinting: (minting: boolean) => void;
    setMintingProgress: (progress: PassportState['mintingProgress']) => void;
    setLastMintedPassport: (passport: PassportInfoDto | null) => void;
    
    // Helpers
    hasPassportForEvent: (eventId: number) => boolean;
    getPassportForEvent: (eventId: number) => PassportInfoDto | null;
    clearState: () => void;
}

export const usePassportStore = create<PassportState>()((set, get) => ({
    // Initial state
    userPassports: [],
    currentPassport: null,
    isLoading: false,
    error: null,
    isMinting: false,
    mintingProgress: 'idle',
    lastMintedPassport: null,

    // Actions
    setUserPassports: (passports) => {
        set({ userPassports: passports, error: null });
    },

    setCurrentPassport: (passport) => {
        set({ currentPassport: passport });
    },

    addPassport: (passport) => {
        set((state) => ({
            userPassports: [...state.userPassports, passport],
            lastMintedPassport: passport,
            error: null
        }));
    },

    setLoading: (loading) => {
        set({ isLoading: loading });
    },

    setError: (error) => {
        set({ error, isLoading: false });
    },

    setMinting: (minting) => {
        set({ isMinting: minting });
    },

    setMintingProgress: (progress) => {
        set({ mintingProgress: progress });
    },

    setLastMintedPassport: (passport) => {
        set({ lastMintedPassport: passport });
    },

    // Helpers
    hasPassportForEvent: (eventId) => {
        const { userPassports } = get();
        return userPassports.some(passport => passport.eventId === eventId && passport.isValid);
    },

    getPassportForEvent: (eventId) => {
        const { userPassports } = get();
        return userPassports.find(passport => passport.eventId === eventId && passport.isValid) || null;
    },

    clearState: () => {
        set({
            userPassports: [],
            currentPassport: null,
            isLoading: false,
            error: null,
            isMinting: false,
            mintingProgress: 'idle',
            lastMintedPassport: null
        });
    }
}));

