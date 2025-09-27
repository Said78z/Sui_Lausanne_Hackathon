import { BadgeService } from '@/services/badgeService';

import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Mail, MessageSquare, Phone } from 'lucide-react';

// Replace mock imports with API hooks
import { useCityByName } from '@/api/queries/cityQueries';
import { useOpportunity } from '@/api/queries/opportunityQueries';

import { AveragePriceChart } from './components/AveragePriceChart';
import { FinancialSimulationChart } from './components/FinancialSimulationChart';
import OpportunityDetailCard from './components/OpportunitiesDetailsCard';
import { OpportunityMap } from './components/OpportunityMap';
import {
    OpportunityParameters,
    OpportunityParametersPanel,
} from './components/OpportunityParametersPanel';
import { RentDistributionChart } from './components/RentDistributionChart';
import { SearchDistributionChart } from './components/SearchDistributionChart';
import { SearchDurationChart } from './components/SearchDurationChart';

export default function Opportunity() {
    const { id } = useParams();
    
    // Fetch opportunity data from backend
    const { 
        data: opportunityResponse, 
        isLoading: isLoadingOpportunity, 
        error: opportunityError 
    } = useOpportunity(id || '');
    
    const opportunity = opportunityResponse?.data;
    
    // Fetch city data by name
    const { 
        data: city, 
        isLoading: isLoadingCity 
    } = useCityByName(opportunity?.city || '');

    // État pour les paramètres de l'opportunité
    const [parameters, setParameters] = useState<OpportunityParameters>({
        annualAppreciation: 2.5,
        loanDuration: 20,
        interestRate: 2.9,
        initialDeposit: 1,
        contribution: 9958,
        works: 0,
        fiscalRegime: 'IS',
        fiscalParts: 1,
        rentalIncomeHC: 0,
        salary: 45000,
        accountant: false,
        gliInsurance: false,
        occupancyGuarantee: false,
    });

    // Loading state
    if (isLoadingOpportunity) {
        return (
            <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
                <div className="text-center text-lg">Chargement de l'opportunité...</div>
            </div>
        );
    }

    // Error state
    if (opportunityError || !opportunity) {
        return (
            <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
                <div className="text-center text-lg text-red-600">
                    {opportunityError ? 'Erreur lors du chargement' : 'Opportunité non trouvée'}
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const badge = BadgeService.getOpportunityStatusBadge(status);
        return (
            <span
                className={`inline-block rounded-full px-4 py-2 text-sm font-medium text-white ${badge.color}`}
            >
                {badge.text}
            </span>
        );
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    // Calculer les valeurs ajustées basées sur les paramètres
    const calculateAdjustedValues = () => {
        const price = opportunity.price || 0;
        let rentalYield = opportunity.rentalYield;
        let annualRentalRevenue = opportunity.annualRentalRevenue;
        
        // If no rental data, provide reasonable estimates based on property type
        if (!rentalYield && !annualRentalRevenue && price > 0) {
            const defaultYields = {
                APARTMENT: 4.5,
                BUILDING: 5.5,
                HOUSE: 4.0,
            };
            
            rentalYield = defaultYields[opportunity.type as keyof typeof defaultYields] || 4.5;
            annualRentalRevenue = Math.round((price * rentalYield) / 100);
        } else if (rentalYield && !annualRentalRevenue) {
            annualRentalRevenue = Math.round((price * rentalYield) / 100);
        } else if (!rentalYield && annualRentalRevenue) {
            rentalYield = price > 0 ? (annualRentalRevenue / price) * 100 : 0;
        }

        const adjustedPrice = price + parameters.works;
        const finalRentalYield = parameters.rentalIncomeHC > 0
            ? (parameters.rentalIncomeHC / adjustedPrice) * 100
            : rentalYield || 0;
        const finalAnnualRevenue = parameters.rentalIncomeHC > 0
            ? parameters.rentalIncomeHC
            : annualRentalRevenue || 0;

        return {
            price: adjustedPrice,
            rentalYield: finalRentalYield,
            annualRentalRevenue: finalAnnualRevenue,
            monthlyLoan: adjustedPrice > parameters.contribution 
                ? ((adjustedPrice - parameters.contribution) *
                    (parameters.interestRate / 100 / 12) *
                    Math.pow(1 + parameters.interestRate / 100 / 12, parameters.loanDuration * 12)) /
                  (Math.pow(1 + parameters.interestRate / 100 / 12, parameters.loanDuration * 12) - 1)
                : 0,
        };
    };

    const adjustedValues = calculateAdjustedValues();

    return (
        <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
            {/* Bandeau de paramètres */}
            <OpportunityParametersPanel
                parameters={parameters}
                onParametersChange={setParameters}
            />

            {/* En-tête */}
            <div className="mb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold">{opportunity.title}</h1>
                        <p className="mb-4 text-gray-600">situé à {opportunity.city}</p>
                        <div className="mb-4 flex gap-4">{getStatusBadge(opportunity.status)}</div>
                    </div>
                    <div className="text-right">
                        <div className="grid grid-cols-4 gap-8 text-center">
                            <div>
                                <p className="text-sm text-gray-600">RCI</p>
                                <p className="text-2xl font-bold">0 %</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Prix du projet</p>
                                <p className="text-2xl font-bold">
                                    {formatPrice(adjustedValues.price)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Rendement</p>
                                <p className="text-2xl font-bold">
                                    {adjustedValues.rentalYield?.toFixed(1)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Revenu locatif</p>
                                <p className="text-2xl font-bold">
                                    {adjustedValues.annualRentalRevenue
                                        ? formatPrice(adjustedValues.annualRentalRevenue)
                                        : 'Inconnu'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description du bien */}
            <div className="mb-6">
                <p className="text-gray-700">
                    {opportunity.description || `Ce bien est situé dans la ville`}{' '}
                    <span className="font-medium text-blue-600">{opportunity.city}</span>
                    {opportunity.postalCode && (
                        <>, code postal <span className="font-medium">{opportunity.postalCode}</span></>
                    )}
                    . Les revenus locatifs de ce bien sont de
                    <span className="font-medium">
                        {' '}
                        {adjustedValues.annualRentalRevenue
                            ? formatPrice(adjustedValues.annualRentalRevenue) + '/an'
                            : '0€/an'}
                    </span>
                    . Sa surface totale est de{' '}
                    <span className="font-medium">{opportunity.surface} m²</span>.
                    {parameters.works > 0 && (
                        <span className="font-medium text-orange-600">
                            {' '}
                            Travaux prévus : {formatPrice(parameters.works)}.
                        </span>
                    )}
                </p>
            </div>

            {/* Images du bien - Use default placeholder since backend doesn't provide images yet */}
            <div className="mb-8">
                <div className="mb-4 flex gap-6">
                    {/* Image principale */}
                    <div className="w-1/3">
                        <img
                            src={opportunity.image || '/placeholder-property.jpg'}
                            alt="Vue principale"
                            className="h-64 w-full rounded-lg object-cover"
                        />
                    </div>
                    {/* Images secondaires */}
                    <div className="w-1/3">
                        <img
                            src="/placeholder-property.jpg"
                            alt="Vue secondaire"
                            className="h-64 w-full rounded-lg object-cover"
                        />
                    </div>
                    <div className="w-1/3">
                        <img
                            src="/placeholder-property.jpg"
                            alt="Vue extérieure"
                            className="h-64 w-full rounded-lg object-cover"
                        />
                    </div>
                </div>
            </div>

            <div className="flex min-h-[600px] gap-6">
                {/* Colonne de gauche */}
                <div className="flex w-[calc(50%-12px)]">
                    <div className="flex w-full flex-col gap-6">
                        {/* Informations générales */}
                        <OpportunityDetailCard title="Informations générales">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-gray-600">Type de bien</p>
                                    <p className="text-xl font-semibold">
                                        {opportunity.type === 'BUILDING'
                                            ? 'Immeuble'
                                            : opportunity.type === 'APARTMENT'
                                              ? 'Appartement'
                                              : 'Autre'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Surface</p>
                                    <p className="text-xl font-semibold">
                                        {opportunity.surface} m²
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Ville</p>
                                    <p className="text-xl font-semibold">
                                        {opportunity.city}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Code postal</p>
                                    <p className="text-xl font-semibold">
                                        {opportunity.postalCode || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </OpportunityDetailCard>

                        {/* Informations financières */}
                        <OpportunityDetailCard title="Informations financières" className="flex-1">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs text-gray-600">Prix d'achat</p>
                                    <p className="text-xl font-semibold">
                                        {formatPrice(opportunity.price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Prix total projet</p>
                                    <p className="text-xl font-semibold">
                                        {formatPrice(adjustedValues.price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Rendement locatif</p>
                                    <p className="text-xl font-semibold">
                                        {adjustedValues.rentalYield?.toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Revenus annuels</p>
                                    <p className="text-xl font-semibold">
                                        {adjustedValues.annualRentalRevenue
                                            ? formatPrice(adjustedValues.annualRentalRevenue)
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Mensualité emprunt</p>
                                    <p className="text-xl font-semibold">
                                        {formatPrice(adjustedValues.monthlyLoan)}/mois
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Potentiel</p>
                                    <p className="text-xl font-semibold">
                                        {opportunity.potential ? `${opportunity.potential}%` : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Tension locative</p>
                                    <p className="text-xl font-semibold">52%</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">
                                        Tension transactionnelle
                                    </p>
                                    <p className="text-xl font-semibold">47%</p>
                                </div>
                            </div>
                        </OpportunityDetailCard>

                        {/* Informations de contact */}
                        {(opportunity.emailAgent || opportunity.agentPhoneModified) && (
                            <OpportunityDetailCard title="Contact agent">
                                <div className="space-y-4">
                                    {opportunity.emailAgent && (
                                        <div className="flex items-center gap-3">
                                            <Mail size={16} className="text-primary" />
                                            <span>{opportunity.emailAgent}</span>
                                        </div>
                                    )}
                                    {opportunity.agentPhoneModified && (
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-primary" />
                                            <span>{opportunity.agentPhoneModified}</span>
                                        </div>
                                    )}
                                </div>
                            </OpportunityDetailCard>
                        )}

                        {/* Commentaires */}
                        {opportunity.comments && (
                            <OpportunityDetailCard title="Commentaires">
                                <div className="flex items-start gap-3">
                                    <MessageSquare size={16} className="mt-1 text-gray-500" />
                                    <p className="text-gray-700">{opportunity.comments}</p>
                                </div>
                            </OpportunityDetailCard>
                        )}
                    </div>
                </div>

                {/* Colonne de droite */}
                <div className="flex w-[calc(50%-12px)]">
                    <div className="flex w-full flex-col gap-6">
                        {/* Carte de France avec localisation */}
                        <div className="relative flex-1 rounded-xl border border-gray-200 bg-white p-10">
                            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                            <h2 className="mb-6 text-sm text-gray-600">Localisation</h2>
                            <OpportunityMap
                                city={opportunity.city}
                                postalCode={opportunity.postalCode || 0}
                            />
                        </div>

                        {/* Note: Lots and address are not available in the backend yet */}
                        {/* These sections will be commented out until backend support is added */}
                        
                        {/* Address card - placeholder */}
                        <OpportunityDetailCard title="Adresse">
                            <div className="space-y-2">
                                <p className="font-medium">{opportunity.city}</p>
                                {opportunity.postalCode && (
                                    <p>{opportunity.postalCode}</p>
                                )}
                                <p className="text-sm text-gray-500">
                                    Adresse complète disponible après contact
                                </p>
                            </div>
                        </OpportunityDetailCard>
                    </div>
                </div>
            </div>

            {/* Graphiques basés sur les données de la ville */}
            {city && !isLoadingCity && (
                <div className="mt-10">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Analyse du marché locatif - {city.name}
                        </h2>
                        <p className="text-gray-600">Données du marché immobilier local</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Première ligne */}
                        <div className="lg:col-span-1">
                            <SearchDurationChart
                                city={city}
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <AveragePriceChart
                                city={city}
                            />
                        </div>

                        {/* Deuxième ligne */}
                        <div className="lg:col-span-3">
                            <SearchDistributionChart
                                city={city}
                            />
                        </div>

                        {/* Troisième ligne */}
                        <div className="lg:col-span-3">
                            <RentDistributionChart
                                city={city}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Loading state for city data */}
            {isLoadingCity && (
                <div className="mt-10">
                    <div className="text-center text-gray-500">
                        Chargement des données de marché...
                    </div>
                </div>
            )}

            {/* Simulation financière interactive */}
            <div className="mt-10" id="financial-simulation-section">
                <FinancialSimulationChart
                    opportunity={{
                        ...opportunity,
                        price: adjustedValues.price,
                        rentalYield: adjustedValues.rentalYield,
                        annualRentalRevenue: adjustedValues.annualRentalRevenue,
                    }}
                    city={city}
                />
            </div>
        </div>
    );
}
