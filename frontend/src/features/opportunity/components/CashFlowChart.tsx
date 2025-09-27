import { CityDto } from '@shared/dto/cityDto';
import { OpportunityDto } from '@shared/dto/opportunityDto';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface CashFlowChartProps {
    opportunity: OpportunityDto;
    city?: CityDto;
    selectedYear?: number;
}

export function CashFlowChart({ opportunity, selectedYear = 10 }: CashFlowChartProps) {
    // Calcul des données de flux de trésorerie pour une année donnée
    const calculateCashFlowData = () => {
        const purchasePrice = opportunity.price;
        const annualRent =
            opportunity.annualRentalRevenue ||
            (purchasePrice * (opportunity.rentalYield || 0)) / 100;
        const loanAmount = Math.round(purchasePrice * 0.8);
        const monthlyLoan = Math.round((loanAmount * 0.035) / 12);

        // Calculs pour l'année sélectionnée
        const monthlyRent = Math.round(annualRent / 12);
        const provisionsCharges = Math.round(monthlyRent * 0.1); // 10% du loyer
        const charges = Math.round(monthlyRent * 0.05); // 5% du loyer
        const loanInsurance = Math.round(monthlyLoan * 0.1); // 10% de l'emprunt
        const loanInterest = Math.round(monthlyLoan * 0.7); // 70% de l'emprunt sont les intérêts
        const managementFees = Math.round(monthlyRent * 0.08); // 8% du loyer
        const securitySavings = Math.round(monthlyRent * 0.05); // 5% du loyer
        const propertyTax = Math.round((purchasePrice * 0.01) / 12); // 1% du prix par an
        const crl = Math.round(monthlyRent * 0.02); // 2% du loyer
        const taxes = Math.round(monthlyRent * 0.3); // 30% d'impôts
        const loanPrincipal = Math.round(monthlyLoan * 0.3); // 30% de l'emprunt est le capital

        const freeCashFlow =
            monthlyRent -
            provisionsCharges -
            charges -
            loanInsurance -
            loanInterest -
            managementFees -
            securitySavings -
            propertyTax -
            crl -
            taxes -
            loanPrincipal;

        let cumulativeValue = 0;
        const data = [
            {
                name: 'Loyer annuel HC',
                value: monthlyRent,
                cumulative: cumulativeValue + monthlyRent,
                color: '#10B981',
                isPositive: true,
            },
        ];
        cumulativeValue += monthlyRent;

        const expenses = [
            { name: 'Provisions sur charges', value: -provisionsCharges, color: '#7C3AED' },
            { name: 'Charges', value: -charges, color: '#7C3AED' },
            { name: "Assurance de l'emprunt", value: -loanInsurance, color: '#7C3AED' },
            { name: "Intérêts de l'emprunt", value: -loanInterest, color: '#7C3AED' },
            { name: 'Agence de gestion', value: -managementFees, color: '#7C3AED' },
            { name: 'Épargne de sécurité', value: -securitySavings, color: 'orange' },
            { name: 'Taxe foncière', value: -propertyTax, color: '#7C3AED' },
            { name: 'CRL', value: -crl, color: '#7C3AED' },
            { name: 'Impôts', value: -taxes, color: '#7C3AED' },
            { name: 'Emprunt hors intérêts', value: -loanPrincipal, color: '#60A5FA' },
        ];

        expenses.forEach((expense) => {
            cumulativeValue += expense.value;
            data.push({
                name: expense.name,
                value: expense.value,
                cumulative: cumulativeValue,
                color: expense.color,
                isPositive: false,
            });
        });

        // Free Cash Flow final
        data.push({
            name: 'Free Cash Flow',
            value: freeCashFlow,
            cumulative: cumulativeValue,
            color: freeCashFlow >= 0 ? '#10B981' : '#7C3AED',
            isPositive: freeCashFlow >= 0,
        });

        return data;
    };

    const data = calculateCashFlowData();

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-xl font-semibold text-white">Flux de trésorerie</h3>
                <p className="text-sm text-gray-400">Année {selectedYear}</p>
            </div>

            {/* Graphique en cascade */}
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#9CA3AF' }}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            tickFormatter={(value) => `${value.toLocaleString('fr-FR')}€`}
                        />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Affichage des valeurs sur les barres */}
            <div className="text-xs text-gray-400">
                <p>* Simulation pour l'année {selectedYear} après l'achat</p>
                <p>** Montants mensuels en euros</p>
            </div>
        </div>
    );
}
