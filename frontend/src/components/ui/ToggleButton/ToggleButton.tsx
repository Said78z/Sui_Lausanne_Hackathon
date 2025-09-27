interface ToggleButtonProps {
    label: string;
    name: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
}

interface ToggleGroupProps {
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function ToggleGroup({ options, value, onChange, className = '' }: ToggleGroupProps) {
    return (
        <div className={`relative grid rounded-lg border grid-cols-${options.length} ${className}`}>
            <div
                className="absolute top-[-1px] h-full rounded-lg bg-tertiary transition-all duration-300"
                style={{
                    width: `calc(${100 / options.length}% )`,
                    left: `${(options.findIndex((opt) => opt.value === value) * 100) / options.length}%`,
                    opacity: 1,
                    height: '2.35rem',
                }}
            />
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="switch"
                    aria-checked={option.value === value}
                    onClick={() => onChange(option.value)}
                    className={`relative z-10 w-full rounded-lg px-6 py-2 text-sm font-medium transition-colors duration-300 ${
                        option.value === value ? 'text-white' : 'text-gray-700'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

export function ToggleButton({
    label,
    name,
    checked,
    onChange,
    className = '',
}: ToggleButtonProps) {
    return (
        <button
            type="button"
            name={name}
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`rounded-lg px-6 py-2 text-sm font-medium transition-colors ${
                checked ? 'bg-tertiary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${className}`}
        >
            {label}
        </button>
    );
}
