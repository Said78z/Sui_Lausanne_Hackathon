import { TrendingUp } from 'lucide-react';
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface MonthlyStats {
    name: string;
    biensCompromis: number;
    clientsInteresses: number;
    totalBiens: number;
}

interface StatsSectionProps {
    monthlyStats: MonthlyStats[];
}

export function StatsSection({ monthlyStats }: StatsSectionProps) {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 rounded-xl border border-gray-200 bg-white p-10">
                <div className="flex gap-4">
                    <div className="mt-12 flex flex-col gap-2">
                        <div className="flex items-center">
                            <h2 className="flex items-center gap-2 px-2 text-4xl font-medium">
                                50% <TrendingUp size={24} />
                            </h2>
                        </div>
                        <div className="mt-2 flex flex-col gap-2 pl-8 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="mr-1 h-1 w-5 rounded-full bg-[#1d223e]"></div>
                                <span>Biens en compromis</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="mr-1 h-1 w-5 rounded-full bg-gray-200"></div>
                                <span>Clients intéressés</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="mr-1 h-1 w-5 rounded-full bg-[#2563eb]"></div>
                                <span>Total biens proposés</span>
                            </div>
                        </div>
                    </div>
                    <div className="mx-10 mt-4 h-52 w-2/3">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={10} />
                                <YAxis fontSize={10} />
                                <Tooltip />
                                <Bar
                                    dataKey="biensCompromis"
                                    stackId="a"
                                    fill="#1d223e"
                                    barSize={20}
                                    radius={0}
                                />
                                <Bar
                                    dataKey="clientsInteresses"
                                    stackId="a"
                                    fill="#e5e7eb"
                                    barSize={20}
                                    radius={[4, 4, 0, 0]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="totalBiens"
                                    stroke="#2563eb"
                                    dot={{ r: 2 }}
                                    strokeWidth={2}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
