import { create } from 'zustand';
import { GrantPoolInfoDto } from '@shared/dto';

interface GrantPoolState {
    // State
    pools: GrantPoolInfoDto[];
    currentPool: GrantPoolInfoDto | null;
    isLoading: boolean;
    error: string | null;
    
    // Pool management state
    isCreating: boolean;
    isDepositing: boolean;
    isDistributing: boolean;
    isRefunding: boolean;
    
    // Operation progress
    operationProgress: 'idle' | 'creating-transaction' | 'sponsoring' | 'executing' | 'completed' | 'failed';
    lastOperationResult: any | null;
    
    // Pool statistics
    totalPoolValue: number;
    distributedPools: number;
    activePools: number;

    // Actions
    setPools: (pools: GrantPoolInfoDto[]) => void;
    setCurrentPool: (pool: GrantPoolInfoDto | null) => void;
    addPool: (pool: GrantPoolInfoDto) => void;
    updatePool: (poolId: string, updates: Partial<GrantPoolInfoDto>) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    
    // Operation actions
    setCreating: (creating: boolean) => void;
    setDepositing: (depositing: boolean) => void;
    setDistributing: (distributing: boolean) => void;
    setRefunding: (refunding: boolean) => void;
    setOperationProgress: (progress: GrantPoolState['operationProgress']) => void;
    setLastOperationResult: (result: any) => void;
    
    // Statistics actions
    calculateStatistics: () => void;
    
    // Helpers
    getPoolsByEvent: (eventId: number) => GrantPoolInfoDto[];
    getActivePoolsForEvent: (eventId: number) => GrantPoolInfoDto[];
    getPoolStatus: (pool: GrantPoolInfoDto) => 'active' | 'distributed' | 'empty';
    canDistribute: (pool: GrantPoolInfoDto) => boolean;
    getTotalPayouts: (pool: GrantPoolInfoDto) => number;
    clearState: () => void;
}

export const useGrantPoolStore = create<GrantPoolState>()((set, get) => ({
    // Initial state
    pools: [],
    currentPool: null,
    isLoading: false,
    error: null,
    isCreating: false,
    isDepositing: false,
    isDistributing: false,
    isRefunding: false,
    operationProgress: 'idle',
    lastOperationResult: null,
    totalPoolValue: 0,
    distributedPools: 0,
    activePools: 0,

    // Actions
    setPools: (pools) => {
        set({ pools, error: null });
        get().calculateStatistics();
    },

    setCurrentPool: (pool) => {
        set({ currentPool: pool });
    },

    addPool: (pool) => {
        set((state) => ({
            pools: [...state.pools, pool],
            error: null
        }));
        get().calculateStatistics();
    },

    updatePool: (poolId, updates) => {
        set((state) => ({
            pools: state.pools.map(pool => 
                pool.id === poolId ? { ...pool, ...updates } : pool
            )
        }));
        get().calculateStatistics();
    },

    setLoading: (loading) => {
        set({ isLoading: loading });
    },

    setError: (error) => {
        set({ error, isLoading: false });
    },

    setCreating: (creating) => {
        set({ isCreating: creating });
    },

    setDepositing: (depositing) => {
        set({ isDepositing: depositing });
    },

    setDistributing: (distributing) => {
        set({ isDistributing: distributing });
    },

    setRefunding: (refunding) => {
        set({ isRefunding: refunding });
    },

    setOperationProgress: (progress) => {
        set({ operationProgress: progress });
    },

    setLastOperationResult: (result) => {
        set({ lastOperationResult: result });
    },

    calculateStatistics: () => {
        const { pools } = get();
        
        const totalPoolValue = pools.reduce((total, pool) => total + pool.balance, 0);
        const distributedPools = pools.filter(pool => pool.isDistributed).length;
        const activePools = pools.filter(pool => !pool.isDistributed && pool.balance > 0).length;
        
        set({
            totalPoolValue,
            distributedPools,
            activePools
        });
    },

    // Helpers
    getPoolsByEvent: (eventId) => {
        const { pools } = get();
        return pools.filter(pool => pool.eventId === eventId);
    },

    getActivePoolsForEvent: (eventId) => {
        const { pools } = get();
        return pools.filter(pool => 
            pool.eventId === eventId && 
            !pool.isDistributed && 
            pool.balance > 0
        );
    },

    getPoolStatus: (pool) => {
        if (pool.isDistributed) return 'distributed';
        if (pool.balance === 0) return 'empty';
        return 'active';
    },

    canDistribute: (pool) => {
        if (pool.isDistributed) return false;
        if (pool.balance === 0) return false;
        if (pool.payouts.length === 0) return false;
        
        const totalPayouts = pool.payouts.reduce((sum, payout) => sum + payout, 0);
        return totalPayouts <= pool.balance;
    },

    getTotalPayouts: (pool) => {
        return pool.payouts.reduce((sum, payout) => sum + payout, 0);
    },

    clearState: () => {
        set({
            pools: [],
            currentPool: null,
            isLoading: false,
            error: null,
            isCreating: false,
            isDepositing: false,
            isDistributing: false,
            isRefunding: false,
            operationProgress: 'idle',
            lastOperationResult: null,
            totalPoolValue: 0,
            distributedPools: 0,
            activePools: 0
        });
    }
}));

