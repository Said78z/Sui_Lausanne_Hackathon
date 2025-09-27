import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const searchDurationData = [
    { type: 'T1', days: 45 },
    { type: 'T2', days: 30 },
    { type: 'T3', days: 25 },
    { type: 'T4', days: 20 },
];

const colorTertiary = '#1d223e';
const colorSecondary = '#2563eb';

export function SearchDurationChart() {
    return (
        <div className="h-full rounded-[1rem] border border-gray-200 bg-white p-10">
            <h2 className="mb-6 text-sm text-gray-600">
                Durée moyenne de recherche par type de logement
            </h2>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={searchDurationData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barSize={40}
                    >
                        <XAxis
                            dataKey="type"
                            tick={{
                                fill: colorTertiary,
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                            axisLine={{
                                stroke: '#e5e7eb',
                                strokeWidth: 1,
                            }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{
                                fill: colorTertiary,
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                            axisLine={{
                                stroke: '#e5e7eb',
                                strokeWidth: 1,
                            }}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '14px',
                            }}
                            formatter={(value: number) => [`${value} jours`, 'Durée moyenne']}
                            cursor={{ fill: colorSecondary + '11' }}
                        />
                        <Bar dataKey="days" fill={colorTertiary} radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
