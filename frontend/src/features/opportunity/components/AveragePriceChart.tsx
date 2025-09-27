import { CityDto } from '@shared/dto/cityDto';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface AveragePriceChartProps {
    city?: CityDto;
}

export function AveragePriceChart({ city }: AveragePriceChartProps) {
    // Calcul des prix basé sur les données de la ville
    const calculatePrices = () => {
        if (!city) {
            return [
                { name: 'T1', meuble: 520, nonMeuble: 420 },
                { name: 'T2', meuble: 620, nonMeuble: 560 },
                { name: 'T3', meuble: 900, nonMeuble: 700 },
                { name: 'T4+', meuble: 480, nonMeuble: 800 },
            ];
        }

        // Facteur basé sur le revenu médian et la tension locative
        const incomeFactor = (city.medianIncome || 20000) / 20000;
        const tensionFactor = (city.rentalTension || 3) / 3;
        const densityFactor = Math.min((city.populationDensity || 3000) / 3000, 2);

        const baseFactor = (incomeFactor + tensionFactor + densityFactor) / 3;

        const baseT1 = 450 * baseFactor;
        const baseT2 = 580 * baseFactor;
        const baseT3 = 750 * baseFactor;
        const baseT4 = 650 * baseFactor;

        return [
            {
                name: 'T1',
                meuble: Math.round(baseT1 * 1.2),
                nonMeuble: Math.round(baseT1),
            },
            {
                name: 'T2',
                meuble: Math.round(baseT2 * 1.15),
                nonMeuble: Math.round(baseT2),
            },
            {
                name: 'T3',
                meuble: Math.round(baseT3 * 1.1),
                nonMeuble: Math.round(baseT3),
            },
            {
                name: 'T4+',
                meuble: Math.round(baseT4 * 1.25),
                nonMeuble: Math.round(baseT4),
            },
        ];
    };

    const data = calculatePrices();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Prix moyen des logements</h3>
                {city && <p className="text-sm text-gray-600">Données pour {city.name}</p>}
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        barCategoryGap="20%"
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#666' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#666' }}
                            domain={[0, 'dataMax + 200']}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
                        <Bar dataKey="meuble" fill="#3B82F6" name="Meublé" radius={[2, 2, 0, 0]} />
                        <Bar
                            dataKey="nonMeuble"
                            fill="#1E3A8A"
                            name="Non meublé"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
