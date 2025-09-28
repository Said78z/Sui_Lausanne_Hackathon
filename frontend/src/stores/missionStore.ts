import { create } from 'zustand';
import { MissionInfoDto, AttestationInfoDto } from '@shared/dto';

interface MissionState {
    // State
    missions: MissionInfoDto[];
    userAttestations: AttestationInfoDto[];
    currentMission: MissionInfoDto | null;
    isLoading: boolean;
    error: string | null;
    
    // Check-in state
    isCheckingIn: boolean;
    checkInProgress: 'idle' | 'generating-qr' | 'validating' | 'minting-attestation' | 'completed' | 'failed';
    lastCheckInResult: AttestationInfoDto | null;
    
    // QR state
    currentQRSignature: string | null;
    qrExpiresAt: Date | null;

    // Actions
    setMissions: (missions: MissionInfoDto[]) => void;
    setUserAttestations: (attestations: AttestationInfoDto[]) => void;
    setCurrentMission: (mission: MissionInfoDto | null) => void;
    addMission: (mission: MissionInfoDto) => void;
    addAttestation: (attestation: AttestationInfoDto) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Check-in actions
    setCheckingIn: (checkingIn: boolean) => void;
    setCheckInProgress: (progress: MissionState['checkInProgress']) => void;
    setLastCheckInResult: (result: AttestationInfoDto | null) => void;
    
    // QR actions
    setCurrentQRSignature: (signature: string | null, expiresAt?: Date) => void;
    clearQRSignature: () => void;
    
    // Helpers
    hasCompletedMission: (missionId: string) => boolean;
    getAttestationForMission: (missionId: string) => AttestationInfoDto | null;
    getActiveMissions: () => MissionInfoDto[];
    isQRValid: () => boolean;
    clearState: () => void;
}

export const useMissionStore = create<MissionState>()((set, get) => ({
    // Initial state
    missions: [],
    userAttestations: [],
    currentMission: null,
    isLoading: false,
    error: null,
    isCheckingIn: false,
    checkInProgress: 'idle',
    lastCheckInResult: null,
    currentQRSignature: null,
    qrExpiresAt: null,

    // Actions
    setMissions: (missions) => {
        set({ missions, error: null });
    },

    setUserAttestations: (attestations) => {
        set({ userAttestations: attestations, error: null });
    },

    setCurrentMission: (mission) => {
        set({ currentMission: mission });
    },

    addMission: (mission) => {
        set((state) => ({
            missions: [...state.missions, mission],
            error: null
        }));
    },

    addAttestation: (attestation) => {
        set((state) => ({
            userAttestations: [...state.userAttestations, attestation],
            lastCheckInResult: attestation,
            error: null
        }));
    },

    setLoading: (loading) => {
        set({ isLoading: loading });
    },

    setError: (error) => {
        set({ error, isLoading: false });
    },

    setCheckingIn: (checkingIn) => {
        set({ isCheckingIn: checkingIn });
    },

    setCheckInProgress: (progress) => {
        set({ checkInProgress: progress });
    },

    setLastCheckInResult: (result) => {
        set({ lastCheckInResult: result });
    },

    setCurrentQRSignature: (signature, expiresAt) => {
        set({
            currentQRSignature: signature,
            qrExpiresAt: expiresAt || null
        });
    },

    clearQRSignature: () => {
        set({
            currentQRSignature: null,
            qrExpiresAt: null
        });
    },

    // Helpers
    hasCompletedMission: (missionId) => {
        const { userAttestations } = get();
        return userAttestations.some(attestation => 
            attestation.missionId === missionId && attestation.isValid
        );
    },

    getAttestationForMission: (missionId) => {
        const { userAttestations } = get();
        return userAttestations.find(attestation => 
            attestation.missionId === missionId && attestation.isValid
        ) || null;
    },

    getActiveMissions: () => {
        const { missions } = get();
        const now = new Date();
        return missions.filter(mission => {
            if (!mission.isActive) return false;
            if (mission.endTime && new Date(mission.endTime) < now) return false;
            if (mission.startTime && new Date(mission.startTime) > now) return false;
            return true;
        });
    },

    isQRValid: () => {
        const { qrExpiresAt } = get();
        if (!qrExpiresAt) return false;
        return new Date() < qrExpiresAt;
    },

    clearState: () => {
        set({
            missions: [],
            userAttestations: [],
            currentMission: null,
            isLoading: false,
            error: null,
            isCheckingIn: false,
            checkInProgress: 'idle',
            lastCheckInResult: null,
            currentQRSignature: null,
            qrExpiresAt: null
        });
    }
}));

