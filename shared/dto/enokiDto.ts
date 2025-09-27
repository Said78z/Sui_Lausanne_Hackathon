export interface SponsorTransactionRequestDto {
    transactionKindBytes: string;
    sender: string;
    allowedMoveCallTargets?: string[];
    allowedAddresses?: string[];
    network?: 'testnet' | 'mainnet' | 'devnet';
}

export interface SponsorTransactionResponseDto {
    success: boolean;
    bytes: string;
    digest: string;
}

export interface ExecuteTransactionRequestDto {
    digest: string;
    signature: string;
}

export interface ExecuteTransactionResponseDto {
    success: boolean;
    result: any;
}

export interface EnokiErrorResponseDto {
    error: string;
    details?: string;
}
