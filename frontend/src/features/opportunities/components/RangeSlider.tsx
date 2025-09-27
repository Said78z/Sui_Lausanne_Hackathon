import * as Slider from '@radix-ui/react-slider';

interface RangeSliderProps {
    label: string;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    min?: number;
    max?: number;
    step?: number;
    suffix?: string;
    legend?: boolean;
}

export function RangeSlider({
    label,
    value,
    onChange,
    min = 0,
    max = 1000,
    step = 25,
    suffix = 'K€',
    legend = true,
}: RangeSliderProps) {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex flex-col gap-2">
                <Slider.Root
                    className="relative flex h-5 w-full touch-none select-none items-center"
                    value={value}
                    onValueChange={(values) => onChange([values[0], values[1]])}
                    min={min}
                    max={max}
                    step={step}
                >
                    <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                        <Slider.Range className="absolute h-full rounded-full bg-blue-600" />
                    </Slider.Track>
                    <Slider.Thumb
                        className="block h-5 w-5 rounded-full border-2 border-blue-600 bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        aria-label="Min value"
                    />
                    <Slider.Thumb
                        className="block h-5 w-5 rounded-full border-2 border-blue-600 bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        aria-label="Max value"
                    />
                </Slider.Root>
                <div className="flex justify-between text-sm text-gray-400">
                    <span>
                        {min}
                        {suffix}
                    </span>
                    <span>
                        {max}
                        {suffix}
                    </span>
                </div>
                {legend && (
                    <div className="mt-2 text-center text-sm font-semibold">
                        {value[0]}
                        {suffix} – {value[1]}
                        {suffix}
                    </div>
                )}
            </div>
        </div>
    );
}
