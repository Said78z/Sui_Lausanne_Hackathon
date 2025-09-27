import { useLatestSimulationByProspectId } from '@/api/queries/simulationQueries';

interface FinancialSimulationProps {
    prospectId: string;
}

export function FinancialSimulation({ prospectId }: FinancialSimulationProps) {
    const { data: simulation, isLoading, error } = useLatestSimulationByProspectId(prospectId);

    const formatCurrency = (amount?: number | null) => {
        if (!amount) return 'Non renseigné';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatYesNo = (value?: boolean | null) => {
        if (value === null || value === undefined) return 'Non renseigné';
        return value ? 'Oui' : 'Non';
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return 'Non renseigné';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
        <div className="relative h-full rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Simulation financière</h2>
            
            {isLoading && (
                <div className="text-center text-gray-500">Chargement de la simulation...</div>
            )}
            
            {error && (
                <div className="text-center text-gray-500">Aucune simulation disponible pour le moment</div>
            )}
            
            {!isLoading && !error && !simulation && (
                <div className="text-center text-gray-500">Aucune simulation créée</div>
            )}
            
            {simulation && (
                <div className="space-y-6">
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Dernière simulation</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Raison</p>
                                <p className="text-lg">{simulation.reason || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date de création</p>
                                <p className="text-lg">{formatDate(simulation.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Revenus annuels</p>
                                <p className="text-lg">{formatCurrency(simulation.annualRevenus)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Charges annuelles</p>
                                <p className="text-lg">{formatCurrency(simulation.annualCharges)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Épargne</p>
                                <p className="text-lg">{formatCurrency(simulation.saving)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Possède de l'immobilier</p>
                                <p className="text-lg">{formatYesNo(simulation.ownsRealEstate)}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-2 text-lg font-semibold">Résultat</h3>
                        <div className="rounded-lg bg-gray-50 p-4">
                            <div>
                                <p className="text-sm text-gray-600">Capacité d'épargne annuelle</p>
                                <p className="text-xl font-semibold text-green-600">
                                    {formatCurrency(simulation.annualRevenus - simulation.annualCharges)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
