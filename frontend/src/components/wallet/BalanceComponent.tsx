import { formatSuiBalance } from '@/utils/transactionUtils';

import React from 'react';

import { useSuiClientQueries } from '@mysten/dapp-kit';

interface BalanceComponentProps {
    ownerAddress: string;
    loadingMessage?: string;
    errorMessage?: string;
    className?: string;
}

export const BalanceComponent: React.FC<BalanceComponentProps> = ({
    ownerAddress,
    loadingMessage = 'Loading balances...',
    errorMessage = 'Error fetching balances',
    className = '',
}) => {
    const { data, isPending, isError } = useSuiClientQueries({
        queries: [
            {
                method: 'getAllBalances',
                params: {
                    owner: ownerAddress,
                    coinType: '0x2::sui::SUI',
                },
            },
        ],
        combine: (result) => {
            return {
                data: result.map((res) => res.data),
                isSuccess: result.every((res) => res.isSuccess),
                isPending: result.some((res) => res.isPending),
                isError: result.some((res) => res.isError),
            };
        },
    });

    if (isPending) {
        return <div className={className}>{loadingMessage}</div>;
    }

    if (isError) {
        return <div className={`text-red-500 ${className}`}>{errorMessage}</div>;
    }

    const firstResult = data?.[0];
    let totalSui = 0;

    if (Array.isArray(firstResult)) {
        totalSui = firstResult.reduce((sum, item) => sum + Number(item.totalBalance), 0);
    }

    return (
        <div className={className}>
            <span className="font-semibold">Total SUI Balance:</span>{' '}
            <span className="text-blue-600">{formatSuiBalance(totalSui)} SUI</span>
        </div>
    );
};
