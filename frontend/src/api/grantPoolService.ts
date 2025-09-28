import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';
import {
    CreateGrantPoolRequestDto,
    CreateGrantPoolResponseDto,
    DepositToPoolRequestDto,
    DepositToPoolResponseDto,
    SetPayoutsRequestDto,
    SetPayoutsResponseDto,
    DistributeGrantsRequestDto,
    DistributeGrantsResponseDto,
    RefundPoolRequestDto,
    RefundPoolResponseDto,
    GrantPoolInfoDto,
} from '@shared/dto';

class GrantPoolService {
    /**
     * Create a new grant pool
     */
    public async createGrantPool(
        request: CreateGrantPoolRequestDto
    ): Promise<ApiResponse<CreateGrantPoolResponseDto>> {
        try {
            console.log('GrantPoolService: Creating grant pool...', request);

            const response = await api.fetchRequest('/api/grants/create', 'POST', request, true);
            console.log('GrantPoolService: Grant pool created successfully:', response);

            return response;
        } catch (error) {
            console.error('GrantPoolService: Failed to create grant pool:', error);
            throw error;
        }
    }

    /**
     * Deposit funds to a grant pool
     */
    public async depositToPool(
        request: DepositToPoolRequestDto
    ): Promise<ApiResponse<DepositToPoolResponseDto>> {
        try {
            console.log('GrantPoolService: Depositing to pool...', request);

            const response = await api.fetchRequest('/api/grants/deposit', 'POST', request, true);
            console.log('GrantPoolService: Deposit successful:', response);

            return response;
        } catch (error) {
            console.error('GrantPoolService: Failed to deposit to pool:', error);
            throw error;
        }
    }

    /**
     * Set payout amounts for a grant pool
     */
    public async setPayouts(
        request: SetPayoutsRequestDto
    ): Promise<ApiResponse<SetPayoutsResponseDto>> {
        try {
            console.log('GrantPoolService: Setting payouts...', request);

            const response = await api.fetchRequest('/api/grants/payouts', 'POST', request, true);
            console.log('GrantPoolService: Payouts set successfully:', response);

            return response;
        } catch (error) {
            console.error('GrantPoolService: Failed to set payouts:', error);
            throw error;
        }
    }

    /**
     * Distribute grants to winners
     */
    public async distributeGrants(
        request: DistributeGrantsRequestDto
    ): Promise<ApiResponse<DistributeGrantsResponseDto>> {
        try {
            console.log('GrantPoolService: Distributing grants...', request);

            const response = await api.fetchRequest('/api/grants/distribute', 'POST', request, true);
            console.log('GrantPoolService: Grants distributed successfully:', response);

            return response;
        } catch (error) {
            console.error('GrantPoolService: Failed to distribute grants:', error);
            throw error;
        }
    }

    /**
     * Refund remaining funds from a pool
     */
    public async refundPool(
        request: RefundPoolRequestDto
    ): Promise<ApiResponse<RefundPoolResponseDto>> {
        try {
            console.log('GrantPoolService: Refunding pool...', request);

            const response = await api.fetchRequest('/api/grants/refund', 'POST', request, true);
            console.log('GrantPoolService: Pool refunded successfully:', response);

            return response;
        } catch (error) {
            console.error('GrantPoolService: Failed to refund pool:', error);
            throw error;
        }
    }

    /**
     * Get grant pool information by ID
     */
    public async getPoolInfo(poolId: string): Promise<ApiResponse<GrantPoolInfoDto>> {
        try {
            console.log('GrantPoolService: Fetching pool info...', poolId);

            const response = await api.fetchRequest(`/api/grants/${poolId}`, 'GET', null, true);
            console.log('GrantPoolService: Pool info fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('GrantPoolService: Failed to fetch pool info:', error);
            throw error;
        }
    }

    /**
     * Get all pools for an event
     */
    public async getEventPools(
        eventId: number
    ): Promise<ApiResponse<{ pools: GrantPoolInfoDto[]; eventId: number }>> {
        try {
            console.log('GrantPoolService: Fetching event pools...', eventId);

            const response = await api.fetchRequest(
                `/api/grants/event/${eventId}`,
                'GET',
                null,
                true
            );
            console.log('GrantPoolService: Event pools fetched successfully:', response);

            return response;
        } catch (error) {
            console.error('GrantPoolService: Failed to fetch event pools:', error);
            throw error;
        }
    }

    /**
     * Helper method to calculate total pool value
     */
    public calculateTotalPoolValue(pools: GrantPoolInfoDto[]): number {
        return pools.reduce((total, pool) => total + pool.balance, 0);
    }

    /**
     * Helper method to get pool status
     */
    public getPoolStatus(pool: GrantPoolInfoDto): 'active' | 'distributed' | 'empty' {
        if (pool.isDistributed) return 'distributed';
        if (pool.balance === 0) return 'empty';
        return 'active';
    }

    /**
     * Helper method to validate payout distribution
     */
    public validatePayouts(payouts: number[], totalBalance: number): boolean {
        const totalPayouts = payouts.reduce((sum, payout) => sum + payout, 0);
        return totalPayouts <= totalBalance;
    }
}

export const grantPoolService = new GrantPoolService();

