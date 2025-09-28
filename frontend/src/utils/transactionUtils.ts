import { enokiService } from '@/api/enokiService';
import { SponsorAndExecuteParams, TransactionResult, WalletAccount } from '@/types/enokiTypes';
import { useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { toBase64 } from '@mysten/sui/utils';

/**
 * Get SUI coins for a transaction
 */
export async function getSuiCoin(
    tx: Transaction,
    owner: string,
    client: ReturnType<typeof useSuiClient>,
    amount: bigint
) {
    const clientRes = await client.getCoins({
        owner,
        coinType: '0x2::sui::SUI',
    });

    const coinObjects = clientRes?.data;
    if (!coinObjects.length) throw new Error('No coins available');

    const totalBalance = coinObjects.reduce(
        (acc, coin) => acc + BigInt(coin.balance),
        0n
    );

    if (totalBalance < amount) {
        throw new Error('Insufficient SUI balance');
    }

    const primary = coinObjects[0].coinObjectId;
    if (coinObjects.length > 1) {
        const rest = coinObjects.slice(1).map((c) => c.coinObjectId);
        tx.mergeCoins(
            tx.object(primary),
            rest.map((id) => tx.object(id))
        );
    }

    const [sui_coin] = tx.splitCoins(primary, [amount]);
    return sui_coin;
}

/**
 * Sponsor and execute a transaction using the backend Enoki service
 */
export async function sponsorAndExecute({
    tx,
    suiClient,
    signTransaction,
    currentAccount,
    allowedMoveCallTargets,
    allowedAddresses,
}: SponsorAndExecuteParams): Promise<TransactionResult> {
    try {
        // 1. Build transaction bytes
        const txBytes = await tx.build({
            client: suiClient,
            onlyTransactionKind: true,
        });

        // 2. Request sponsorship from backend
        const sponsorResponse = await enokiService.sponsorTransaction({
            transactionKindBytes: toBase64(txBytes),
            sender: currentAccount.address,
            network: 'testnet',
            ...(allowedMoveCallTargets && { allowedMoveCallTargets }),
            allowedAddresses,
        });

        if (!sponsorResponse.data?.success) {
            throw new Error('Sponsorship failed');
        }

        const { bytes, digest } = sponsorResponse.data;

        // 3. Sign with user's wallet
        const { signature } = await signTransaction({ transaction: bytes });
        if (!signature) {
            throw new Error('Error signing transaction');
        }

        // 4. Execute the transaction via backend
        const executeResponse = await enokiService.executeTransaction({
            digest,
            signature,
        });

        if (!executeResponse.data?.success) {
            throw new Error('Transaction execution failed');
        }

        return {
            success: true,
            digest,
        };
    } catch (error) {
        console.error('Transaction failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Transaction failed',
        };
    }
}

/**
 * Create a transfer transaction
 */
export async function createTransferTransaction(
    recipient: string,
    amount: string,
    currentAccount: WalletAccount,
    suiClient: ReturnType<typeof useSuiClient>
): Promise<Transaction> {
    const amt = Number(amount) * 1e9; // Convert to MIST
    const tx = new Transaction();

    const coins = await getSuiCoin(
        tx,
        currentAccount.address,
        suiClient,
        BigInt(amt)
    );

    tx.setSender(currentAccount.address);
    tx.transferObjects([coins], recipient);

    return tx;
}

/**
 * Format SUI balance from MIST to SUI
 */
export function formatSuiBalance(balance: string | number): string {
    const balanceNum = typeof balance === 'string' ? Number(balance) : balance;
    return (balanceNum / 1e9).toFixed(4);
}
