interface OpportunityDetailCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export default function OpportunityDetailCard({
    title,
    children,
    className = '',
}: OpportunityDetailCardProps) {
    return (
        <div className={`relative rounded-xl border border-gray-200 bg-white p-10 ${className}`}>
            <div className="absolute left-0 top-12 h-10 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">{title}</h2>
            {children}
        </div>
    );
}
