import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as Slider from '@radix-ui/react-slider';
import { Building, Building2, Home, Store, Users } from 'lucide-react';

interface BauxTypeDefinitionProps {
    onBauxTypeChange?: (selectedBaux: {
        residentiel: boolean;
        commercial: boolean;
        mixte: boolean;
        colocation: boolean;
    }) => void;
    initialBauxTypes?: {
        residentiel: boolean;
        commercial: boolean;
        mixte: boolean;
        colocation: boolean;
    };
    onBauxTypeFlexibilityChange?: (value: number) => void;
    initialBauxTypeFlexibility?: number;
}

export default function BauxTypeDefinition({
    onBauxTypeChange,
    initialBauxTypes,
    onBauxTypeFlexibilityChange,
    initialBauxTypeFlexibility,
}: BauxTypeDefinitionProps) {
    const { t } = useTranslation();
    const [bauxTypeFlexibility, setBauxTypeFlexibility] = useState(initialBauxTypeFlexibility ?? 0);
    const [selectedBaux, setSelectedBaux] = useState({
        residentiel: initialBauxTypes?.residentiel ?? false,
        commercial: initialBauxTypes?.commercial ?? false,
        mixte: initialBauxTypes?.mixte ?? false,
        colocation: initialBauxTypes?.colocation ?? false,
    });

    // Update state when initialBauxTypes prop changes
    useEffect(() => {
        if (initialBauxTypes) {
            setSelectedBaux(initialBauxTypes);
        }
    }, [initialBauxTypes]);

    // Update state when initialBauxTypeFlexibility prop changes
    useEffect(() => {
        if (
            initialBauxTypeFlexibility !== undefined &&
            initialBauxTypeFlexibility !== bauxTypeFlexibility
        ) {
            setBauxTypeFlexibility(initialBauxTypeFlexibility);
        }
    }, [initialBauxTypeFlexibility]);

    useEffect(() => {
        onBauxTypeFlexibilityChange?.(bauxTypeFlexibility);
    }, [bauxTypeFlexibility]);

    // Notify parent of changes
    useEffect(() => {
        onBauxTypeChange?.(selectedBaux);
    }, [selectedBaux, onBauxTypeChange]);

    const handleBauxTypeFlexibilityChange = (value: number[]) => {
        setBauxTypeFlexibility(value[0]);
    };

    const toggleBaux = (type: 'residentiel' | 'commercial' | 'mixte' | 'colocation') => {
        setSelectedBaux((prev) => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const getBauxTypeFlexibilityText = () => {
        switch (bauxTypeFlexibility) {
            case 0:
                return t('searchDefinition.bauxType.flexible');
            case 1:
                return t('searchDefinition.bauxType.strict');
            case 2:
                return t('searchDefinition.bauxType.veryStrict');
            default:
                return t('searchDefinition.bauxType.flexible');
        }
    };

    return (
        <>
            <section className="mb-10">
                <div className="mb-6 flex items-center justify-start gap-4">
                    <span className="flex items-center gap-2 text-lg font-medium">
                        <Building2 size={20} /> {t('searchDefinition.bauxType.title')}
                    </span>
                    <Slider.Root
                        className="relative flex h-5 w-40 touch-none select-none items-center"
                        value={[bauxTypeFlexibility]}
                        onValueChange={handleBauxTypeFlexibilityChange}
                        min={0}
                        max={2}
                        step={1}
                    >
                        <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                            <Slider.Range className="absolute h-full rounded-full bg-primary" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={t('searchDefinition.bauxType.title')}
                        />
                    </Slider.Root>
                    <p className="text-sm text-gray-400">{getBauxTypeFlexibilityText()}</p>
                </div>
                <p className="mb-6 text-sm text-gray-400">
                    {t('searchDefinition.bauxType.description')}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div
                        className={`duration-600 flex cursor-pointer flex-col items-center justify-center rounded-lg border p-8 py-12 transition-all ${
                            selectedBaux.residentiel
                                ? 'border-primary bg-secondary/10'
                                : 'border-gray-200 hover:border-tertiary'
                        }`}
                        onClick={() => toggleBaux('residentiel')}
                    >
                        <Home size={60} />
                        <h3 className="mt-8 text-lg font-semibold">
                            {t('searchDefinition.bauxType.types.residentiel.title')}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {t('searchDefinition.bauxType.types.residentiel.description')}
                        </p>
                    </div>
                    <div
                        className={`duration-600 flex cursor-pointer flex-col items-center justify-center rounded-lg border p-8 py-12 transition-all ${
                            selectedBaux.commercial
                                ? 'border-primary bg-secondary/10'
                                : 'border-gray-200 hover:border-tertiary'
                        }`}
                        onClick={() => toggleBaux('commercial')}
                    >
                        <Store size={60} />
                        <h3 className="mt-8 text-lg font-semibold">
                            {t('searchDefinition.bauxType.types.commercial.title')}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {t('searchDefinition.bauxType.types.commercial.description')}
                        </p>
                    </div>
                    <div
                        className={`duration-600 flex cursor-pointer flex-col items-center justify-center rounded-lg border p-8 py-12 transition-all ${
                            selectedBaux.mixte
                                ? 'border-primary bg-secondary/10'
                                : 'border-gray-200 hover:border-tertiary'
                        }`}
                        onClick={() => toggleBaux('mixte')}
                    >
                        <Building size={60} />
                        <h3 className="mt-8 text-lg font-semibold">
                            {t('searchDefinition.bauxType.types.mixte.title')}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {t('searchDefinition.bauxType.types.mixte.description')}
                        </p>
                    </div>
                    <div
                        className={`duration-600 flex cursor-pointer flex-col items-center justify-center rounded-lg border p-8 py-12 transition-all ${
                            selectedBaux.colocation
                                ? 'border-primary bg-secondary/10'
                                : 'border-gray-200 hover:border-tertiary'
                        }`}
                        onClick={() => toggleBaux('colocation')}
                    >
                        <Users size={60} />
                        <h3 className="mt-8 text-lg font-semibold">
                            {t('searchDefinition.bauxType.types.colocation.title')}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {t('searchDefinition.bauxType.types.colocation.description')}
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
