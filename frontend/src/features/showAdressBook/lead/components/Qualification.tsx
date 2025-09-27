import { useProspectById } from '@/api/queries/prospectQueries';

interface QualificationProps {
    prospectId: string;
}

export function Qualification({ prospectId }: QualificationProps) {
    const { data: prospect, isLoading } = useProspectById(prospectId);

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

    return (
        <div className="relative h-full rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Qualification</h2>
            
            {isLoading && (
                <div className="text-center text-gray-500">Chargement...</div>
            )}
            
            {!isLoading && (
                <div className="space-y-6">
                    <div>
                        <h3 className="mb-2 text-lg font-semibold">Qualification financière</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Apport maximum</p>
                                <p className="text-lg">{formatCurrency(prospect?.maxDownPayment)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Épargne disponible</p>
                                <p className="text-lg">{formatCurrency(prospect?.availableSavings)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Revenu annuel</p>
                                <p className="text-lg">{formatCurrency(prospect?.annualNetIncomeBeforeTax)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Revenus locatifs</p>
                                <p className="text-lg">{formatCurrency(prospect?.currentRentalIncome)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Annuités d'emprunt actuelles</p>
                                <p className="text-lg">{formatCurrency(prospect?.currentLoanAnnuitiesAmount)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Loyer actuel</p>
                                <p className="text-lg">{formatCurrency(prospect?.rent)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Premier investissement</p>
                                <p className="text-lg">{formatYesNo(prospect?.firstTimeInvestor)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Possession immobilière</p>
                                <p className="text-lg">{formatYesNo(prospect?.alreadyHaveImmo)}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-2 text-lg font-semibold">Profil qualitatif</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Âge estimé</p>
                                <p className="text-lg">{prospect?.ageEstimate ? `${prospect.ageEstimate} ans` : 'Non renseigné'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Niveau de connaissance</p>
                                <p className="text-lg">{prospect?.knowledgeLevel || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Implication</p>
                                <p className="text-lg">{prospect?.implication || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Mindset</p>
                                <p className="text-lg">{prospect?.mindset || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Situation professionnelle</p>
                                <p className="text-lg">{prospect?.professionalSituation || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Statut</p>
                                <p className="text-lg">{prospect?.status || 'Non renseigné'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
