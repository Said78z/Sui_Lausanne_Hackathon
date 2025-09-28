// Smart Contract DTOs for LémanFlow

// ==================== Passport Contract DTOs ====================

export interface MintPassportRequestDto {
    eventId: number;
    userAddress: string;
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface MintPassportResponseDto {
    success: boolean;
    passportId?: string;
    transactionDigest?: string;
    error?: string;
}

export interface PassportInfoDto {
    id: string;
    owner: string;
    eventId: number;
    mintedAt: string;
    isValid: boolean;
}

// ==================== CheckIn Contract DTOs ====================

export interface CreateMissionRequestDto {
    eventId: number;
    missionName: string;
    description: string;
    rewardAmount: number;
    maxParticipants?: number;
    startTime?: string;
    endTime?: string;
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface CreateMissionResponseDto {
    success: boolean;
    missionId?: string;
    transactionDigest?: string;
    error?: string;
}

export interface ValidateCheckInRequestDto {
    missionId: string;
    userAddress: string;
    qrSignature: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface ValidateCheckInResponseDto {
    success: boolean;
    attestationId?: string;
    transactionDigest?: string;
    rewardClaimed?: boolean;
    error?: string;
}

export interface MissionInfoDto {
    id: string;
    eventId: number;
    name: string;
    description: string;
    rewardAmount: number;
    maxParticipants: number;
    currentParticipants: number;
    isActive: boolean;
    startTime?: string;
    endTime?: string;
    createdBy: string;
}

export interface AttestationInfoDto {
    id: string;
    missionId: string;
    owner: string;
    claimedAt: string;
    isValid: boolean;
}

// ==================== Grant Pool Contract DTOs ====================

export interface CreateGrantPoolRequestDto {
    eventId: number;
    initialAmount: number;
    coinType?: string; // Default to SUI
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface CreateGrantPoolResponseDto {
    success: boolean;
    poolId?: string;
    transactionDigest?: string;
    error?: string;
}

export interface DepositToPoolRequestDto {
    poolId: string;
    amount: number;
    coinType?: string;
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface DepositToPoolResponseDto {
    success: boolean;
    newBalance?: number;
    transactionDigest?: string;
    error?: string;
}

export interface SetPayoutsRequestDto {
    poolId: string;
    payouts: number[]; // Array of payout amounts for each position
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface SetPayoutsResponseDto {
    success: boolean;
    transactionDigest?: string;
    error?: string;
}

export interface DistributeGrantsRequestDto {
    poolId: string;
    winners: string[]; // Array of winner addresses
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface DistributeGrantsResponseDto {
    success: boolean;
    transactionDigest?: string;
    distributedAmounts?: number[];
    error?: string;
}

export interface RefundPoolRequestDto {
    poolId: string;
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface RefundPoolResponseDto {
    success: boolean;
    refundAmount?: number;
    transactionDigest?: string;
    error?: string;
}

export interface GrantPoolInfoDto {
    id: string;
    admin: string;
    eventId: number;
    isDistributed: boolean;
    balance: number;
    payouts: number[];
    createdAt?: string;
}

// ==================== Common DTOs ====================

export interface SmartContractErrorDto {
    error: string;
    details?: string;
    code?: number;
}

export interface TransactionStatusDto {
    digest: string;
    status: 'pending' | 'success' | 'failed';
    timestamp: string;
    gasUsed?: number;
    error?: string;
}

// ==================== Event DTOs ====================

export interface BlockchainEventDto {
    eventType: 'PassportMinted' | 'MissionCreated' | 'CheckInValidated' | 'PoolCreated' | 'GrantsDistributed';
    transactionDigest: string;
    timestamp: string;
    data: any;
}
