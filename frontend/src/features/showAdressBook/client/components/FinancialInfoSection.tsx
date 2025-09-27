import { Building, Home } from 'lucide-react';

import { StatsCard } from '@/features/showAdressBook/components/StatsCard';

interface FinancialInfoSectionProps {
    financialData: {
        apport: number;
        epargne: number;
        revenuAnnuel: number;
        revenusLocatifs: number;
        empruntsActuels: number;
        loyersActuels: number;
        premierInvestissement: boolean;
        possessionImmobiliere: boolean;
    };
}

export function FinancialInfoSection({ financialData }: FinancialInfoSectionProps) {
    return (
        <>
            <div className="grid grid-cols-3 gap-4">
                <StatsCard title="Apport" value={`${financialData.apport.toLocaleString()} €`} />
                <StatsCard title="Épargne" value={`${financialData.epargne.toLocaleString()} €`} />
                <StatsCard
                    title="Revenu annuel"
                    value={`${financialData.revenuAnnuel.toLocaleString()} €`}
                />
                <StatsCard
                    title="Revenus locatifs"
                    value={`${financialData.revenusLocatifs.toLocaleString()} €`}
                />
                <StatsCard
                    title="Emprunts actuels"
                    value={`${financialData.empruntsActuels.toLocaleString()} €`}
                />
                <StatsCard
                    title="Loyers actuels"
                    value={`${financialData.loyersActuels.toLocaleString()} €`}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-xl border p-6">
                    <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-500" />
                        <h3 className="text-sm text-gray-600">Premier investissement</h3>
                    </div>
                    <p className="mt-2 text-2xl font-semibold">
                        {financialData.premierInvestissement ? 'Oui' : 'Non'}
                    </p>
                    <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                </div>
                <div className="relative rounded-xl border p-6">
                    <div className="flex items-center gap-2">
                        <Home size={16} className="text-gray-500" />
                        <h3 className="text-sm text-gray-600">Possession immobilière</h3>
                    </div>
                    <p className="mt-2 text-2xl font-semibold">
                        {financialData.possessionImmobiliere ? 'Oui' : 'Non'}
                    </p>
                    <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                </div>
            </div>
        </>
    );
}
