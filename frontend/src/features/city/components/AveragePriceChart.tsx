import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const averagePriceData = [
    { type: 'T1', meuble: 600, nonMeuble: 630 },
    { type: 'T2', meuble: 950, nonMeuble: 750 },
    { type: 'T3', meuble: 1200, nonMeuble: 1050 },
    { type: 'T4+', meuble: 1350, nonMeuble: 1200 },
];

const colorTertiary = '#1d223e';
const colorSecondary = '#2563eb';

export function AveragePriceChart() {
    return (
        <div className="h-full rounded-[1rem] border border-gray-200 bg-white p-10">
            <h2 className="mb-6 text-sm text-gray-600">
                Prix moyen des logements par type de logement
            </h2>
            <div className="flex h-[250px] w-full">
                <ResponsiveContainer width="80%" height="100%">
                    <BarChart
                        data={averagePriceData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barCategoryGap={32}
                        barSize={40}
                    >
                        <XAxis
                            dataKey="type"
                            tick={{
                                fill: colorTertiary,
                                fontWeight: 600,
                                fontSize: 16,
                            }}
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{
                                fill: colorTertiary,
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
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
                            formatter={(value: number) => [`${value} €`, 'Prix moyen']}
                            cursor={{ fill: colorSecondary + '11' }}
                        />
                        <Bar
                            dataKey="meuble"
                            name="Meublé"
                            fill={colorSecondary}
                            radius={[8, 8, 0, 0]}
                        />
                        <Bar
                            dataKey="nonMeuble"
                            name="Non meublé"
                            fill={colorTertiary}
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
                <div className="mb-4 flex items-center">
                    <div className="flex h-full flex-col items-start justify-start gap-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-sm"
                                style={{ backgroundColor: colorSecondary }}
                            ></div>
                            <span className="text-sm font-medium text-gray-600">Meublé</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-sm"
                                style={{ backgroundColor: colorTertiary }}
                            ></div>
                            <span className="text-sm font-medium text-gray-600">Non meublé</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
