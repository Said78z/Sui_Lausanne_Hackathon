import { Button } from '@/components';

import { Building, Calendar, DollarSign, MapPin, Save, TrendingUp } from 'lucide-react';

import { Input } from '@/components/ui/Input/Input';
import { MultiSelectInput } from '@/components/ui/MultiSelectInput/MultiSelectInput';
import { SelectInput } from '@/components/ui/SelectInput/SelectInput';
import { ToggleGroup } from '@/components/ui/ToggleButton/ToggleButton';

import { RangeSlider } from './RangeSlider';

interface AdvancedFiltersState {
    priceRange: [number, number];
    workCostRange: [number, number];
    includedRegions: string[];
    propertyType: string;
    quality: string;
    city: string;
    extendUrbanAreas: boolean;
    publishedDays: string;
    lotsQuantity: string;
    minYield: string;
    occupancyRange: [number, number];
    minCashFlow: string;
    communeSize: string;
    urbanAreaSize: string;
    isOffMarket: boolean;
    isolated: string;
    withoutColocation: boolean;
    withoutSeasonalLots: boolean;
    bauxType: string;
}

interface AdvancedFiltersProps {
    advancedFilters: AdvancedFiltersState;
    setAdvancedFilters: React.Dispatch<React.SetStateAction<AdvancedFiltersState>>;
    handleAdvancedFilterChange: (newFilters: Partial<AdvancedFiltersState>) => void;
    uniqueRegions: string[];
}

