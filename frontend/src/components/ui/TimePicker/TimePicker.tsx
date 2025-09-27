interface TimePickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const TimePicker = ({ label, value, onChange, disabled = false }: TimePickerProps) => {
    return (
        <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
        </div>
    );
};
