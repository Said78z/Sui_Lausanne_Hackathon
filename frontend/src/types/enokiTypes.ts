import { useSignTransaction, useSuiClient, WalletAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

export type { WalletAccount };

export interface SponsorAndExecuteParams {
    tx: Transaction;
    suiClient: ReturnType<typeof useSuiClient>;
    signTransaction: ReturnType<typeof useSignTransaction>['mutateAsync'];
    currentAccount: WalletAccount;
    allowedMoveCallTargets?: string[];
    allowedAddresses: string[];
}

export interface TransactionResult {
    success: boolean;
    digest?: string;
    error?: string;
}

export interface BalanceData {
    totalBalance: string;
    coinType: string;
}

export interface SuiBalance {
    totalSui: number;
    formattedBalance: string;
}
