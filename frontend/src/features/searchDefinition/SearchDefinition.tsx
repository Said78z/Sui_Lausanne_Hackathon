import { useDossierById, useUpdateDossier } from '@/api/queries/dossierQueries';
import { Button } from '@/components';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { UpdateDossierDto } from '@shared/dto';

import BauxTypeDefinition from './components/BauxTypeDefinition';
import BudgetDefinition from './components/BudgetDefinition';
import ConstructionDefinition from './components/ConstructionDefinition';
import LocalisationDefinition from './components/LocalisationDefinition';
import LotTypeDefinition from './components/LotTypeDefinition';
import MinimumYieldDefinition from './components/MinimumYieldDefinition';
import PerimeterDefinition from './components/PerimeterDefinition';
import RemarkDetailDefinition from './components/RemarkDetailDefinition';
import RentalStatusDefinition from './components/RentalStatusDefinition';

export default function SearchDefinition() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // Fetch current dossier data
    const { data: dossier, isLoading } = useDossierById(id || '');

    // Track if we've initialized from dossier data to prevent circular updates
    const [isInitialized, setIsInitialized] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Initialize with default values, will be updated when dossier loads
    const [budgetRange, setBudgetRange] = useState<[number, number]>([100, 1150]);
    const [constructionRange, setConstructionRange] = useState<[number, number]>([25, 125]);
    const [minYield, setMinYield] = useState<number>(8);
    const [minOccupancy, setMinOccupancy] = useState<number | undefined>(undefined);
    const [goal, setGoal] = useState<string>('');
    const [budgetFlexibility, setBudgetFlexibility] = useState<number>(0);
    const [localisationFlexibility, setLocalisationFlexibility] = useState<number>(0);
    const [constructionFlexibility, setConstructionFlexibility] = useState<number>(0);
    const [citySizeFlexibility, setCitySizeFlexibility] = useState<number>(0);
    const [lotTypeFlexibility, setLotTypeFlexibility] = useState<number>(0);
    const [bauxTypeFlexibility, setBauxTypeFlexibility] = useState<number>(0);
    const [yieldFlexibility, setYieldFlexibility] = useState<number>(0);
    const [rentalStatusFlexibility, setRentalStatusFlexibility] = useState<number>(0);

    // Additional component states
    const [lotTypes, setLotTypes] = useState({ simple: false, multiple: false });
    const [bauxTypes, setBauxTypes] = useState({
        residentiel: false,
        commercial: false,
        mixte: false,
        colocation: false,
    });
    const [perimeter, setPerimeter] = useState({ citySize: 1, selectedZone: 0 });
    const [localisation, setLocalisation] = useState<{
        selectedCountries: ('FR' | 'CZ')[];
        selectedRegions: Record<'FR' | 'CZ', string | null>;
        excluded: Record<'FR' | 'CZ', string[]>;
    }>({
        selectedCountries: ['FR'],
        selectedRegions: { FR: null, CZ: null },
        excluded: { FR: [], CZ: [] },
    });

    // Update form values when dossier data loads
    useEffect(() => {
        console.log('🔄 SearchDefinition - useEffect triggered:', {
            dossier: !!dossier,
            isInitialized,
        });
        if (dossier && !isInitialized) {
            // Convert euros to K€ for display (divide by 1000)
            if (dossier.minBudget !== undefined && dossier.maxBudget !== undefined) {
                const minBudgetK = Math.round((dossier.minBudget as number) / 1000);
                const maxBudgetK = Math.round((dossier.maxBudget as number) / 1000);
                setBudgetRange([minBudgetK, maxBudgetK]);
            }

            // Load construction/renovation budget (already in K€ range)
            if (dossier.minRework !== undefined && dossier.maxRework !== undefined) {
                setConstructionRange([dossier.minRework as number, dossier.maxRework as number]);
            }

            if (dossier.minBuyerRentalYield !== undefined) {
                setMinYield(dossier.minBuyerRentalYield as number);
            }

            if (dossier.minOccupancy !== undefined) {
                setMinOccupancy(dossier.minOccupancy as number);
            }

            if (dossier.goal) {
                setGoal(dossier.goal);
            }
            // typeOfLot JSON
            if (dossier.typeOfLot) {
                const tol = dossier.typeOfLot as { simple?: boolean; multiple?: boolean };
                setLotTypes({
                    simple: !!tol.simple,
                    multiple: !!tol.multiple,
                });
            }
            if (dossier.budgetFlexibility !== undefined) {
                setBudgetFlexibility(dossier.budgetFlexibility);
            }
            if (dossier.localisationFlexibility !== undefined) {
                setLocalisationFlexibility(dossier.localisationFlexibility);
            }
            if (dossier.constructionFlexibility !== undefined) {
                setConstructionFlexibility(dossier.constructionFlexibility);
            }
            if (dossier.citySizeFlexibility !== undefined) {
                setCitySizeFlexibility(dossier.citySizeFlexibility);
            }
            // Load perimeter data from backend
            if (dossier.citySize !== undefined && dossier.perimeterZone !== undefined) {
                setPerimeter({
                    citySize: dossier.citySize,
                    selectedZone: dossier.perimeterZone,
                });
            }
            if (dossier.lotTypeFlexibility !== undefined) {
                setLotTypeFlexibility(dossier.lotTypeFlexibility);
            }
            if (dossier.bauxTypeFlexibility !== undefined) {
                setBauxTypeFlexibility(dossier.bauxTypeFlexibility);
            }
            // Load baux types from backend
            if (dossier.bauxTypes) {
                const bt = dossier.bauxTypes as {
                    residentiel?: boolean;
                    commercial?: boolean;
                    mixte?: boolean;
                    colocation?: boolean;
                };
                setBauxTypes({
                    residentiel: !!bt.residentiel,
                    commercial: !!bt.commercial,
                    mixte: !!bt.mixte,
                    colocation: !!bt.colocation,
                });
            }
            if (dossier.yieldFlexibility !== undefined) {
                setYieldFlexibility(dossier.yieldFlexibility);
            }
            if (dossier.rentalStatusFlexibility !== undefined) {
                setRentalStatusFlexibility(dossier.rentalStatusFlexibility);
            }

            // Load simplified region data from backend
            if (
                dossier.selectedCountries ||
                dossier.selectedRegionCodes ||
                dossier.excludedRegionCodes
            ) {
                const selectedCountries = (dossier.selectedCountries as string[]) || ['FR'];
                const selectedRegionCodes = (dossier.selectedRegionCodes as string[]) || [];
                const excludedRegionCodes = (dossier.excludedRegionCodes as string[]) || [];

                // Convert back to frontend format
                const selectedRegions: Record<'FR' | 'CZ', string | null> = { FR: null, CZ: null };
                const excluded: Record<'FR' | 'CZ', string[]> = { FR: [], CZ: [] };

                // Find selected regions for each country
                selectedRegionCodes.forEach((regionCode) => {
                    if (regionCode.startsWith('FR-')) {
                        selectedRegions.FR = regionCode;
                    } else if (regionCode.startsWith('CZ-')) {
                        selectedRegions.CZ = regionCode;
                    }
                });

                // Group excluded regions by country
                excludedRegionCodes.forEach((regionCode) => {
                    if (regionCode.startsWith('FR-')) {
                        excluded.FR.push(regionCode);
                    } else if (regionCode.startsWith('CZ-')) {
                        excluded.CZ.push(regionCode);
                    }
                });

                console.log('🌍 Frontend - Loading region data from backend:', {
                    selectedCountries,
                    selectedRegionCodes,
                    excludedRegionCodes,
                    convertedSelectedRegions: selectedRegions,
                    convertedExcluded: excluded,
                });

                setLocalisation({
                    selectedCountries: selectedCountries as ('FR' | 'CZ')[],
                    selectedRegions,
                    excluded,
                });
            }

            // Load regions and excluded regions from relations (legacy support)
            const extendedDossier = dossier as any; // Cast to access relations

            // Load search criteria from allStatus JSON field
            if (dossier.allStatus && typeof dossier.allStatus === 'object') {
                const criteria = dossier.allStatus as any;

                // Look for our search criteria under the searchCriteria key
                if (criteria.searchCriteria) {
                    const searchCriteria = criteria.searchCriteria;

                    if (searchCriteria.lotTypes) {
                        setLotTypes(searchCriteria.lotTypes);
                    }

                    if (searchCriteria.bauxTypes) {
                        setBauxTypes(searchCriteria.bauxTypes);
                    }

                    if (searchCriteria.perimeter) {
                        setPerimeter(searchCriteria.perimeter);
                    }

                    if (searchCriteria.localisation) {
                        setLocalisation(searchCriteria.localisation);
                    }
                }
            }

            if (extendedDossier.regions || extendedDossier.excludedRegions) {
                const regionNames = extendedDossier.regions?.map((r: any) => r.id) || [];
                const excludedRegionNames =
                    extendedDossier.excludedRegions?.map((r: any) => r.id) || [];

                setLocalisation((prev) => ({
                    ...prev,
                    selectedRegions: {
                        FR: regionNames.length > 0 ? regionNames[0] : null,
                        CZ: null,
                    },
                    excluded: {
                        FR: excludedRegionNames,
                        CZ: [],
                    },
                }));
            }

            setIsInitialized(true);
            setIsDataLoading(false);
        }
    }, [dossier, isInitialized]);

    // Process region data separately - always run when dossier changes (even if already initialized)
    useEffect(() => {
        if (
            dossier &&
            (dossier.selectedCountries ||
                dossier.selectedRegionCodes ||
                dossier.excludedRegionCodes)
        ) {
            console.log('🔍 SearchDefinition - Processing region data from dossier:', {
                selectedCountries: dossier.selectedCountries,
                selectedRegionCodes: dossier.selectedRegionCodes,
                excludedRegionCodes: dossier.excludedRegionCodes,
            });

            const selectedCountries = (dossier.selectedCountries as string[]) || ['FR'];
            const selectedRegionCodes = (dossier.selectedRegionCodes as string[]) || [];
            const excludedRegionCodes = (dossier.excludedRegionCodes as string[]) || [];

            // Convert back to frontend format
            const selectedRegions: Record<'FR' | 'CZ', string | null> = { FR: null, CZ: null };
            const excluded: Record<'FR' | 'CZ', string[]> = { FR: [], CZ: [] };

            // Find selected regions for each country
            selectedRegionCodes.forEach((regionCode) => {
                if (regionCode.startsWith('FR-')) {
                    selectedRegions.FR = regionCode;
                } else if (regionCode.startsWith('CZ-')) {
                    selectedRegions.CZ = regionCode;
                }
            });

            // Group excluded regions by country
            excludedRegionCodes.forEach((regionCode) => {
                if (regionCode.startsWith('FR-')) {
                    excluded.FR.push(regionCode);
                } else if (regionCode.startsWith('CZ-')) {
                    excluded.CZ.push(regionCode);
                }
            });

            console.log('🌍 Frontend - Converted region data:', {
                selectedCountries,
                selectedRegionCodes,
                excludedRegionCodes,
                convertedSelectedRegions: selectedRegions,
                convertedExcluded: excluded,
            });

            setLocalisation({
                selectedCountries: selectedCountries as ('FR' | 'CZ')[],
                selectedRegions,
                excluded,
            });
        }
    }, [dossier?.selectedCountries, dossier?.selectedRegionCodes, dossier?.excludedRegionCodes]);

    // Make setLocalisation stable to prevent infinite re-renders
    const handleLocalisationChange = useCallback(
        (newLocalisation: {
            selectedCountries: ('FR' | 'CZ')[];
            selectedRegions: Record<'FR' | 'CZ', string | null>;
            excluded: Record<'FR' | 'CZ', string[]>;
        }) => {
            setLocalisation(newLocalisation);
        },
        []
    );

    // Calcul du prix moyen
    const averageBudget = (budgetRange[0] + budgetRange[1]) / 2;
    const averageConstruction = (constructionRange[0] + constructionRange[1]) / 2;
    const averagePrice = averageBudget + averageConstruction;

    // Handle mutation callbacks
    const updateMutation = useUpdateDossier();

    // Show loading while fetching dossier data
    if (isLoading || isDataLoading) {
        return <div className="p-8 text-center text-lg">Loading...</div>;
    }

    const handleValidate = () => {
        if (!id) return;
        // Map K€ inputs to € by multiplying by 1000
        const minBudgetEuros = Math.round(budgetRange[0] * 1000);
        const maxBudgetEuros = Math.round(budgetRange[1] * 1000);

        // Convert frontend localisation state to simplified backend format
        const selectedRegionCodes: string[] = [];
        const excludedRegionCodes: string[] = [];

        // Add selected regions to the array
        Object.entries(localisation.selectedRegions).forEach(([country, regionCode]) => {
            if (regionCode) {
                selectedRegionCodes.push(regionCode);
            }
        });

        // Add excluded regions to the array
        Object.entries(localisation.excluded).forEach(([country, regions]) => {
            excludedRegionCodes.push(...regions);
        });

        const updatePayload: UpdateDossierDto = {
            minBudget: minBudgetEuros,
            maxBudget: maxBudgetEuros,
            minBuyerRentalYield: minYield,
            minRework: constructionRange[0],
            maxRework: constructionRange[1],
            ...(minOccupancy !== undefined ? { minOccupancy } : {}),
            ...(goal.trim() ? { goal: goal.trim() } : {}),
            typeOfLot: { ...lotTypes },
            budgetFlexibility,
            localisationFlexibility,
            constructionFlexibility,
            citySizeFlexibility,
            citySize: perimeter.citySize,
            perimeterZone: perimeter.selectedZone,
            lotTypeFlexibility,
            bauxTypeFlexibility,
            yieldFlexibility,
            rentalStatusFlexibility,
            bauxTypes: { ...bauxTypes },
            // Simplified region data
            selectedCountries: localisation.selectedCountries,
            selectedRegionCodes,
            excludedRegionCodes,
        };

        updateMutation.mutate(
            {
                id,
                data: updatePayload,
            },
            {
                onSuccess: () => {
                    navigate(`/folder/${id}`);
                },
            }
        );
    };

    return (
        <div className="min-h-screen w-full p-10">
            <div className="max-w-[calc(100vw-23rem)]">
                <h1 className="mb-8 text-3xl font-bold">{t('searchDefinition.title')}</h1>

                <BudgetDefinition
                    onBudgetChange={setBudgetRange}
                    initialBudget={budgetRange}
                    onBudgetFlexibilityChange={setBudgetFlexibility}
                    initialBudgetFlexibility={budgetFlexibility}
                />
                <LocalisationDefinition
                    onLocalisationChange={handleLocalisationChange}
                    initialLocalisation={localisation}
                    onLocalisationFlexibilityChange={setLocalisationFlexibility}
                    initialLocalisationFlexibility={localisationFlexibility}
                />
                <ConstructionDefinition
                    onConstructionChange={setConstructionRange}
                    initialConstruction={constructionRange}
                    onConstructionFlexibilityChange={setConstructionFlexibility}
                    initialConstructionFlexibility={constructionFlexibility}
                />
                <PerimeterDefinition
                    onPerimeterChange={setPerimeter}
                    initialPerimeter={perimeter}
                    onCitySizeFlexibilityChange={setCitySizeFlexibility}
                    initialCitySizeFlexibility={citySizeFlexibility}
                />
                <LotTypeDefinition
                    onLotTypeChange={setLotTypes}
                    initialLotTypes={lotTypes}
                    onLotTypeFlexibilityChange={setLotTypeFlexibility}
                    initialLotTypeFlexibility={lotTypeFlexibility}
                />
                <BauxTypeDefinition
                    onBauxTypeChange={setBauxTypes}
                    initialBauxTypes={bauxTypes}
                    onBauxTypeFlexibilityChange={setBauxTypeFlexibility}
                    initialBauxTypeFlexibility={bauxTypeFlexibility}
                />
                <RemarkDetailDefinition onGoalChange={setGoal} initialGoal={goal} />
                <MinimumYieldDefinition
                    averagePrice={averagePrice}
                    onYieldChange={setMinYield}
                    initialYield={minYield}
                    onYieldFlexibilityChange={setYieldFlexibility}
                    initialYieldFlexibility={yieldFlexibility}
                />
                <RentalStatusDefinition
                    onOccupancyChange={setMinOccupancy}
                    initialOccupancy={minOccupancy}
                    onRentalStatusFlexibilityChange={setRentalStatusFlexibility}
                    initialRentalStatusFlexibility={rentalStatusFlexibility}
                />
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        className="px-8 py-3 text-lg font-semibold"
                        onClick={handleValidate}
                        disabled={!id || updateMutation.isPending}
                    >
                        {t('searchDefinition.validateCriteria')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
