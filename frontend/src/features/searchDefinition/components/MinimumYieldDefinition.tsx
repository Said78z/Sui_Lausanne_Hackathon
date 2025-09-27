import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as Slider from '@radix-ui/react-slider';
import { Building2, Euro, Landmark } from 'lucide-react';

const YIELD_DISPLAY_MIN = 5;
const YIELD_MIN = 8;
const YIELD_MAX = 11;

interface MinimumYieldDefinitionProps {
    averagePrice: number;
    onYieldChange?: (value: number) => void;
    initialYield?: number;
    onYieldFlexibilityChange?: (value: number) => void;
    initialYieldFlexibility?: number;
}

export default function MinimumYieldDefinition({
    averagePrice,
    onYieldChange,
    initialYield,
    onYieldFlexibilityChange,
    initialYieldFlexibility,
}: MinimumYieldDefinitionProps) {
    const { t } = useTranslation();
    const [yieldValue, setYieldValue] = useState<number>(initialYield ?? YIELD_MIN);
    const [yieldFlexibility, setYieldFlexibility] = useState(initialYieldFlexibility ?? 0);
    const [attemptedValue, setAttemptedValue] = useState<number | null>(null);

    // Update yield when initial value changes
    useEffect(() => {
        if (initialYield !== undefined && initialYield !== yieldValue) {
            setYieldValue(initialYield);
        }
    }, [initialYield]);

    // Update state when initialYieldFlexibility prop changes
    useEffect(() => {
        if (initialYieldFlexibility !== undefined && initialYieldFlexibility !== yieldFlexibility) {
            setYieldFlexibility(initialYieldFlexibility);
        }
    }, [initialYieldFlexibility]);

    useEffect(() => {
        onYieldFlexibilityChange?.(yieldFlexibility);
    }, [yieldFlexibility]);

    const handleYieldChange = (values: number[]) => {
        const newValue = values[0];
        if (newValue >= YIELD_MIN) {
            setYieldValue(newValue);
            setAttemptedValue(null);
            onYieldChange?.(newValue);
        } else {
            setAttemptedValue(newValue);
        }
    };

    const handleYieldFlexibilityChange = (value: number[]) => {
        setYieldFlexibility(value[0]);
    };

    const getYieldFlexibilityText = () => {
        switch (yieldFlexibility) {
            case 0:
                return t('searchDefinition.minimumYield.flexible');
            case 1:
                return t('searchDefinition.minimumYield.strict');
            case 2:
                return t('searchDefinition.minimumYield.veryStrict');
            default:
                return t('searchDefinition.minimumYield.flexible');
        }
    };

    // Calcul des revenus locatifs annuels
    const annualRentalIncome = (averagePrice * yieldValue) / 100;

    useEffect(() => {
        onYieldChange?.(yieldValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <section className="mb-10">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <Landmark size={20} /> {t('searchDefinition.minimumYield.title')}
                    </span>
                    <Slider.Root
                        className="relative flex h-5 w-40 touch-none select-none items-center"
                        value={[yieldFlexibility]}
                        onValueChange={handleYieldFlexibilityChange}
                        min={0}
                        max={2}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={t('searchDefinition.minimumYield.flexible')}
                        />
                    </Slider.Root>
                    <p className="text-sm text-gray-400">{getYieldFlexibilityText()}</p>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                    {t('searchDefinition.minimumYield.description')}
                </p>

                <div className="flex flex-col gap-2">
                    <Slider.Root
                        className="relative flex h-5 w-full touch-none select-none items-center"
                        value={[yieldValue]}
                        onValueChange={handleYieldChange}
                        min={YIELD_DISPLAY_MIN}
                        max={YIELD_MAX}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={t('searchDefinition.minimumYield.title')}
                        />
                    </Slider.Root>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>{YIELD_DISPLAY_MIN}%</span>
                        <span>{YIELD_MAX}%</span>
                    </div>
                    <div className="mt-2 text-center text-5xl font-semibold">{yieldValue}%</div>
                </div>
            </section>

            {attemptedValue !== null && attemptedValue < YIELD_MIN && (
                <section>
                    <p className="mb-4 text-sm text-red-500">
                        {t('searchDefinition.minimumYield.error')}
                    </p>
                </section>
            )}

            {yieldValue >= YIELD_MIN && yieldValue <= YIELD_MAX && (
                <section className="mb-10">
                    <p className="text-sm text-gray-400">
                        {t(`searchDefinition.minimumYield.descriptions.${yieldValue}.location`)}
                    </p>
                    <p className="mb-4 text-sm text-gray-400">
                        {t(`searchDefinition.minimumYield.descriptions.${yieldValue}.condition`)}
                    </p>
                </section>
            )}

            {/* Résumé des critères */}
            <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl border p-6">
                    <Landmark size={28} className="mb-2 text-primary" />
                    <span className="mb-1 text-xs text-gray-400">
                        {t('searchDefinition.minimumYield.summary.averagePrice')}
                    </span>
                    <span className="text-lg font-semibold">{averagePrice}K€</span>
                </div>
                <div className="flex flex-col items-center rounded-xl border p-6">
                    <Euro size={28} className="mb-2 text-primary" />
                    <span className="mb-1 text-xs text-gray-400">
                        {t('searchDefinition.minimumYield.summary.yield')}
                    </span>
                    <span className="text-lg font-semibold">{yieldValue}%</span>
                </div>
                <div className="flex flex-col items-center rounded-xl border p-6">
                    <Building2 size={28} className="mb-2 text-primary" />
                    <span className="mb-1 text-xs text-gray-400">
                        {t('searchDefinition.minimumYield.summary.annualIncome')}
                    </span>
                    <span className="text-lg font-semibold">
                        {annualRentalIncome}
                        {t('searchDefinition.minimumYield.summary.perYear')}
                    </span>
                </div>
            </section>
        </>
    );
}
