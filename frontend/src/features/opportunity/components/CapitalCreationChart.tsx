import { CityDto } from '@shared/dto/cityDto';
import { OpportunityDto } from '@shared/dto/opportunityDto';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ComposedChart,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { CashFlowChart } from './CashFlowChart';

interface CapitalCreationChartProps {
    opportunity: OpportunityDto;
    city?: CityDto;
    selectedYear?: number;
}

export function CapitalCreationChart({
    opportunity,
    city,
    selectedYear = 10,
}: CapitalCreationChartProps) {
    // Calculs financiers basés sur l'opportunité
    const calculateFinancialData = () => {
        const purchasePrice = opportunity.price || 0;
        
        // Enhanced rental data calculation with fallbacks
        let rentalYield = opportunity.rentalYield;
        let annualRent = opportunity.annualRentalRevenue;
        
        // If no rental data, provide reasonable estimates based on property type
        if (!rentalYield && !annualRent && purchasePrice > 0) {
            const defaultYields = {
                APARTMENT: 4.5,
                BUILDING: 5.5,
                HOUSE: 4.0,
            };
            
            rentalYield = defaultYields[opportunity.type as keyof typeof defaultYields] || 4.5;
            annualRent = Math.round((purchasePrice * rentalYield) / 100);
        } else if (rentalYield && !annualRent) {
            annualRent = Math.round((purchasePrice * rentalYield) / 100);
        } else if (!rentalYield && annualRent) {
            rentalYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;
        }
        
        // Use the calculated or existing annual rent
        annualRent = annualRent || 0;
        
        const notaryFees = Math.round(purchasePrice * 0.075); // 7.5% frais de notaire
        const loanAmount = Math.round(purchasePrice * 0.8); // 80% d'emprunt
        const monthlyLoan = Math.round((loanAmount * 0.035) / 12); // 3.5% sur 20 ans approximatif
        const annualLoanPayment = monthlyLoan * 12;

        // Calcul de l'appréciation immobilière (2% par an)
        const appreciationRate = 0.02;

        const capitalData = [];
        const valueData = [];
        let cumulativeTreasury = -notaryFees; // Commencer avec les frais de notaire négatifs
        let propertyValue = purchasePrice;
        let remainingLoan = loanAmount;
        let cumulativeSavings = 0;

        // Commencer à partir de l'année 1 (après l'achat)
        for (let year = 1; year <= 30; year++) {
            // Calculs pour chaque année après l'achat
            propertyValue *= 1 + appreciationRate;
            remainingLoan = Math.max(0, remainingLoan - annualLoanPayment * 0.3);
            cumulativeSavings += (annualRent - annualLoanPayment) * 0.7; // Épargne après impôts

            const netCapitalCreated = Math.round(propertyValue - purchasePrice - remainingLoan);
            const annualCashFlow = Math.round(annualRent - annualLoanPayment);
            cumulativeTreasury += annualCashFlow;
            const treasuryExcess = Math.round(cumulativeTreasury);

            // Données pour le graphique principal (Création de capital)
            const propertyAppreciation = Math.round(propertyValue - purchasePrice);
            const realEstateCapital = Math.round(purchasePrice - remainingLoan);
            const taxes = Math.round(-annualRent * 0.3 * year);

            capitalData.push({
                year,
                acquisitionCosts: 0, // Pas de frais d'acquisition après l'achat
                treasuryExcess: Math.max(treasuryExcess, 0),
                treasuryDeficit: Math.min(treasuryExcess, 0),
                propertyAppreciation,
                realEstateCapital,
                netCapitalCreated,
                taxes,
                propertyValue: Math.round(propertyValue),
                remainingLoan: Math.round(remainingLoan),
                annualCashFlow,
                cumulativeCashFlow: Math.round(cumulativeTreasury),
            });

            // Données pour le graphique secondaire (Création de valeur brute)
            const cumulativeTreasuryAfterTax = Math.round(cumulativeSavings);
            const realEstateCapitalValue = Math.round(purchasePrice - remainingLoan);
            const cumulativeSecurity = Math.round(cumulativeSavings * 0.1); // 10% en épargne de sécurité

            valueData.push({
                year,
                cumulativeTreasuryAfterTax: Math.max(cumulativeTreasuryAfterTax, 0),
                cumulativeTreasuryDeficit: Math.min(cumulativeTreasuryAfterTax, 0),
                realEstateCapitalValue,
                cumulativeSecurity,
            });
        }

        return { capitalData, valueData };
    };

    const { capitalData, valueData } = calculateFinancialData();
    const finalCapitalData = capitalData[capitalData.length - 1];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            // Find the data object that matches the year (label)
            // Since years start from 1 and array is zero-indexed, use label - 1
            const yearData = capitalData[label - 1];
            
            // Safety check to ensure yearData exists
            if (!yearData) {
                return null;
            }
            
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-black shadow-lg">
                    <p className="mb-2 font-semibold">Année {label}</p>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                            <p>
                                Valeur du bien: {yearData.propertyValue?.toLocaleString('fr-FR') || 'N/A'} €
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                            <p>
                                Emprunt restant: {yearData.remainingLoan?.toLocaleString('fr-FR') || 'N/A'} €
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                            <p>
                                Cash-flow annuel: {yearData.annualCashFlow?.toLocaleString('fr-FR') || 'N/A'}{' '}
                                €
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                            <p>
                                Trésorerie cumulée:{' '}
                                {yearData.cumulativeCashFlow?.toLocaleString('fr-FR') || 'N/A'} €
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <p>
                                Capital net créé:{' '}
                                {yearData.netCapitalCreated?.toLocaleString('fr-FR') || 'N/A'} €
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Titre de la section */}
            <div>
                <h3 className="text-xl font-semibold text-white">
                    Création de <span className="text-blue-400">capital</span>*
                </h3>
            </div>

            {/* Premier graphique - Capital net créé */}
            <div className="space-y-4">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={capitalData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                label={{
                                    value: "NOMBRE D'ANNÉES",
                                    position: 'insideBottom',
                                    offset: -5,
                                    style: {
                                        textAnchor: 'middle',
                                        fontSize: '12px',
                                        fill: '#9CA3AF',
                                    },
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                label={{
                                    value: 'CAPITAL NET CRÉÉ (€)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: {
                                        textAnchor: 'middle',
                                        fontSize: '12px',
                                        fill: '#9CA3AF',
                                    },
                                }}
                            />
                            <Tooltip content={<CustomTooltip />} />

                            {/* Barres empilées */}
                            <Bar
                                dataKey="acquisitionCosts"
                                stackId="a"
                                fill="#1E40AF"
                                name="Frais d'acquisition"
                            />
                            <Bar
                                dataKey="treasuryDeficit"
                                stackId="a"
                                fill="#3B82F6"
                                name="Excédent de trésorerie"
                            />
                            <Bar
                                dataKey="treasuryExcess"
                                stackId="a"
                                fill="#60A5FA"
                                name="Excédent de trésorerie"
                            />
                            <Bar
                                dataKey="propertyAppreciation"
                                stackId="a"
                                fill="#93C5FD"
                                name="Plus-value immobilière"
                            />
                            <Bar
                                dataKey="realEstateCapital"
                                stackId="a"
                                fill="#1E3A8A"
                                name="Capital immobilier"
                            />
                            <Bar
                                dataKey="taxes"
                                stackId="a"
                                fill="#7C3AED"
                                name="Impôts sur société"
                            />

                            {/* Ligne de référence */}
                            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />

                            {/* Ligne pour le capital net créé */}
                            <Line
                                type="monotone"
                                dataKey="netCapitalCreated"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Légende pour le premier graphique */}
                <div className="grid grid-cols-3 gap-4 pt-6 text-sm">
                    <div className="flex items-center gap-2 pl-12">
                        <div className="h-4 w-4 rounded bg-blue-400"></div>
                        <span className="text-white">EXCÉDENT DE TRÉSORERIE</span>
                    </div>
                    <div className="flex items-center gap-2 pl-12">
                        <div className="h-4 w-4 rounded bg-blue-600"></div>
                        <span className="text-white">FRAIS D'ACQUISITION</span>
                    </div>
                    <div className="flex items-center gap-2 pl-12">
                        <div className="h-4 w-4 rounded bg-purple-600"></div>
                        <span className="text-white">IMPÔTS SUR SOCIÉTÉ</span>
                    </div>
                    <div className="flex items-center gap-2 pl-12">
                        <div className="h-4 w-4 rounded bg-blue-300"></div>
                        <span className="text-white">PLUS VALUE IMMOBILIÈRE</span>
                    </div>
                    <div className="flex items-center gap-2 pl-12">
                        <div className="h-4 w-4 rounded bg-blue-800"></div>
                        <span className="text-white">CAPITAL IMMOBILIER</span>
                    </div>
                    <div className="flex items-center gap-2 pl-12">
                        <div className="h-4 w-4 rounded bg-green-500"></div>
                        <span className="text-white">CAPITAL NET CRÉÉ</span>
                    </div>
                </div>
            </div>

            {/* Deuxième graphique - Création de valeur brute */}
            <div className="space-y-4">
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={valueData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                label={{
                                    value: 'Année',
                                    position: 'insideBottom',
                                    offset: -5,
                                    style: {
                                        textAnchor: 'middle',
                                        fontSize: '12px',
                                        fill: '#9CA3AF',
                                    },
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                label={{
                                    value: 'Création de valeur brute (€)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: {
                                        textAnchor: 'middle',
                                        fontSize: '12px',
                                        fill: '#9CA3AF',
                                    },
                                }}
                            />
                            <Tooltip />

                            {/* Barres empilées pour le deuxième graphique */}
                            <Bar
                                dataKey="cumulativeTreasuryDeficit"
                                stackId="b"
                                fill="#10B981"
                                name="Trésorerie cumulée nette d'impôt"
                            />
                            <Bar
                                dataKey="cumulativeTreasuryAfterTax"
                                stackId="b"
                                fill="#10B981"
                                name="Trésorerie cumulée nette d'impôt"
                            />
                            <Bar
                                dataKey="realEstateCapitalValue"
                                stackId="b"
                                fill="#3B82F6"
                                name="Capital immobilier"
                            />
                            <Bar
                                dataKey="cumulativeSecurity"
                                stackId="b"
                                fill="#60A5FA"
                                name="Épargne de Sécurité Cumulée"
                            />

                            {/* Ligne de référence */}
                            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="2 2" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Légende pour le deuxième graphique */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-green-500"></div>
                        <span className="text-white">Trésorerie cumulée nette d'impôt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-blue-500"></div>
                        <span className="text-white">Capital immobilier</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-blue-400"></div>
                        <span className="text-white">Épargne de Sécurité Cumulée</span>
                    </div>
                </div>
            </div>

            {/* Métriques de fin */}
            <div className="grid grid-cols-3 gap-8 border-t border-gray-700 pt-6">
                <div className="text-right">
                    <p className="text-sm text-gray-400">Trésorerie fin année 2</p>
                    <p className="text-lg font-semibold text-white">
                        {capitalData[2]?.cumulativeCashFlow.toLocaleString('fr-FR')} €
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Trésorerie fin année 20</p>
                    <p className="text-lg font-semibold text-white">
                        {capitalData[20]?.cumulativeCashFlow.toLocaleString('fr-FR')} €
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Capital créé en 20 ans</p>
                    <p className="text-lg font-semibold text-white">
                        {finalCapitalData.netCapitalCreated.toLocaleString('fr-FR')} €
                    </p>
                </div>
            </div>

            {/* Graphique de flux de trésorerie */}
            <div className="mt-12 border-t border-gray-700 pt-8">
                <CashFlowChart
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
        </div>
    );
}