export function AdvancedFilters({
    advancedFilters,
    setAdvancedFilters,
    handleAdvancedFilterChange,
    uniqueRegions,
}: AdvancedFiltersProps) {
    const regionOptions = uniqueRegions.map((region) => ({ label: region, value: region }));

    const propertyTypeOptions = [
        { label: 'Appartement', value: 'appartement' },
        { label: 'Immeuble', value: 'immeuble' },
    ];

    const qualityOptions = [
        { label: 'Approuvé', value: 'approved' },
        { label: 'Non vérifié', value: 'not_reviewed' },
        { label: 'En attente', value: 'pending' },
    ];

    const communeSizeOptions = [
        { label: 'Moins de 2 000 hab.', value: 'small' },
        { label: '2 000 - 10 000 hab.', value: 'medium' },
        { label: '10 000 - 50 000 hab.', value: 'large' },
        { label: 'Plus de 50 000 hab.', value: 'very_large' },
    ];

    const isolatedOptions = [
        { label: 'Travaux nécessaires', value: 'travaux_necessaires' },
        { label: 'Avec dossiers', value: 'avec_dossiers' },
        { label: 'Avec suggestions', value: 'avec_suggestions' },
        { label: '100% loué', value: '100_loue' },
        { label: 'Déjà visité', value: 'deja_visite' },
    ];

    const commercialLotsOptions = [
        { label: 'Lots commerciaux', value: 'commercial' },
        { label: 'Mixte', value: 'mixed' },
        { label: 'Residentiel', value: 'residential' },
    ];

    return (
        <div className="max-h-[90vh] space-y-6 overflow-y-auto px-4">
            <div className="flex justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Filtres avancés</h3>
                <Button variant="outline" className="flex items-center gap-2">
                    <Save size={16} />
                    Enregistrer ces paramètres
                </Button>
            </div>

            {/* Première section : Prix et coûts */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <RangeSlider
                    label="Prix"
                    value={advancedFilters.priceRange}
                    onChange={(value) => handleAdvancedFilterChange({ priceRange: value })}
                    min={0}
                    max={1250}
                    step={25}
                    suffix="K€"
                />
                <RangeSlider
                    label="Coût travaux"
                    value={advancedFilters.workCostRange}
                    onChange={(value) => handleAdvancedFilterChange({ workCostRange: value })}
                    min={0}
                    max={150}
                    step={5}
                    suffix="K€"
                />
            </div>

            {/* Deuxième section : Localisation */}
            <div className="grid grid-cols-1 gap-4">
                <MultiSelectInput
                    label="Régions"
                    options={regionOptions}
                    value={advancedFilters.includedRegions}
                    onChange={(value) =>
                        setAdvancedFilters((prev) => ({
                            ...prev,
                            includedRegions: value as string[],
                        }))
                    }
                    placeholder="Sélectionner des régions"
                />
            </div>

            {/* Troisième section : Type et qualité */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectInput
                    label="Type de bien"
                    name="propertyType"
                    options={propertyTypeOptions}
                    value={advancedFilters.propertyType}
                    onChange={(value) =>
                        setAdvancedFilters((prev) => ({ ...prev, propertyType: value }))
                    }
                />
                <SelectInput
                    label="Qualité"
                    name="quality"
                    options={qualityOptions}
                    value={advancedFilters.quality}
                    onChange={(value) =>
                        setAdvancedFilters((prev) => ({ ...prev, quality: value }))
                    }
                />
            </div>

            {/* Quatrième section : Ville et aires urbaines */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Input
                        label="Ville"
                        name="city"
                        value={advancedFilters.city}
                        onChange={(e) =>
                            setAdvancedFilters((prev) => ({
                                ...prev,
                                city: e.target.value,
                            }))
                        }
                        placeholder="Rechercher une ville..."
                        rightIcon={<MapPin size={16} className="text-gray-400" />}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Étendre aux aires urbaines
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Oui', value: 'true' },
                            { label: 'Non', value: 'false' },
                        ]}
                        value={advancedFilters.extendUrbanAreas ? 'true' : 'false'}
                        onChange={(value) =>
                            setAdvancedFilters((prev) => ({
                                ...prev,
                                extendUrbanAreas: value === 'true',
                            }))
                        }
                    />
                </div>
            </div>

            {/* Septième section : Tailles */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectInput
                    label="Taille de la commune"
                    name="communeSize"
                    options={communeSizeOptions}
                    value={advancedFilters.communeSize}
                    onChange={(value) =>
                        setAdvancedFilters((prev) => ({ ...prev, communeSize: value }))
                    }
                />
                <SelectInput
                    label="Taille de l'aire urbaine"
                    name="urbanAreaSize"
                    options={communeSizeOptions}
                    value={advancedFilters.urbanAreaSize}
                    onChange={(value) =>
                        setAdvancedFilters((prev) => ({ ...prev, urbanAreaSize: value }))
                    }
                />
            </div>

            {/* Huitième section : Off market et isolé */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Off market
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Oui', value: 'true' },
                            { label: 'Non', value: 'false' },
                        ]}
                        value={advancedFilters.isOffMarket ? 'true' : 'false'}
                        onChange={(value) =>
                            setAdvancedFilters((prev) => ({
                                ...prev,
                                isOffMarket: value === 'true',
                            }))
                        }
                    />
                </div>
                <SelectInput
                    label="Isolé"
                    name="isolated"
                    options={isolatedOptions}
                    value={advancedFilters.isolated}
                    onChange={(value) =>
                        setAdvancedFilters((prev) => ({ ...prev, isolated: value }))
                    }
                />
            </div>

            {/* Neuvième section : Filtres types et commerciaux */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Sans colocation
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Non', value: 'false' },
                            { label: 'Oui', value: 'true' },
                        ]}
                        value={advancedFilters.withoutColocation ? 'true' : 'false'}
                        onChange={(value) =>
                            setAdvancedFilters((prev) => ({
                                ...prev,
                                withoutColocation: value === 'true',
                            }))
                        }
                    />
                </div>
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        Sans lots saisonniers
                    </label>
                    <ToggleGroup
                        options={[
                            { label: 'Non', value: 'false' },
                            { label: 'Oui', value: 'true' },
                        ]}
                        value={advancedFilters.withoutSeasonalLots ? 'true' : 'false'}
                        onChange={(value) =>
                            setAdvancedFilters((prev) => ({
                                ...prev,
                                withoutSeasonalLots: value === 'true',
                            }))
                        }
                    />
                </div>
                <SelectInput
                    label="Type de baux"
                    name="bauxType"
                    options={commercialLotsOptions}
                    value={advancedFilters.bauxType}
                    onChange={(value) =>
                        setAdvancedFilters((prev) => ({ ...prev, bauxType: value }))
                    }
                />
            </div>

            {/* Cinquième section : Métriques */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Input
                    label="Publié il y a (jours)"
                    name="publishedDays"
                    type="number"
                    value={advancedFilters.publishedDays}
                    onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                            ...prev,
                            publishedDays: e.target.value,
                        }))
                    }
                    placeholder="Nombre de jours"
                    rightIcon={<Calendar size={16} className="text-gray-400" />}
                />
                <Input
                    label="Quantité de lots"
                    name="lotsQuantity"
                    type="number"
                    value={advancedFilters.lotsQuantity}
                    onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                            ...prev,
                            lotsQuantity: e.target.value,
                        }))
                    }
                    placeholder="Nombre de lots"
                    rightIcon={<Building size={16} className="text-gray-400" />}
                />
                <Input
                    label="Rendement min (%)"
                    name="minYield"
                    type="number"
                    value={advancedFilters.minYield}
                    onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                            ...prev,
                            minYield: e.target.value,
                        }))
                    }
                    placeholder="Rendement minimum"
                    rightIcon={<TrendingUp size={16} className="text-gray-400" />}
                />
            </div>

            {/* Sixième section : Occupation et cash flow */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <RangeSlider
                    label="Occupation"
                    value={advancedFilters.occupancyRange}
                    onChange={(value) => handleAdvancedFilterChange({ occupancyRange: value })}
                    min={0}
                    max={100}
                    step={5}
                    suffix="%"
                    legend={false}
                />
                <Input
                    label="Cash flow min (€)"
                    name="minCashFlow"
                    type="number"
                    value={advancedFilters.minCashFlow}
                    onChange={(e) =>
                        setAdvancedFilters((prev) => ({
                            ...prev,
                            minCashFlow: e.target.value,
                        }))
                    }
                    placeholder="Cash flow minimum"
                    rightIcon={<DollarSign size={16} className="text-gray-400" />}
                />
            </div>
        </div>
    );
}

export type { AdvancedFiltersState };
