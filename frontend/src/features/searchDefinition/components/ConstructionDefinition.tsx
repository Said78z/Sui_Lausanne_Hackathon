import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as Slider from '@radix-ui/react-slider';
import { Pickaxe } from 'lucide-react';

const BUDGET_MIN = 0;
const BUDGET_MAX = 150;

interface ConstructionDefinitionProps {
    onConstructionChange: (range: [number, number]) => void;
    initialConstruction?: [number, number];
    onConstructionFlexibilityChange?: (value: number) => void;
    initialConstructionFlexibility?: number;
}

export default function ConstructionDefinition({
    onConstructionChange,
    initialConstruction,
    onConstructionFlexibilityChange,
    initialConstructionFlexibility,
}: ConstructionDefinitionProps) {
    const { t } = useTranslation();
    const [budgetRange, setBudgetRange] = useState<[number, number]>([
        initialConstruction?.[0] ?? BUDGET_MIN + 25,
        initialConstruction?.[1] ?? BUDGET_MAX - 25,
    ]);
    const [budgetFlexibility, setBudgetFlexibility] = useState(initialConstructionFlexibility ?? 0);

    // Update state when initialConstruction prop changes
    useEffect(() => {
        if (
            initialConstruction &&
            (initialConstruction[0] !== budgetRange[0] || initialConstruction[1] !== budgetRange[1])
        ) {
            setBudgetRange(initialConstruction);
        }
    }, [initialConstruction]);

    // Update state when initialConstructionFlexibility prop changes
    useEffect(() => {
        if (
            initialConstructionFlexibility !== undefined &&
            initialConstructionFlexibility !== budgetFlexibility
        ) {
            setBudgetFlexibility(initialConstructionFlexibility);
        }
    }, [initialConstructionFlexibility]);

    useEffect(() => {
        onConstructionChange(budgetRange);
    }, [budgetRange, onConstructionChange]);

    useEffect(() => {
        onConstructionFlexibilityChange?.(budgetFlexibility);
    }, [budgetFlexibility]);

    const handleRangeChange = (values: number[]) => {
        setBudgetRange([values[0], values[1]]);
    };

    const handleBudgetFlexibilityChange = (value: number[]) => {
        setBudgetFlexibility(value[0]);
    };

    const getBudgetFlexibilityText = () => {
        switch (budgetFlexibility) {
            case 0:
                return t('searchDefinition.construction.flexible');
            case 1:
                return t('searchDefinition.construction.strict');
            case 2:
                return t('searchDefinition.construction.veryStrict');
            default:
                return t('searchDefinition.construction.flexible');
        }
    };

    return (
        <>
            <section className="mb-10 pt-6">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <Pickaxe size={20} /> {t('searchDefinition.construction.title')}
                    </span>
                    <Slider.Root
                        className="relative flex h-5 w-40 touch-none select-none items-center"
                        value={[budgetFlexibility]}
                        onValueChange={handleBudgetFlexibilityChange}
                        min={0}
                        max={2}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Budget flexible"
                        />
                    </Slider.Root>
                    <p className="text-sm text-gray-400">{getBudgetFlexibilityText()}</p>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                    {t('searchDefinition.construction.description')}
                </p>

                <div className="flex flex-col gap-2">
                    <Slider.Root
                        className="relative flex h-5 w-full touch-none select-none items-center"
                        value={budgetRange}
                        onValueChange={handleRangeChange}
                        min={BUDGET_MIN}
                        max={BUDGET_MAX}
                        step={5}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Min budget"
                        />
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Max budget"
                        />
                    </Slider.Root>
                    <div className="flex justify-between text-sm text-gray-400">
                        <span>{BUDGET_MIN}K€</span>
                        <span>{BUDGET_MAX}K€</span>
                    </div>
                    <div className="mt-2 text-center text-lg font-semibold">
                        {budgetRange[0]}K€ – {budgetRange[1]}K€
                    </div>
                </div>
            </section>
        </>
    );
}
