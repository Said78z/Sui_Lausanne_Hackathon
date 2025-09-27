import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as Slider from '@radix-ui/react-slider';
import { Building2 } from 'lucide-react';

interface RentalStatusDefinitionProps {
    onOccupancyChange?: (value: number) => void;
    initialOccupancy?: number;
    onRentalStatusFlexibilityChange?: (value: number) => void;
    initialRentalStatusFlexibility?: number;
}

export default function RentalStatusDefinition({
    onOccupancyChange,
    initialOccupancy,
    onRentalStatusFlexibilityChange,
    initialRentalStatusFlexibility,
}: RentalStatusDefinitionProps) {
    const { t } = useTranslation();
    const [rentalStatusFlexibility, setRentalStatusFlexibility] = useState(
        initialRentalStatusFlexibility ?? 0
    );

    // Convert initial occupancy value to slider step (0: 0%, 1: 50%, 2: 75%)
    const getSliderStepFromOccupancy = (occupancy?: number) => {
        if (occupancy === undefined || occupancy === 0) return 0;
        if (occupancy <= 50) return 1;
        return 2;
    };

    const [sliderStep, setSliderStep] = useState(getSliderStepFromOccupancy(initialOccupancy));

    // Update slider when initial value changes
    useEffect(() => {
        if (initialOccupancy !== undefined) {
            const newStep = getSliderStepFromOccupancy(initialOccupancy);
            if (newStep !== sliderStep) {
                setSliderStep(newStep);
            }
        }
    }, [initialOccupancy, sliderStep]);

    // Update state when initialRentalStatusFlexibility prop changes
    useEffect(() => {
        if (
            initialRentalStatusFlexibility !== undefined &&
            initialRentalStatusFlexibility !== rentalStatusFlexibility
        ) {
            setRentalStatusFlexibility(initialRentalStatusFlexibility);
        }
    }, [initialRentalStatusFlexibility]);

    useEffect(() => {
        onRentalStatusFlexibilityChange?.(rentalStatusFlexibility);
    }, [rentalStatusFlexibility]);

    const handleRentalStatusFlexibilityChange = (value: number[]) => {
        setRentalStatusFlexibility(value[0]);
    };

    const handleSliderStepChange = (value: number[]) => {
        setSliderStep(value[0]);
        const mapped = value[0] === 0 ? 0 : value[0] === 1 ? 50 : 75;
        onOccupancyChange?.(mapped);
    };

    const getRentalStatusFlexibilityText = () => {
        switch (rentalStatusFlexibility) {
            case 0:
                return t('searchDefinition.rentalStatus.flexible');
            case 1:
                return t('searchDefinition.rentalStatus.strict');
            case 2:
                return t('searchDefinition.rentalStatus.veryStrict');
            default:
                return t('searchDefinition.rentalStatus.flexible');
        }
    };

    useEffect(() => {
        const mapped = sliderStep === 0 ? 0 : sliderStep === 1 ? 50 : 75;
        onOccupancyChange?.(mapped);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <section className="mb-0 pt-6">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <Building2 size={20} /> {t('searchDefinition.rentalStatus.title')}
                    </span>
                    <Slider.Root
                        className="relative flex h-5 w-40 touch-none select-none items-center"
                        value={[rentalStatusFlexibility]}
                        onValueChange={handleRentalStatusFlexibilityChange}
                        min={0}
                        max={2}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={t('searchDefinition.rentalStatus.title')}
                        />
                    </Slider.Root>
                    <p className="text-sm text-gray-400">{getRentalStatusFlexibilityText()}</p>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                    {t('searchDefinition.rentalStatus.description')}
                </p>

                <div className="flex flex-col gap-2">
                    <Slider.Root
                        className="relative flex h-5 w-full touch-none select-none items-center"
                        value={[sliderStep]}
                        onValueChange={handleSliderStepChange}
                        min={0}
                        max={2}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={t('searchDefinition.rentalStatus.slider.title')}
                        />
                    </Slider.Root>
                    <div className="mt-2 flex justify-between text-sm text-gray-400">
                        <span>{t('searchDefinition.rentalStatus.slider.noCriteria')}</span>
                        <span>{t('searchDefinition.rentalStatus.slider.fiftyPercent')}</span>
                        <span>{t('searchDefinition.rentalStatus.slider.seventyFivePercent')}</span>
                    </div>
                </div>
            </section>
            <section className="mb-10 pt-6"></section>
        </>
    );
}
