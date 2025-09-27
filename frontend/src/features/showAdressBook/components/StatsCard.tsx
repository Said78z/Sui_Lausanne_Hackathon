interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
    return (
        <div className="relative rounded-xl border p-10">
            {icon && <div className="mb-2">{icon}</div>}
            <h3 className="text-sm text-gray-600">{title}</h3>
            <p className="text-4xl font-semibold">{value}</p>
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
        </div>
    );
}
