import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as Slider from '@radix-ui/react-slider';
import { Building2, Euro, Landmark } from 'lucide-react';

const BUDGET_MIN = 0;
const BUDGET_MAX = 1250;

interface BudgetDefinitionProps {
    onBudgetChange: (range: [number, number]) => void;
    initialBudget?: [number, number];
    onBudgetFlexibilityChange?: (value: number) => void;
    initialBudgetFlexibility?: number;
}

export default function BudgetDefinition({
    onBudgetChange,
    initialBudget,
    onBudgetFlexibilityChange,
    initialBudgetFlexibility,
}: BudgetDefinitionProps) {
    const { t } = useTranslation();
    const [budgetRange, setBudgetRange] = useState<[number, number]>([
        initialBudget?.[0] ?? BUDGET_MIN + 100,
        initialBudget?.[1] ?? BUDGET_MAX - 100,
    ]);
    const [budgetFlexibility, setBudgetFlexibility] = useState(initialBudgetFlexibility ?? 0);

    // Update state when initialBudget prop changes
    useEffect(() => {
        if (
            initialBudget &&
            (initialBudget[0] !== budgetRange[0] || initialBudget[1] !== budgetRange[1])
        ) {
            setBudgetRange(initialBudget);
        }
    }, [initialBudget]);

    useEffect(() => {
        onBudgetChange(budgetRange);
    }, [budgetRange, onBudgetChange]);

    useEffect(() => {
        if (
            initialBudgetFlexibility !== undefined &&
            initialBudgetFlexibility !== budgetFlexibility
        ) {
            setBudgetFlexibility(initialBudgetFlexibility);
        }
    }, [initialBudgetFlexibility]);

    useEffect(() => {
        onBudgetFlexibilityChange?.(budgetFlexibility);
    }, [budgetFlexibility, onBudgetFlexibilityChange]);

    const handleRangeChange = (values: number[]) => {
        setBudgetRange([values[0], values[1]]);
    };

    const handleBudgetFlexibilityChange = (value: number[]) => {
        setBudgetFlexibility(value[0]);
    };

    // Calcul de l'apport (15% du budget min et max, arrondi à l'unité)
    const apportMin = Math.round(budgetRange[0] * 0.15);
    const apportMax = Math.round(budgetRange[1] * 0.15);

    // Calcul du nombre de lots : 6 + 1 lot tous les 50k€ d'écart
    const lotsCountMin = Math.floor(budgetRange[0] / 50);
    const lotsCountMax = Math.floor(budgetRange[1] / 50);

    const getBudgetFlexibilityText = () => {
        switch (budgetFlexibility) {
            case 0:
                return t('searchDefinition.budget.flexible');
            case 1:
                return t('searchDefinition.budget.strict');
            case 2:
                return t('searchDefinition.budget.veryStrict');
            default:
                return t('searchDefinition.budget.flexible');
        }
    };

    return (
        <>
            <section className="mb-10">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <Landmark size={20} /> {t('searchDefinition.budget.title')}
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
                    {t('searchDefinition.budget.description')}
                </p>

                <div className="flex flex-col gap-2">
                    <Slider.Root
                        className="relative flex h-5 w-full touch-none select-none items-center"
                        value={budgetRange}
                        onValueChange={handleRangeChange}
                        min={BUDGET_MIN}
                        max={BUDGET_MAX}
                        step={25}
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

            {/* Professionnels */}
            <section className="mb-10">
                <p className="mb-4 text-sm text-gray-400">
                    {t('searchDefinition.budget.professionalNote')}
                </p>
            </section>

            {/* Résumé des critères */}
            <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-center rounded-xl border p-6">
                    <Landmark size={28} className="mb-2 text-primary" />
                    <span className="mb-1 text-xs text-gray-400">
                        {t('searchDefinition.budget.summary.budget')}
                    </span>
                    <span className="text-lg font-semibold">
                        {budgetRange[0]}K€ – {budgetRange[1]}K€
                    </span>
                </div>
                <div className="flex flex-col items-center rounded-xl border p-6">
                    <Euro size={28} className="mb-2 text-primary" />
                    <span className="mb-1 text-xs text-gray-400">
                        {t('searchDefinition.budget.summary.downPayment')}
                    </span>
                    <span className="text-lg font-semibold">
                        {apportMin}K€ – {apportMax}K€
                    </span>
                </div>
                <div className="flex flex-col items-center rounded-xl border p-6">
                    <Building2 size={28} className="mb-2 text-primary" />
                    <span className="mb-1 text-xs text-gray-400">
                        {t('searchDefinition.budget.summary.lots')}
                    </span>
                    <span className="text-lg font-semibold">
                        {lotsCountMin} – {lotsCountMax}
                    </span>
                </div>
            </section>
        </>
    );
}
