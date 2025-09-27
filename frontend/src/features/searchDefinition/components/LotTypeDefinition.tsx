import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as Slider from '@radix-ui/react-slider';
import { Building2, Grid2x2, Square } from 'lucide-react';

interface LotTypeDefinitionProps {
    onLotTypeChange?: (selectedLots: { simple: boolean; multiple: boolean }) => void;
    initialLotTypes?: { simple: boolean; multiple: boolean };
    onLotTypeFlexibilityChange?: (value: number) => void;
    initialLotTypeFlexibility?: number;
}

export default function LotTypeDefinition({
    onLotTypeChange,
    initialLotTypes,
    onLotTypeFlexibilityChange,
    initialLotTypeFlexibility,
}: LotTypeDefinitionProps) {
    const { t } = useTranslation();
    const [lotTypeFlexibility, setLotTypeFlexibility] = useState(initialLotTypeFlexibility ?? 0);
    const [selectedLots, setSelectedLots] = useState({
        simple: initialLotTypes?.simple ?? false,
        multiple: initialLotTypes?.multiple ?? false,
    });

    // Update state when initialLotTypes prop changes
    useEffect(() => {
        if (initialLotTypes) {
            setSelectedLots(initialLotTypes);
        }
    }, [initialLotTypes]);

    // Update state when initialLotTypeFlexibility prop changes
    useEffect(() => {
        if (
            initialLotTypeFlexibility !== undefined &&
            initialLotTypeFlexibility !== lotTypeFlexibility
        ) {
            setLotTypeFlexibility(initialLotTypeFlexibility);
        }
    }, [initialLotTypeFlexibility]);

    useEffect(() => {
        onLotTypeFlexibilityChange?.(lotTypeFlexibility);
    }, [lotTypeFlexibility]);

    const handleLotTypeFlexibilityChange = (value: number[]) => {
        setLotTypeFlexibility(value[0]);
    };

    const toggleLot = (type: 'simple' | 'multiple') => {
        const newSelectedLots = {
            ...selectedLots,
            [type]: !selectedLots[type],
        };
        setSelectedLots(newSelectedLots);
        // Only call onChange when user actually clicks
        onLotTypeChange?.(newSelectedLots);
    };

    const getLotTypeFlexibilityText = () => {
        switch (lotTypeFlexibility) {
            case 0:
                return t('searchDefinition.lotType.flexible');
            case 1:
                return t('searchDefinition.lotType.strict');
            case 2:
                return t('searchDefinition.lotType.veryStrict');
            default:
                return t('searchDefinition.lotType.flexible');
        }
    };

    return (
        <>
            <section className="mb-10">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <Building2 size={20} /> {t('searchDefinition.lotType.title')}
                    </span>
                    <Slider.Root
                        className="relative flex h-5 w-40 touch-none select-none items-center"
                        value={[lotTypeFlexibility]}
                        onValueChange={handleLotTypeFlexibilityChange}
                        min={0}
                        max={2}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={t('searchDefinition.lotType.title')}
                        />
                    </Slider.Root>
                    <p className="text-sm text-gray-400">{getLotTypeFlexibilityText()}</p>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                    {t('searchDefinition.lotType.description')}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div
                        className={`duration-600 flex cursor-pointer flex-col items-center justify-center rounded-lg border p-8 py-12 transition-all ${
                            selectedLots.simple
                                ? 'border-primary bg-secondary/10'
                                : 'border-gray-200 hover:border-tertiary'
                        }`}
                        onClick={() => toggleLot('simple')}
                    >
                        <Square size={60} />
                        <h3 className="mt-8 text-lg font-semibold">
                            {t('searchDefinition.lotType.types.simple.title')}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {t('searchDefinition.lotType.types.simple.description')}
                        </p>
                    </div>
                    <div
                        className={`duration-600 flex cursor-pointer flex-col items-center justify-center rounded-lg border p-8 py-12 transition-all ${
                            selectedLots.multiple
                                ? 'border-primary bg-secondary/10'
                                : 'border-gray-200 hover:border-tertiary'
                        }`}
                        onClick={() => toggleLot('multiple')}
                    >
                        <Grid2x2 size={60} />
                        <h3 className="mt-8 text-lg font-semibold">
                            {t('searchDefinition.lotType.types.multiple.title')}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {t('searchDefinition.lotType.types.multiple.description')}
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
