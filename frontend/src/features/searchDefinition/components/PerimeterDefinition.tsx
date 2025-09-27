import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as Slider from '@radix-ui/react-slider';
import { Building2, Scan } from 'lucide-react';

const CITY_STEPS = [
    { value: 0, key: 'hamlet' },
    { value: 500, key: 'smallVillage' },
    { value: 1000, key: 'village' },
    { value: 3000, key: 'smallTown' },
    { value: 5000, key: 'mediumTown' },
    { value: 10000, key: 'smallCity' },
    { value: 20000, key: 'mediumCity' },
    { value: 30000, key: 'largeCity' },
    { value: 50000, key: 'agglomeration' },
    { value: 75000, key: 'largeAgglomeration' },
    { value: 100000, key: 'urbanPole' },
    { value: 150000, key: 'metropolitanArea' },
    { value: 200000, key: 'metropolis' },
];

const PERIMETER_ZONES = [
    { id: 0, key: 'cityCenter', radius: 30, distance: 0 },
    { id: 1, key: 'adjacentCity', radius: 60, distance: 5 },
    { id: 2, key: 'urbanArea', radius: 90, distance: 15 },
    { id: 3, key: 'influenceArea', radius: 120, distance: 30 },
];

const MIN_INDEX = 0;
const MAX_INDEX = CITY_STEPS.length - 1;

interface PerimeterDefinitionProps {
    onPerimeterChange?: (criteria: { citySize: number; selectedZone: number }) => void;
    initialPerimeter?: { citySize: number; selectedZone: number };
    onCitySizeFlexibilityChange?: (value: number) => void;
    initialCitySizeFlexibility?: number;
}

