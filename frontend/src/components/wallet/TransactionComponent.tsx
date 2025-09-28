import { createTransferTransaction, sponsorAndExecute } from '@/utils/transactionUtils';

import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { useCurrentAccount, useSignTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransactionComponentProps {
    className?: string;
}

export const TransactionComponent: React.FC<TransactionComponentProps> = ({ className = '' }) => {
    const currentAccount = useCurrentAccount();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const suiClient = useSuiClient();
    const { mutateAsync: signTransaction } = useSignTransaction();

    const handleSend = async () => {
        if (!currentAccount) {
            toast.error('No wallet connected');
            return;
        }

        if (!recipient || !amount) {
            toast.error('Please fill all fields');
            return;
        }

        setIsLoading(true);

        try {
            const tx = await createTransferTransaction(
                recipient,
                amount,
                currentAccount,
                suiClient
            );

            const result = await sponsorAndExecute({
                tx,
                suiClient,
                signTransaction,
                currentAccount,
                allowedAddresses: [currentAccount.address, recipient],
            });

            if (result.success) {
                toast.success('Transaction sent successfully!');
                setRecipient('');
                setAmount('');
            } else {
                toast.error(result.error || 'Transaction failed');
            }
        } catch (error) {
            console.error('Transaction error:', error);
            toast.error(error instanceof Error ? error.message : 'Transaction failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSmartContractCall = async () => {
        if (!currentAccount) {
            toast.error('No wallet connected');
            return;
        }

        setIsLoading(true);

        try {
            const tx = new Transaction();
            tx.moveCall({
                target: '0xdb5eac8d152382bd1ab938e42e64fca25c2fca8596ac4a026260235d9427e8eb::smart_contract::add',
                arguments: [
                    tx.object('0xce1c0b9960f676ded7280fe53a404c8f3971eaa4cb04831b545c47735331e0ad'),
                ],
            });

            const result = await sponsorAndExecute({
                tx,
                suiClient,
                signTransaction,
                currentAccount,
                allowedMoveCallTargets: [
                    '0xdb5eac8d152382bd1ab938e42e64fca25c2fca8596ac4a026260235d9427e8eb::smart_contract::add',
                ],
                allowedAddresses: [currentAccount.address],
            });

            if (result.success) {
                toast.success('Smart contract call successful!');
            } else {
                toast.error(result.error || 'Smart contract call failed');
            }
        } catch (error) {
            console.error('Smart contract call error:', error);
            toast.error(error instanceof Error ? error.message : 'Smart contract call failed');
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentAccount) {
        return null;
    }

    return (
        <div className={`space-y-4 ${className}`}>
            <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-semibold">Send SUI</h3>

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="recipient">Recipient Address</Label>
                        <Input
                            id="recipient"
                            type="text"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="0x..."
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="amount">Amount (SUI)</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.0001"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0"
                            disabled={isLoading}
                        />
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !recipient || !amount}
                        className="w-full"
                    >
                        {isLoading ? 'Processing...' : 'Send Transaction'}
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border p-4">
                <h3 className="mb-4 text-lg font-semibold">Smart Contract</h3>

                <Button
                    onClick={handleSmartContractCall}
                    disabled={isLoading}
                    variant="secondary"
                    className="w-full"
                >
                    {isLoading ? 'Processing...' : 'Call Add Function'}
                </Button>
            </div>
        </div>
    );
};
