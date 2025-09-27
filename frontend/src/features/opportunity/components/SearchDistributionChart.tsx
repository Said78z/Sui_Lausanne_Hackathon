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

interface SearchDistributionChartProps {
    city?: CityDto;
}

export function SearchDistributionChart({ city }: SearchDistributionChartProps) {
    // Calcul des données de distribution basé sur la tension locative
    const calculateDistribution = () => {
        if (!city) {
            // Données par défaut
            return [
                { duration: 0, T1: 25, T2: 18, T3: 50, T4: 48 },
                { duration: 20, T1: 38, T2: 35, T3: 58, T4: 55 },
                { duration: 40, T1: 58, T2: 50, T3: 75, T4: 70 },
                { duration: 60, T1: 70, T2: 70, T3: 80, T4: 75 },
                { duration: 80, T1: 82, T2: 80, T3: 88, T4: 80 },
                { duration: 100, T1: 90, T2: 88, T3: 95, T4: 85 },
                { duration: 120, T1: 98, T2: 95, T3: 100, T4: 95 },
            ];
        }

        // Facteur basé sur la tension locative (plus la tension est élevée, plus la courbe monte rapidement)
        const tensionFactor = (city.rentalTension || 3) / 5;
        const densityFactor = Math.min((city.populationDensity || 3000) / 10000, 1);

        // Vitesse de progression (plus élevée = courbe plus rapide)
        const progressionSpeed = 0.8 + tensionFactor * 0.4 + densityFactor * 0.2;

        return [
            {
                duration: 0,
                T1: Math.round(25 * progressionSpeed),
                T2: Math.round(18 * progressionSpeed),
                T3: Math.round(50 * progressionSpeed),
                T4: Math.round(48 * progressionSpeed),
            },
            {
                duration: 20,
                T1: Math.round(38 * progressionSpeed),
                T2: Math.round(35 * progressionSpeed),
                T3: Math.round(58 * progressionSpeed),
                T4: Math.round(55 * progressionSpeed),
            },
            {
                duration: 40,
                T1: Math.round(58 * progressionSpeed),
                T2: Math.round(50 * progressionSpeed),
                T3: Math.round(75 * progressionSpeed),
                T4: Math.round(70 * progressionSpeed),
            },
            {
                duration: 60,
                T1: Math.round(70 * progressionSpeed),
                T2: Math.round(70 * progressionSpeed),
                T3: Math.round(80 * progressionSpeed),
                T4: Math.round(75 * progressionSpeed),
            },
            {
                duration: 80,
                T1: Math.round(82 * progressionSpeed),
                T2: Math.round(80 * progressionSpeed),
                T3: Math.round(88 * progressionSpeed),
                T4: Math.round(80 * progressionSpeed),
            },
            {
                duration: 100,
                T1: Math.round(90 * progressionSpeed),
                T2: Math.round(88 * progressionSpeed),
                T3: Math.round(95 * progressionSpeed),
                T4: Math.round(85 * progressionSpeed),
            },
            {
                duration: 120,
                T1: Math.round(98 * progressionSpeed),
                T2: Math.round(95 * progressionSpeed),
                T3: Math.round(100 * progressionSpeed),
                T4: Math.round(95 * progressionSpeed),
            },
        ];
    };

    const data = calculateDistribution();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Distribution du temps de recherche d'un locataire
                </h3>
                {city && (
                    <p className="text-sm text-gray-600">
                        Données pour {city.name} - Tension locative: {city.rentalTension || 'N/A'}/5
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
                            dataKey="duration"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#666' }}
                            label={{
                                value: 'Durée de recherche (en jours)',
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
