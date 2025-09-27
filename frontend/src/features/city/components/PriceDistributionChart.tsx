import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const priceDistributionData = [
    { prix: 300, T1: 0, T2: 0, T3: 0, T4: 0 },
    { prix: 400, T1: 2, T2: 0, T3: 0, T4: 0 },
    { prix: 500, T1: 10, T2: 2, T3: 0, T4: 0 },
    { prix: 600, T1: 30, T2: 10, T3: 2, T4: 0 },
    { prix: 700, T1: 60, T2: 30, T3: 10, T4: 2 },
    { prix: 900, T1: 90, T2: 60, T3: 30, T4: 10 },
    { prix: 1100, T1: 100, T2: 90, T3: 60, T4: 30 },
    { prix: 1300, T1: 100, T2: 100, T3: 90, T4: 60 },
    { prix: 1500, T1: 100, T2: 100, T3: 100, T4: 90 },
    { prix: 2000, T1: 100, T2: 100, T3: 100, T4: 100 },
    { prix: 3000, T1: 100, T2: 100, T3: 100, T4: 100 },
    { prix: 4000, T1: 100, T2: 100, T3: 100, T4: 100 },
];

const colorTertiary = '#1d223e';
const colorSecondary = '#2563eb';
const colorBlueLight = '#7DB3FF';

export function PriceDistributionChart() {
    return (
        <div className="h-full rounded-[1rem] border border-gray-200 bg-white p-10">
            <h2 className="mb-6 text-sm text-gray-600">Distribution du prix des logements</h2>
            <div className="flex h-[320px] w-full">
                <ResponsiveContainer width="95%" height="100%">
                    <LineChart
                        data={priceDistributionData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <XAxis
                            dataKey="prix"
                            type="number"
                            domain={[0, 4000]}
                            tick={{
                                fill: colorTertiary,
                                fontWeight: 600,
                                fontSize: 16,
                            }}
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                            tickLine={false}
                            label={{
                                value: 'Prix du loyer (€)',
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
                            axisLine={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                            tickLine={false}
                            domain={[0, 100]}
                            label={{
                                value: 'Proportion du marché au prix max (%)',
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
