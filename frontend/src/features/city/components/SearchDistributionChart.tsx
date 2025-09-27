import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const searchDistributionData = [
    { jours: 10, T1: 25, T2: 28, T3: 30, T4: 32 },
    { jours: 20, T1: 40, T2: 45, T3: 50, T4: 55 },
    { jours: 30, T1: 55, T2: 60, T3: 63, T4: 68 },
    { jours: 40, T1: 70, T2: 72, T3: 75, T4: 78 },
    { jours: 60, T1: 80, T2: 82, T3: 85, T4: 88 },
    { jours: 80, T1: 90, T2: 92, T3: 94, T4: 96 },
    { jours: 100, T1: 97, T2: 98, T3: 99, T4: 99 },
    { jours: 120, T1: 100, T2: 100, T3: 100, T4: 100 },
];

const colorTertiary = '#1d223e';
const colorSecondary = '#2563eb';
const colorBlueLight = '#7DB3FF';

export function SearchDistributionChart() {
    return (
        <div className="h-full rounded-[1rem] border border-gray-200 bg-white p-10">
            <h2 className="mb-6 text-sm text-gray-600">
                Distribution du temps de recherche d'un locataire
            </h2>
            <div className="flex h-[320px] w-full">
                <ResponsiveContainer width="95%" height="100%">
                    <LineChart
                        data={searchDistributionData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <XAxis
                            dataKey="jours"
                            type="number"
                            domain={['dataMin', 'dataMax']}
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
                            label={{
                                value: 'Durée de recherche (en jours)',
                                position: 'insideTop',
                                offset: -30,
                                style: {
                                    fill: '#4b5563',
                                    fontSize: 14,
                                    fontWeight: 600,
                                },
                            }}
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
                            domain={[0, 100]}
                            label={{
                                value: 'Proportion du marché (%)',
                                angle: 0,
                                position: 'insideTopLeft',
                                dx: 70,
                                style: {
                                    fill: '#4b5563',
                                    fontSize: 14,
                                    fontWeight: 600,
                                },
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                fontSize: '14px',
                            }}
                            formatter={(value: number) => [`${value} %`, 'Proportion']}
                            cursor={{
                                stroke: colorSecondary,
                                strokeWidth: 1,
                                opacity: 0.1,
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="T1"
                            name="T1"
                            stroke={colorBlueLight}
                            strokeWidth={3}
                            dot={false}
                            activeDot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="T2"
                            name="T2"
                            stroke={colorSecondary}
                            strokeWidth={3}
                            dot={false}
                            activeDot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="T3"
                            name="T3"
                            stroke={colorTertiary}
                            strokeWidth={3}
                            dot={false}
                            activeDot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="T4"
                            name="T4"
                            stroke={colorTertiary}
                            strokeWidth={3}
                            dot={false}
                            activeDot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <div className="mb-4 flex items-center">
                    <div className="flex h-full flex-col items-start justify-start gap-4">
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-sm"
                                style={{ backgroundColor: colorBlueLight }}
                            ></div>
                            <span className="text-sm font-medium text-gray-600">T1</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-sm"
                                style={{ backgroundColor: colorSecondary }}
                            ></div>
                            <span className="text-sm font-medium text-gray-600">T2</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-sm"
                                style={{ backgroundColor: colorTertiary }}
                            ></div>
                            <span className="text-sm font-medium text-gray-600">T3</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-4 w-4 rounded-sm"
                                style={{ backgroundColor: colorTertiary }}
                            ></div>
                            <span className="text-sm font-medium text-gray-600">T4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