export default function PerimeterDefinition({
    onPerimeterChange,
    initialPerimeter,
    onCitySizeFlexibilityChange,
    initialCitySizeFlexibility,
}: PerimeterDefinitionProps) {
    const { t } = useTranslation();
    const [stepIndex, setStepIndex] = useState(initialPerimeter?.citySize ?? 1);
    const [citySizeFlexibility, setCitySizeFlexibility] = useState(initialCitySizeFlexibility ?? 0);
    const [selectedZone, setSelectedZone] = useState(initialPerimeter?.selectedZone ?? 0);
    const [hoveredZone, setHoveredZone] = useState<number | null>(null);

    // Update state when initialPerimeter prop changes
    useEffect(() => {
        if (initialPerimeter) {
            setStepIndex(initialPerimeter.citySize);
            setSelectedZone(initialPerimeter.selectedZone);
        }
    }, [initialPerimeter]);

    // Update state when initialCitySizeFlexibility prop changes
    useEffect(() => {
        if (
            initialCitySizeFlexibility !== undefined &&
            initialCitySizeFlexibility !== citySizeFlexibility
        ) {
            setCitySizeFlexibility(initialCitySizeFlexibility);
        }
    }, [initialCitySizeFlexibility]);

    // Notify parent of changes
    useEffect(() => {
        onPerimeterChange?.({ citySize: stepIndex, selectedZone });
    }, [stepIndex, selectedZone, onPerimeterChange]);

    useEffect(() => {
        onCitySizeFlexibilityChange?.(citySizeFlexibility);
    }, [citySizeFlexibility]);

    const handleStepChange = (values: number[]) => {
        setStepIndex(values[0]);
    };

    const handleCitySizeChange = (values: number[]) => {
        setCitySizeFlexibility(values[0]);
    };

    const currentStep = CITY_STEPS[stepIndex];

    const getZoneColor = (zoneId: number) => {
        if (hoveredZone === zoneId) return 'rgba(59, 130, 246, 0.2)';
        if (selectedZone === zoneId) return 'rgba(59, 130, 246, 0.15)';
        return 'rgba(229, 231, 235, 0.1)';
    };

    const getCitySizeFlexibilityText = () => {
        switch (citySizeFlexibility) {
            case 0:
                return t('searchDefinition.perimeter.flexible');
            case 1:
                return t('searchDefinition.perimeter.strict');
            case 2:
                return t('searchDefinition.perimeter.veryStrict');
            default:
                return t('searchDefinition.perimeter.flexible');
        }
    };

    return (
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
            <section className="mb-10">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <Building2 size={20} /> {t('searchDefinition.perimeter.title')}
                    </span>
                    <Slider.Root
                        className="relative flex h-5 w-40 touch-none select-none items-center"
                        value={[citySizeFlexibility]}
                        onValueChange={handleCitySizeChange}
                        min={0}
                        max={2}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={t('searchDefinition.perimeter.flexible')}
                        />
                    </Slider.Root>
                    <p className="text-sm text-gray-400">{getCitySizeFlexibilityText()}</p>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                    {t('searchDefinition.perimeter.description')}
                </p>
                <div className="w-full max-w-xl">
                    <Slider.Root
                        className="relative flex h-5 touch-none select-none items-center"
                        value={[stepIndex]}
                        onValueChange={handleStepChange}
                        min={MIN_INDEX}
                        max={MAX_INDEX}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={t('searchDefinition.perimeter.citySize.title')}
                        />
                    </Slider.Root>
                    <div className="flex justify-between text-sm text-gray-400">
                        {CITY_STEPS.map((step, idx) => (
                            <span
                                key={step.value}
                                className={idx === 0 || idx === MAX_INDEX ? '' : 'hidden sm:inline'}
                            >
                                {step.value >= 1000 ? `${step.value / 1000}k` : step.value}
                            </span>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-2 text-center">
                        <span className="text-lg font-semibold">
                            {t(`searchDefinition.perimeter.citySize.options.${currentStep.key}`)}
                        </span>
                        <p className="text-sm text-gray-400">
                            {currentStep.value.toLocaleString()}{' '}
                            {t('searchDefinition.perimeter.citySize.inhabitants')}
                        </p>
                    </div>
                </div>
            </section>
            <section className="mb-10">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <Scan size={20} /> {t('searchDefinition.perimeter.periphery.title')}
                    </span>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                    {t('searchDefinition.perimeter.periphery.description')}
                </p>

                <div className="relative flex h-[300px] items-center justify-between px-12">
                    <div className="relative h-[300px] w-[300px]">
                        <svg viewBox="0 0 300 300" className="h-full w-full">
                            {PERIMETER_ZONES.slice()
                                .reverse()
                                .map((zone, index) => {
                                    const actualIndex = PERIMETER_ZONES.length - 1 - index;
                                    const prevRadius =
                                        actualIndex === 0
                                            ? 0
                                            : PERIMETER_ZONES[actualIndex - 1].radius;
                                    return (
                                        <g key={zone.id}>
                                            <path
                                                d={`M 150 150 
                                                m -${zone.radius}, 0 
                                                a ${zone.radius},${zone.radius} 0 1,0 ${zone.radius * 2},0 
                                                a ${zone.radius},${zone.radius} 0 1,0 -${zone.radius * 2},0
                                                M 150 150
                                                m -${prevRadius}, 0 
                                                a ${prevRadius},${prevRadius} 0 1,0 ${prevRadius * 2},0 
                                                a ${prevRadius},${prevRadius} 0 1,0 -${prevRadius * 2},0`}
                                                fill={getZoneColor(zone.id)}
                                                stroke="rgb(16, 20, 44)"
                                                strokeWidth="1"
                                                className="cursor-pointer transition-all duration-200"
                                                onMouseEnter={(e) => {
                                                    e.stopPropagation();
                                                    setHoveredZone(zone.id);
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.stopPropagation();
                                                    setHoveredZone(null);
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedZone(zone.id);
                                                }}
                                            />
                                        </g>
                                    );
                                })}
                        </svg>
                    </div>
                    <div className="ml-8 flex flex-col items-start">
                        <p className="text-lg font-semibold">
                            {t(
                                `searchDefinition.perimeter.periphery.zones.${PERIMETER_ZONES[selectedZone].key}`
                            )}
                        </p>
                        <p className="text-sm text-gray-400">
                            {PERIMETER_ZONES[selectedZone].distance}{' '}
                            {t('searchDefinition.perimeter.periphery.radius')}
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
