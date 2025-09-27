import { useEffect, useRef, useState } from 'react';

import { CityDto } from '@shared/dto/cityDto';
import { OpportunityDto } from '@shared/dto/opportunityDto';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { SelectInput } from '@/components/ui/SelectInput/SelectInput';

import { CapitalCreationChart } from './CapitalCreationChart';
import { FiscalAnalysisChart } from './FiscalAnalysisChart';

interface FinancialSimulationChartProps {
    opportunity: OpportunityDto;
    city?: CityDto;
}

export function FinancialSimulationChart({ opportunity, city }: FinancialSimulationChartProps) {
    const [selectedYear, setSelectedYear] = useState(10);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [headerPosition, setHeaderPosition] = useState<'static' | 'fixed' | 'absolute'>('static');
    const [headerTop, setHeaderTop] = useState(0);

    const headerRef = useRef<HTMLDivElement>(null);
    const placeholderRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Enhanced metrics calculation with better fallbacks
    const calculateMetrics = () => {
        const price = opportunity.price || 0;
        
        // If we don't have rentalYield or annualRentalRevenue, estimate reasonable defaults
        let rentalYield = opportunity.rentalYield;
        let annualRentalRevenue = opportunity.annualRentalRevenue;
        
        // If no rental data, provide reasonable estimates based on property type and price
        if (!rentalYield && !annualRentalRevenue && price > 0) {
            // Default yields by property type (rough estimates for French market)
            const defaultYields = {
                APARTMENT: 4.5,  // 4.5% for apartments
                BUILDING: 5.5,   // 5.5% for buildings
                HOUSE: 4.0,      // 4.0% for houses
            };
            
            rentalYield = defaultYields[opportunity.type as keyof typeof defaultYields] || 4.5;
            annualRentalRevenue = Math.round((price * rentalYield) / 100);
        } else if (rentalYield && !annualRentalRevenue) {
            // Calculate revenue from yield
            annualRentalRevenue = Math.round((price * rentalYield) / 100);
        } else if (!rentalYield && annualRentalRevenue) {
            // Calculate yield from revenue
            rentalYield = price > 0 ? (annualRentalRevenue / price) * 100 : 0;
        }

        return {
            projectPrice: price,
            notaryFees: Math.round(price * 0.075),
            grossReturn: rentalYield || 0,
            grossTRI: 0, // À calculer selon la logique métier
            loan: price > 0 ? Math.round((price * 0.8 * 0.035) / 12) : 0,
            estimatedWorks: 0,
            rentalIncome: annualRentalRevenue || 0,
            detailedYear: selectedYear,
        };
    };

    // Métriques principales calculées
    const metrics = calculateMetrics();

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, []);

    // Recalculer la hauteur du header quand il est réduit/étendu
    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.offsetHeight);
        }
    }, [isHeaderCollapsed]);

    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current && contentRef.current && containerRef.current) {
                const containerRect = containerRef.current.getBoundingClientRect();
                const containerTop = containerRect.top + window.scrollY;
                const containerBottom = containerRect.bottom + window.scrollY;
                const scrollPosition = window.scrollY;

                // Position où le header doit commencer à être fixe (compenser le padding de 32px + 24px de marge)
                const fixedStartPosition = containerTop + 32 - 24;
                // Position où le header doit s'arrêter d'être fixe
                const fixedEndPosition = containerBottom - headerHeight - 48;

                if (scrollPosition < fixedStartPosition) {
                    // Header en position normale
                    setHeaderPosition('static');
                    setHeaderTop(0);
                } else if (
                    scrollPosition >= fixedStartPosition &&
                    scrollPosition <= fixedEndPosition
                ) {
                    // Header fixe en haut
                    setHeaderPosition('fixed');
                    setHeaderTop(24);
                } else {
                    // Header se décroche et reste en bas du container
                    setHeaderPosition('absolute');
                    setHeaderTop(containerBottom - containerTop - headerHeight - 24);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [headerHeight]);

    return (
        <div
            className="relative rounded-xl border border-gray-200 bg-tertiary p-8 text-white"
            ref={containerRef}
        >
            {/* Placeholder pour maintenir l'espace quand le header est fixe */}
            <div
                ref={placeholderRef}
                style={{ height: headerPosition !== 'static' ? `${headerHeight}px` : '0px' }}
            />

            {/* Header avec métriques - avec positionnement fluide */}
            <div
                ref={headerRef}
                className={`rounded-xl border border-gray-200 bg-tertiary p-8 text-white transition-all duration-300 ease-out ${
                    headerPosition === 'fixed' ? 'z-50 shadow-lg' : ''
                }`}
                style={{
                    position: headerPosition,
                    top: headerPosition === 'static' ? 'auto' : `${headerTop}px`,
                    right: headerPosition === 'fixed' ? '86px' : 'auto',
                    width: headerPosition === 'fixed' ? 'calc(100% - 462px)' : 'auto',
                    margin: '0',
                }}
            >
                {/* En-tête avec titre, bouton chevron et sélecteur d'année */}
                <div
                    className={`flex items-center justify-between transition-all duration-300 ${
                        isHeaderCollapsed ? 'mb-0' : 'mb-6'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold">Simulation financière</h2>

                        {/* Bouton chevron pour réduire/étendre */}
                        <button
                            onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                            className="rounded-lg p-2 transition-colors hover:bg-gray-700"
                            aria-label={
                                isHeaderCollapsed ? 'Étendre le header' : 'Réduire le header'
                            }
                        >
                            {isHeaderCollapsed ? (
                                <ChevronDown className="h-5 w-5 text-gray-300" />
                            ) : (
                                <ChevronUp className="h-5 w-5 text-gray-300" />
                            )}
                        </button>
                    </div>

                    {/* Sélecteur d'année */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-300">Année de simulation :</span>
                        <SelectInput
                            label=""
                            name="selectedYear"
                            value={selectedYear.toString()}
                            onChange={(value) => setSelectedYear(Number(value))}
                            options={Array.from({ length: 30 }, (_, i) => ({
                                value: (i + 1).toString(),
                                label: `Année ${i + 1}`,
                            }))}
                            className="min-w-[150px]"
                        />
                    </div>
                </div>

                {/* Métriques principales - avec transition smooth */}
                <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                        isHeaderCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                    }`}
                >
                    <div className="grid grid-cols-4 gap-8 pt-6">
                        <div>
                            <p className="text-sm text-gray-400">Prix du projet</p>
                            <p className="text-xl font-bold">
                                {metrics.projectPrice.toLocaleString('fr-FR')} €
                            </p>
                            <p className="mt-2 text-sm text-gray-400">Frais de notaire</p>
                            <p className="text-lg">
                                {metrics.notaryFees.toLocaleString('fr-FR')} €
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Rendement brut</p>
                            <p className="text-xl font-bold">{metrics.grossReturn.toFixed(1)} %</p>
                            <p className="mt-2 text-sm text-gray-400">Emprunt</p>
                            <p className="text-lg">{metrics.loan.toLocaleString('fr-FR')} €/mois</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">TRI brut</p>
                            <p className="text-xl font-bold">{metrics.grossTRI} %</p>
                            <p className="mt-2 text-sm text-gray-400">Travaux estimé</p>
                            <p className="text-lg">{metrics.estimatedWorks} €</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400">Revenu locatif</p>
                            <p className="text-xl font-bold">
                                {metrics.rentalIncome.toLocaleString('fr-FR')} €/an
                            </p>
                            <p className="mt-2 text-sm text-gray-400">Année détaillée</p>
                            <p className="text-lg">{metrics.detailedYear}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contenu des sections */}
            <div className="mt-8 space-y-12" ref={contentRef}>
                {/* Section 1: Création de capital */}
                <div>
                    <CapitalCreationChart
                        opportunity={{
                            ...opportunity,
                            rentalYield: opportunity.rentalYield || 0,
                        }}
                        city={
                            city
                                ? {
                                      ...city,
                                      id: city.id,
                                  }
                                : undefined
                        }
                        selectedYear={selectedYear}
                    />
                </div>

                {/* Section 2: Analyse Fiscale */}
                <div className="border-t border-gray-700 pt-8">
                    <FiscalAnalysisChart />
                </div>
            </div>
        </div>
    );
}
