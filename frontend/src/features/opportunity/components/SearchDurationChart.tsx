import { CityDto } from '@shared/dto/cityDto';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface SearchDurationChartProps {
    city?: CityDto;
}

export function SearchDurationChart({ city }: SearchDurationChartProps) {
    // Calcul des durées basé sur la tension locative
    const calculateDurations = () => {
        if (!city) {
            return [
                { name: 'T1', duration: 70 },
                { name: 'T2', duration: 50 },
                { name: 'T3', duration: 40 },
                { name: 'T4+', duration: 80 },
            ];
        }

        // Plus la tension locative est élevée, plus la recherche est courte
        const tensionFactor = (city.rentalTension || 3) / 5; // Normalisation sur 5
        const densityFactor = Math.min((city.populationDensity || 3000) / 10000, 1);

        // Durée de base inversement proportionnelle à la tension
        const baseDuration = 90 - tensionFactor * 40 - densityFactor * 20;

        return [
            {
                name: 'T1',
                duration: Math.round(baseDuration * 0.8), // T1 plus rapide
            },
            {
                name: 'T2',
                duration: Math.round(baseDuration * 0.6), // T2 très demandé
            },
            {
                name: 'T3',
                duration: Math.round(baseDuration * 0.5), // T3 le plus demandé
            },
            {
                name: 'T4+',
                duration: Math.round(baseDuration * 1.1), // T4+ plus long
            },
        ];
    };

    const data = calculateDurations();

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Durée moyenne de recherche d'un locataire
                </h3>
                {city && (
                    <p className="text-sm text-gray-600">
                        Données pour {city.name} - Tension locative: {city.rentalTension || 'N/A'}/5
                    </p>
                )}
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
                        barCategoryGap="30%"
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
                            domain={[0, 'dataMax + 10']}
                            label={{
                                value: 'Jour',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fontSize: '12px', fill: '#666' },
                            }}
                        />
                        <Bar
                            dataKey="duration"
                            fill="#93C5FD"
                            name="Location"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
