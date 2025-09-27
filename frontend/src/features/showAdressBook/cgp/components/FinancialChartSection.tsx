import {
    Bar,
    CartesianGrid,
    ComposedChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface FinancialData {
    name: string;
    gainsTotaux: number;
    gainsPotentiels: number;
    revenusMensuels: number;
}

interface FinancialChartSectionProps {
    financialData: FinancialData[];
}

export function FinancialChartSection({ financialData }: FinancialChartSectionProps) {
    return (
        <div className="relative rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-12 h-10 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Évolution financière</h2>
            <div className="mt-12 h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={financialData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={10} />
                        <YAxis fontSize={10} />
                        <Tooltip />
                        <Bar
                            dataKey="gainsTotaux"
                            fill="#1d223e"
                            barSize={20}
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="gainsPotentiels"
                            fill="#e5e7eb"
                            barSize={20}
                            radius={[4, 4, 0, 0]}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-around text-xs">
                <div className="flex items-center gap-2">
                    <div className="mr-1 h-2 w-8 rounded-full bg-[#1d223e]"></div>
                    <span>Gains totaux</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="mr-1 h-2 w-8 rounded-full bg-[#e5e7eb]"></div>
                    <span>Gains potentiels</span>
                </div>
            </div>
        </div>
    );
}
