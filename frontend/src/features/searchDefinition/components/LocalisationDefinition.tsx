import { Button } from '@/components';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import * as am5 from '@amcharts/amcharts5';
import am5geodata_czechRepublicLow from '@amcharts/amcharts5-geodata/czechRepublicLow';
import am5geodata_franceLow from '@amcharts/amcharts5-geodata/franceLow';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as Slider from '@radix-ui/react-slider';
import { CZ, FR } from 'country-flag-icons/react/3x2';
import {
    AlertTriangle,
    Briefcase,
    Building2,
    ChartNoAxesColumn,
    ChartPie,
    ChevronDown,
    Home,
    MapPin,
    Search,
    Trash,
    TrendingDown,
    TrendingUp,
    UserRound,
    XCircle,
} from 'lucide-react';

import REGIONS_DATA from '@/mocks/regionMock.json';

const REGIONS_LABELS: Record<string, string> = {
    'FR-IDF': 'Île de France',
    'FR-CVL': 'Centre Val De Loire',
    'FR-NOR': 'Normandie',
    'FR-HDF': 'Hauts De France',
    'FR-PDL': 'Pays de la Loire',
    'FR-BRE': 'Bretagne',
    'FR-NAQ': 'Nouvelle Aquitaine',
    'FR-COR': 'Corse',
    'FR-BFC': 'Bourgogne-Franche-Comté',
    'FR-PAC': "Provence-Alpes-Côte d'Azur",
    'FR-ARA': 'Auvergne-Rhône-Alpes',
    'FR-OCC': 'Occitanie',
    'FR-GES': 'Grand Est',
    // ... complète si besoin
};

const DEFAULT_REGION_DATA = {
    habitants: '1 000 000',
    rechercheLocataire: '20 jours',
    rechercheAcquereur: '2 mois',
    tensionLocative: 'Modérée',
    tensionTransactionnelle: 'Modérée',
    plusValue: '+2,0%/an',
    tauxChomage: '8,0%',
    creationEntreprise: '10 000/an',
};

type CountryCode = 'FR' | 'CZ';

interface CountryData {
    name: string;
    geoData: any;
    regions: Record<string, string>;
    data: Record<string, any>;
    Flag: React.ComponentType<{ className?: string }>;
}

interface LocalisationDefinitionProps {
    onLocalisationChange?: (data: {
        selectedCountries: CountryCode[];
        selectedRegions: Record<CountryCode, string | null>;
        excluded: Record<CountryCode, string[]>;
    }) => void;
    initialLocalisation?: {
        selectedCountries: CountryCode[];
        selectedRegions: Record<CountryCode, string | null>;
        excluded: Record<CountryCode, string[]>;
    };
    onLocalisationFlexibilityChange?: (value: number) => void;
    initialLocalisationFlexibility?: number;
}

const AVAILABLE_COUNTRIES: Record<CountryCode, CountryData> = {
    FR: {
        name: 'France',
        geoData: am5geodata_franceLow,
        regions: REGIONS_LABELS,
        data: REGIONS_DATA,
        Flag: FR,
    },
    CZ: {
        name: 'République Tchèque',
        geoData: am5geodata_czechRepublicLow,
        regions: {
            'CZ-10': 'Prague',
            'CZ-64': 'Moravie du Sud',
            'CZ-31': 'Bohême du Sud',
            'CZ-20': 'Bohême du Centrale',
            'CZ-32': 'Plzeň',
            'CZ-41': 'Karlovy Vary',
            'CZ-42': 'Ústí nad Labem',
            'CZ-51': 'Liberec',
            'CZ-52': 'Hradec Králové',
            'CZ-53': 'Pardubice',
            'CZ-63': 'Vysočina',
            'CZ-71': 'Olomouc',
            'CZ-72': 'Zlín',
            'CZ-80': 'Moravie-Silésie',
        },
        data: {
            'CZ-PR': {
                habitants: '1 335 084',
                rechercheLocataire: '12 jours',
                rechercheAcquereur: '1,2 mois',
                tensionLocative: 'Forte',
                tensionTransactionnelle: 'Forte',
                plusValue: '+5,2%/an',
                tauxChomage: '2,1%',
                creationEntreprise: '15 000/an',
            },
            // ... autres régions tchèques avec données fictives similaires
        },
        Flag: CZ,
    },
};

