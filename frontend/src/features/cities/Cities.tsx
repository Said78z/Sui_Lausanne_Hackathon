import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import * as am5 from '@amcharts/amcharts5';
import am5geodata_franceLow from '@amcharts/amcharts5-geodata/franceLow';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import { Eye } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';
import { FilterButton } from '@/components/ui/FilterButton/FilterButton';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

import citiesData from '@/mocks/citiesMock.json';

interface City {
    id: string;
    name: string;
    department: string;
    region: string;
    population: number;
    latitude: number;
    longitude: number;
}

interface FilterOption {
    label: string;
    value: string;
    type: string;
}

export default function Cities() {
    const { t } = useTranslation();
    const chartRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<am5.Root | null>(null);
    const [cities, _setCities] = useState<City[]>(citiesData.cities);
    const [filteredCities, setFilteredCities] = useState<City[]>(cities);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [filters, setFilters] = useState({
        region: 'Toutes',
    });

    useLayoutEffect(() => {
        if (!chartRef.current) return;

        const root = am5.Root.new(chartRef.current);
        rootRef.current = root;

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
                geoJSON: am5geodata_franceLow,
                valueField: 'value',
                calculateAggregates: true,
            })
        );

        polygonSeries.mapPolygons.template.setAll({
            tooltipText: '{name}',
            interactive: true,
            fill: am5.color(0xe0e0e0),
            stroke: am5.color(0xffffff),
            strokeWidth: 1,
        });

        // Ajouter les points pour chaque ville
        const pointSeries = chart.series.push(
            am5map.MapPointSeries.new(root, {
                latitudeField: 'latitude',
                longitudeField: 'longitude',
            })
        );

        pointSeries.bullets.push(() => {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    radius: 5,
                    fill: am5.color(0x1d223e),
                    tooltipText: '{name}',
                }),
            });
        });

        pointSeries.data.setAll(filteredCities);

        return () => {
            root.dispose();
        };
    }, [filteredCities]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleFilterChange = useCallback(
        (type: string, value: string) => {
            setFilters({
                ...filters,
                [type]: value,
            });
        },
        [filters]
    );

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    useEffect(() => {
        let result = [...cities];

        if (searchQuery) {
            result = result.filter(
                (city) =>
                    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    city.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    city.region.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filters.region !== 'Toutes') {
            result = result.filter((city) => city.region === filters.region);
        }

        if (sortColumn && sortDirection) {
            result = [...result].sort((a, b) => {
                const aValue = a[sortColumn as keyof City];
                const bValue = b[sortColumn as keyof City];

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
                }

                return sortDirection === 'asc'
                    ? String(aValue).localeCompare(String(bValue))
                    : String(bValue).localeCompare(String(aValue));
            });
        }

        setFilteredCities(result);
    }, [searchQuery, filters, sortColumn, sortDirection, cities]);

    const paginatedCities = filteredCities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const regionOptions: FilterOption[] = [
        { label: t('cities.filters.allRegions'), value: 'Toutes', type: 'region' },
        ...Array.from(new Set(cities.map((city) => city.region))).map((region) => ({
            label: region,
            value: region,
            type: 'region',
        })),
    ];

    const filterOptions = regionOptions;

    return (
        <div className="overflow-hidden p-6">
            <h1 className="mb-6 text-2xl font-bold">{t('cities.title')}</h1>
            <div className="grid h-[calc(100vh-250px)] grid-cols-12 gap-6">
                <div className="col-span-7 pr-4">
                    <div className="mb-4 flex w-full gap-4">
                        <SearchBar onSearch={handleSearch} className="flex-1" />
                        <FilterButton
                            filters={{
                                region: filters.region,
                            }}
                            filterOptions={filterOptions}
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    <div className="mb-4 flex items-center gap-2 px-4">
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="investors-checkbox"
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 bg-white transition-all checked:border-primary checked:bg-primary hover:border-primary/50 focus:outline-primary"
                            />
                            <svg
                                className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 opacity-0 peer-checked:opacity-100"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <label
                            htmlFor="investors-checkbox"
                            className="cursor-pointer text-sm font-medium text-gray-700 hover:text-primary"
                        >
                            Villes avec des investisseurs
                        </label>
                    </div>
                    <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                        <Table variant="striped">
                            <TableHeader>
                                <TableRow>
                                    <TableHead
                                        sortable
                                        sortDirection={sortColumn === 'name' ? sortDirection : null}
                                        onClick={() => handleSort('name')}
                                    >
                                        {t('cities.table.name')}
                                    </TableHead>
                                    <TableHead
                                        sortable
                                        sortDirection={
                                            sortColumn === 'department' ? sortDirection : null
                                        }
                                        onClick={() => handleSort('department')}
                                    >
                                        {t('cities.table.department')}
                                    </TableHead>
                                    <TableHead
                                        sortable
                                        sortDirection={
                                            sortColumn === 'population' ? sortDirection : null
                                        }
                                        onClick={() => handleSort('population')}
                                    >
                                        {t('cities.table.population')}
                                    </TableHead>
                                    <TableHead className="w-1/6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCities.map((city) => (
                                    <TableRow key={city.id}>
                                        <TableCell>{city.name}</TableCell>
                                        <TableCell>{city.department}</TableCell>
                                        <TableCell>
                                            {city.population.toLocaleString('fr-FR')}
                                        </TableCell>
                                        <TableCell>
                                            <Link to={`/city/${city.id}`}>
                                                <Button variant="primary">
                                                    <Eye size={16} />
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="mt-auto flex justify-center pt-4">
                        {filteredCities.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={Math.ceil(filteredCities.length / itemsPerPage)}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>
                <div className="col-span-5 border-l bg-white p-4">
                    <div
                        ref={chartRef}
                        className="h-full w-full rounded-lg"
                        style={{ background: 'transparent' }}
                    />
                </div>
            </div>
        </div>
    );
}
