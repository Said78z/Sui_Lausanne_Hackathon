import { CityDto } from '@shared/dto/cityDto';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

interface RentDistributionChartProps {
    city?: CityDto;
}

export function RentDistributionChart({ city }: RentDistributionChartProps) {
    // Calcul des données de distribution basé sur les données de la ville
    const calculateDistribution = () => {
        if (!city) {
            // Données par défaut
            return [
                { price: 300, T1: 30, T2: 8, T3: 0, T4: 0 },
                { price: 500, T1: 65, T2: 15, T3: 0, T4: 0 },
                { price: 600, T1: 88, T2: 30, T3: 0, T4: 0 },
                { price: 700, T1: 95, T2: 65, T3: 18, T4: 0 },
                { price: 800, T1: 98, T2: 90, T3: 50, T4: 0 },
                { price: 900, T1: 100, T2: 95, T3: 85, T4: 18 },
                { price: 1000, T1: 100, T2: 98, T3: 95, T4: 50 },
                { price: 1100, T1: 100, T2: 100, T3: 98, T4: 85 },
                { price: 1200, T1: 100, T2: 100, T3: 100, T4: 95 },
                { price: 1300, T1: 100, T2: 100, T3: 100, T4: 98 },
            ];
        }

        // Facteurs basés sur les données de la ville
        const incomeFactor = (city.medianIncome || 20000) / 20000;
        const tensionFactor = (city.rentalTension || 3) / 5;
        const densityFactor = Math.min((city.populationDensity || 3000) / 10000, 1);

        // Décalage des prix (plus élevé = prix plus hauts)
        const priceShift = (incomeFactor + tensionFactor + densityFactor) / 3;
        const baseShift = Math.round(priceShift * 200); // Décalage de 0 à 200€

        return [
            {
                price: 300 + baseShift,
                T1: 30,
                T2: 8,
                T3: 0,
                T4: 0,
            },
            {
                price: 500 + baseShift,
                T1: 65,
                T2: 15,
                T3: 0,
                T4: 0,
            },
            {
                price: 600 + baseShift,
                T1: 88,
                T2: 30,
                T3: 0,
                T4: 0,
            },
            {
                price: 700 + baseShift,
                T1: 95,
                T2: 65,
                T3: 18,
                T4: 0,
            },
            {
                price: 800 + baseShift,
                T1: 98,
                T2: 90,
                T3: 50,
                T4: 0,
            },
            {
                price: 900 + baseShift,
                T1: 100,
                T2: 95,
                T3: 85,
                T4: 18,
            },
            {
                price: 1000 + baseShift,
                T1: 100,
                T2: 98,
                T3: 95,
                T4: 50,
            },
            {
                price: 1100 + baseShift,
                T1: 100,
                T2: 100,
                T3: 98,
                T4: 85,
            },
            {
                price: 1200 + baseShift,
                T1: 100,
                T2: 100,
                T3: 100,
                T4: 95,
            },
            {
                price: 1300 + baseShift,
                T1: 100,
                T2: 100,
                T3: 100,
                T4: 98,
            },
        ];
    };

    const data = calculateDistribution();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Distribution des montants des loyers
                </h3>
                {city && (
                    <p className="text-sm text-gray-600">
                        Données pour {city.name} - Revenu médian:{' '}
                        {city.medianIncome ? `${city.medianIncome}€` : 'N/A'}
                    </p>
                )}
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="price"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#666' }}
                            label={{
                                value: 'Prix du loyer (€)',
                                position: 'insideBottom',
                                offset: -5,
                                style: { textAnchor: 'middle', fontSize: '12px', fill: '#666' },
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#666' }}
                            domain={[0, 100]}
                            label={{
                                value: 'Proportion cumulée (%)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fontSize: '12px', fill: '#666' },
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                            type="monotone"
                            dataKey="T1"
                            stroke="#93C5FD"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="T1"
                        />
                        <Line
                            type="monotone"
                            dataKey="T2"
                            stroke="#60A5FA"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="T2"
                        />
                        <Line
                            type="monotone"
                            dataKey="T3"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="T3"
                        />
                        <Line
                            type="monotone"
                            dataKey="T4"
                            stroke="#1E3A8A"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            name="T4"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