export default function LocalisationDefinition({
    onLocalisationChange,
    initialLocalisation,
    onLocalisationFlexibilityChange,
    initialLocalisationFlexibility,
}: LocalisationDefinitionProps) {
    const { t } = useTranslation();
    const chartRefs = useRef<Record<CountryCode, HTMLDivElement | null>>({
        FR: null,
        CZ: null,
    });
    const rootsRef = useRef<Record<CountryCode, am5.Root | null>>({
        FR: null,
        CZ: null,
    });
    const [localisationFlexibility, setLocalisationFlexibility] = useState(
        initialLocalisationFlexibility ?? 0
    );
    const [excluded, setExcluded] = useState<Record<CountryCode, string[]>>({
        FR: initialLocalisation?.excluded.FR ?? [],
        CZ: initialLocalisation?.excluded.CZ ?? [],
    });
    const [selectedRegions, setSelectedRegions] = useState<Record<CountryCode, string | null>>({
        FR: initialLocalisation?.selectedRegions.FR ?? null,
        CZ: initialLocalisation?.selectedRegions.CZ ?? null,
    });
    const [selectedCountries, setSelectedCountries] = useState<CountryCode[]>(
        initialLocalisation?.selectedCountries ?? ['FR']
    );
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Update state when initialLocalisation prop changes
    useEffect(() => {
        console.log(
            '🌍 Frontend - LocalisationDefinition initialLocalisation:',
            initialLocalisation
        );
        if (initialLocalisation) {
            console.log(
                '🌍 Frontend - Setting initial excluded regions:',
                initialLocalisation.excluded
            );
            setSelectedCountries(initialLocalisation.selectedCountries);
            setSelectedRegions(initialLocalisation.selectedRegions);
            setExcluded(initialLocalisation.excluded);
        }
    }, [initialLocalisation]);

    useEffect(() => {
        if (
            initialLocalisationFlexibility !== undefined &&
            initialLocalisationFlexibility !== localisationFlexibility
        ) {
            setLocalisationFlexibility(initialLocalisationFlexibility);
        }
    }, [initialLocalisationFlexibility]);

    // Notify parent of changes
    useEffect(() => {
        onLocalisationChange?.({
            selectedCountries,
            selectedRegions,
            excluded,
        });
    }, [selectedCountries, selectedRegions, excluded]);

    useEffect(() => {
        onLocalisationFlexibilityChange?.(localisationFlexibility);
    }, [localisationFlexibility]);

    useLayoutEffect(() => {
        const roots: { [key in CountryCode]?: am5.Root } = {};

        selectedCountries.forEach((countryCode) => {
            const chartDiv = chartRefs.current[countryCode];
            if (!chartDiv) return;

            const root = am5.Root.new(chartDiv);
            roots[countryCode] = root;
            rootsRef.current[countryCode] = root;

            root.setThemes([am5themes_Animated.new(root)]);

            const chart = root.container.children.push(
                am5map.MapChart.new(root, {
                    panX: 'none',
                    panY: 'none',
                    wheelX: 'none',
                    wheelY: 'none',
                    projection: am5map.geoMercator(),
                })
            );

            const polygonSeries = chart.series.push(
                am5map.MapPolygonSeries.new(root, {
                    geoJSON: AVAILABLE_COUNTRIES[countryCode].geoData,
                    valueField: 'value',
                    calculateAggregates: true,
                })
            );

            polygonSeries.mapPolygons.template.setAll({
                tooltipText: '{name}',
                interactive: true,
                fill: am5.color(0x444444),
                stroke: am5.color(0xffffff),
                strokeWidth: 1,
            });

            polygonSeries.mapPolygons.template.events.on('click', (ev) => {
                const id = (ev.target.dataItem?.dataContext as any).id;
                if (!id) return;
                setSelectedRegions((prev) => ({ ...prev, [countryCode]: id }));
            });
        });

        return () => {
            Object.values(roots).forEach((root) => {
                if (root) {
                    root.dispose();
                }
            });
        };
    }, [selectedCountries]);

    // Forcer la mise à jour des couleurs quand selectedRegions ou excluded change
    useEffect(() => {
        selectedCountries.forEach((countryCode) => {
            const root = rootsRef.current[countryCode];
            if (!root) return;

            const chart = root.container.children.getIndex(0) as am5map.MapChart;
            if (!chart) return;

            const polygonSeries = chart.series.getIndex(0) as am5map.MapPolygonSeries;
            if (!polygonSeries) return;

            polygonSeries.mapPolygons.each((polygon) => {
                const id = (polygon.dataItem?.dataContext as any).id;
                if (id && excluded[countryCode]?.includes(id)) {
                    polygon.set('fill', am5.color(0xff5c5c));
                    polygon.set('stroke', am5.color(0xff5c5c));
                    polygon.set('strokeWidth', 1);
                } else if (id === selectedRegions[countryCode]) {
                    polygon.set('fill', am5.color(0xe0e0e0));
                    polygon.set('stroke', am5.color(0x1d223e));
                    polygon.set('strokeWidth', 3);
                } else {
                    polygon.set('fill', am5.color(0xe0e0e0));
                    polygon.set('stroke', am5.color(0xffffff));
                    polygon.set('strokeWidth', 1);
                }
            });
        });
    }, [selectedRegions, excluded, selectedCountries]);

    const handleLocalisationFlexibilityChange = (value: number[]) => {
        setLocalisationFlexibility(value[0]);
    };

    // Gestion du bouton Exclure/Inlure
    const toggleRegion = (countryCode: CountryCode, id: string) => {
        console.log('🚫 Frontend - Toggle region:', {
            countryCode,
            id,
            currentExcluded: excluded[countryCode],
        });

        setExcluded((prev) => {
            const newExcluded = {
                ...prev,
                [countryCode]: prev[countryCode]?.includes(id)
                    ? prev[countryCode]?.filter((r) => r !== id)
                    : [...(prev[countryCode] || []), id],
            };

            console.log('🚫 Frontend - After toggle:', { newExcluded });
            return newExcluded;
        });
    };

    const addCountry = (countryCode: string) => {
        if (!selectedCountries.includes(countryCode as CountryCode)) {
            setSelectedCountries([...selectedCountries, countryCode as CountryCode]);
            setExcluded({ ...excluded, [countryCode as CountryCode]: [] });
            setSelectedRegions({ ...selectedRegions, [countryCode as CountryCode]: null });
        }
    };

    const removeCountry = (countryCode: string) => {
        setSelectedCountries(
            selectedCountries.filter((code) => code !== (countryCode as CountryCode))
        );
        const newExcluded = { ...excluded };
        delete newExcluded[countryCode as CountryCode];
        setExcluded(newExcluded);
        const newSelectedRegions = { ...selectedRegions };
        delete newSelectedRegions[countryCode as CountryCode];
        setSelectedRegions(newSelectedRegions);
    };

    const getLocalisationFlexibilityText = () => {
        switch (localisationFlexibility) {
            case 0:
                return t('searchDefinition.localisation.flexible');
            case 1:
                return t('searchDefinition.localisation.strict');
            case 2:
                return t('searchDefinition.localisation.veryStrict');
            default:
                return t('searchDefinition.localisation.flexible');
        }
    };

    return (
        <>
            <div className="mb-10 flex items-center justify-start gap-4 pt-6">
                <span className="flex items-center gap-2 text-lg font-medium">
                    <MapPin size={20} /> {t('searchDefinition.localisation.title')}
                </span>
                <Slider.Root
                    className="relative flex h-5 w-40 touch-none select-none items-center"
                    value={[localisationFlexibility]}
                    onValueChange={handleLocalisationFlexibilityChange}
                    min={0}
                    max={2}
                    step={1}
                >
                    <Slider.Track className="relative h-[6px] grow rounded-full bg-gray-200">
                        <Slider.Range className="absolute h-full rounded-full bg-primary" />
                    </Slider.Track>
                    <Slider.Thumb
                        className="block h-5 w-5 rounded-full border-2 border-primary bg-white shadow hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label={t('searchDefinition.localisation.flexible')}
                    />
                </Slider.Root>
                <p className="text-sm text-gray-400">{getLocalisationFlexibilityText()}</p>
                <div className="relative ml-auto">
                    <Button
                        variant="primary"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-6"
                    >
                        {t('searchDefinition.localisation.addCountry')}
                        <ChevronDown
                            size={16}
                            className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </Button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
                            {Object.entries(AVAILABLE_COUNTRIES).map(([code, country]) => (
                                <button
                                    key={code}
                                    onClick={() => {
                                        if (!selectedCountries.includes(code as CountryCode)) {
                                            addCountry(code);
                                        }
                                        setIsDropdownOpen(false);
                                    }}
                                    disabled={selectedCountries.includes(code as CountryCode)}
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                                        selectedCountries.includes(code as CountryCode)
                                            ? 'bg-gray-100'
                                            : ''
                                    }`}
                                >
                                    <country.Flag className="h-4 w-6" />
                                    <span className="font-medium">
                                        {t(`searchDefinition.localisation.countries.${code}`)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedCountries.map((countryCode) => (
                <div key={countryCode} className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-bold">
                            {t(`searchDefinition.localisation.countries.${countryCode}`)}
                        </h2>
                        {selectedCountries.length > 1 && (
                            <button
                                onClick={() => removeCountry(countryCode)}
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash size={20} />
                            </button>
                        )}
                    </div>
                    <div className="grid w-full grid-cols-2">
                        <div
                            ref={(el) => (chartRefs.current[countryCode] = el)}
                            style={{ width: '90%', height: '600px', background: 'transparent' }}
                        />
                        <div className="flex flex-1 flex-col items-center justify-center border-l border-gray-400 px-10">
                            {selectedRegions[countryCode] && (
                                <div className="h-full w-full p-6 text-center">
                                    <h3 className="text-xl font-bold">
                                        {t(
                                            `searchDefinition.localisation.regions.${selectedRegions[countryCode]}`
                                        ) || selectedRegions[countryCode]}
                                    </h3>
                                    <p className="mb-4 text-xs text-gray-400">
                                        {t('searchDefinition.localisation.description')}
                                    </p>
                                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        {(() => {
                                            const data =
                                                (AVAILABLE_COUNTRIES[countryCode].data as any)[
                                                    selectedRegions[countryCode]!
                                                ] || DEFAULT_REGION_DATA;
                                            return (
                                                <>
                                                    <div className="flex flex-col items-start rounded-lg border p-4">
                                                        <div className="flex w-full justify-between">
                                                            <span className="mb-1 text-xs text-gray-400">
                                                                {t(
                                                                    'searchDefinition.localisation.cards.inhabitants'
                                                                )}
                                                            </span>
                                                            <UserRound size={16} />
                                                        </div>
                                                        <span className="text-2xl font-bold">
                                                            {data.habitants}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                                            <TrendingDown size={16} />
                                                            {t(
                                                                'searchDefinition.localisation.cards.trends.down',
                                                                { value: '0.69' }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-start rounded-lg border p-4">
                                                        <div className="flex w-full justify-between">
                                                            <span className="mb-1 text-xs text-gray-400">
                                                                {t(
                                                                    'searchDefinition.localisation.cards.tenantSearch'
                                                                )}
                                                            </span>
                                                            <Search size={16} />
                                                        </div>
                                                        <span className="text-2xl font-bold">
                                                            {data.rechercheLocataire}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-green-500">
                                                            <TrendingUp size={16} />
                                                            {t(
                                                                'searchDefinition.localisation.cards.trends.up',
                                                                { value: '2.4' }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-start rounded-lg border p-4">
                                                        <div className="flex w-full justify-between">
                                                            <span className="mb-1 text-xs text-gray-400">
                                                                {t(
                                                                    'searchDefinition.localisation.cards.buyerSearch'
                                                                )}
                                                            </span>
                                                            <Home size={16} />
                                                        </div>
                                                        <span className="text-2xl font-bold">
                                                            {data.rechercheAcquereur}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                                            <TrendingDown size={16} />
                                                            {t(
                                                                'searchDefinition.localisation.cards.trends.down',
                                                                { value: '1.2' }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-start rounded-lg border p-4">
                                                        <div className="flex w-full justify-between">
                                                            <span className="mb-1 text-xs text-gray-400">
                                                                {t(
                                                                    'searchDefinition.localisation.cards.rentalTension'
                                                                )}
                                                            </span>
                                                            <AlertTriangle size={16} />
                                                        </div>
                                                        <span className="text-2xl font-bold">
                                                            {data.tensionLocative}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                                            <TrendingUp size={16} />
                                                            {t(
                                                                'searchDefinition.localisation.cards.trends.up',
                                                                { value: '5.1' }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-start rounded-lg border p-4">
                                                        <div className="flex w-full justify-between">
                                                            <span className="mb-1 text-xs text-gray-400">
                                                                {t(
                                                                    'searchDefinition.localisation.cards.transactionTension'
                                                                )}
                                                            </span>
                                                            <Building2 size={16} />
                                                        </div>
                                                        <span className="text-2xl font-bold">
                                                            {data.tensionTransactionnelle}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-start rounded-lg border p-4">
                                                        <div className="flex w-full justify-between">
                                                            <span className="mb-1 text-xs text-gray-400">
                                                                {t(
                                                                    'searchDefinition.localisation.cards.capitalGain'
                                                                )}
                                                            </span>
                                                            <ChartPie size={16} />
                                                        </div>
                                                        <span className="text-2xl font-bold">
                                                            {data.plusValue}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-green-500">
                                                            <TrendingUp size={16} />
                                                            {t(
                                                                'searchDefinition.localisation.cards.trends.up',
                                                                { value: '0.8' }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-start rounded-lg border p-4">
                                                        <div className="flex w-full justify-between">
                                                            <span className="mb-1 text-xs text-gray-400">
                                                                {t(
                                                                    'searchDefinition.localisation.cards.unemploymentRate'
                                                                )}
                                                            </span>
                                                            <ChartNoAxesColumn size={16} />
                                                        </div>
                                                        <span className="text-2xl font-bold">
                                                            {data.tauxChomage}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-red-500">
                                                            <TrendingUp size={16} />
                                                            {t(
                                                                'searchDefinition.localisation.cards.trends.up',
                                                                { value: '0.3' }
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-start rounded-lg border p-4">
                                                        <div className="flex w-full justify-between">
                                                            <span className="mb-1 text-xs text-gray-400">
                                                                {t(
                                                                    'searchDefinition.localisation.cards.businessCreation'
                                                                )}
                                                            </span>
                                                            <Briefcase size={16} />
                                                        </div>
                                                        <span className="text-2xl font-bold">
                                                            {data.creationEntreprise}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-xs text-green-500">
                                                            <TrendingUp size={16} />
                                                            {t(
                                                                'searchDefinition.localisation.cards.trends.up',
                                                                { value: '4.2' }
                                                            )}
                                                        </span>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <button
                                        onClick={() =>
                                            toggleRegion(countryCode, selectedRegions[countryCode]!)
                                        }
                                        className={`rounded px-4 py-2 font-semibold ${
                                            excluded[countryCode]?.includes(
                                                selectedRegions[countryCode]!
                                            )
                                                ? 'bg-green-600 hover:bg-green-700'
                                                : 'bg-red-600 hover:bg-red-700'
                                        } text-white`}
                                    >
                                        {excluded[countryCode]?.includes(
                                            selectedRegions[countryCode]!
                                        )
                                            ? t('searchDefinition.localisation.includeRegion')
                                            : t('searchDefinition.localisation.excludeRegion')}
                                    </button>
                                </div>
                            )}
                            {!selectedRegions[countryCode] && (
                                <div className="text-center text-gray-400">
                                    {t('searchDefinition.localisation.description')}
                                </div>
                            )}
                        </div>
                    </div>
                    {excluded[countryCode]?.length > 0 && (
                        <div className="mt-4">
                            <h3 className="mb-2 text-sm font-medium text-gray-500">
                                {t('searchDefinition.localisation.excludedRegions', {
                                    country: t(
                                        `searchDefinition.localisation.countries.${countryCode}`
                                    ),
                                })}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {excluded[countryCode]?.map((id) => (
                                    <span
                                        key={id}
                                        className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm text-red-700"
                                    >
                                        <XCircle size={16} />{' '}
                                        {t(`searchDefinition.localisation.regions.${id}`) || id}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}
