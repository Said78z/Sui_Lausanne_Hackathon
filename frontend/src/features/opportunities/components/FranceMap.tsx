import { useEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5geodata_franceLow from '@amcharts/amcharts5-geodata/franceLow';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

interface FranceMapProps {
    regionName: string;
    regionColor: string;
    cityName: string;
    className?: string;
}

// Mapping des régions vers les codes amCharts
const regionMapping: Record<string, string> = {
    'Île-de-France': 'FR-IDF',
    'Auvergne-Rhône-Alpes': 'FR-ARA',
    "Provence-Alpes-Côte d'Azur": 'FR-PAC',
    'Nouvelle-Aquitaine': 'FR-NAQ',
    Occitanie: 'FR-OCC',
    'Hauts-de-France': 'FR-HDF',
    'Grand Est': 'FR-GES',
    'Pays de la Loire': 'FR-PDL',
    Bretagne: 'FR-BRE',
    Normandie: 'FR-NOR',
    'Bourgogne-Franche-Comté': 'FR-BFC',
    'Centre-Val de Loire': 'FR-CVL',
};

export function FranceMap({ regionName, regionColor, cityName, className = '' }: FranceMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<am5.Root | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        const root = am5.Root.new(mapRef.current);
        rootRef.current = root;

        root.setThemes([am5themes_Animated.new(root)]);

        const chart = root.container.children.push(
            am5map.MapChart.new(root, {
                panX: 'none',
                panY: 'none',
                wheelX: 'none',
                wheelY: 'none',
                projection: am5map.geoMercator(),
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 10,
                paddingRight: 10,
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
            interactive: false,
            fill: am5.color('#E5E7EB'), // Gris clair par défaut
            stroke: am5.color('#FFFFFF'),
            strokeWidth: 1,
        });

        // Colorer la région spécifique
        const regionCode = regionMapping[regionName];
        if (regionCode) {
            polygonSeries.mapPolygons.template.adapters.add('fill', (fill, target) => {
                const dataItem = target.dataItem;
                if (
                    dataItem &&
                    dataItem.dataContext &&
                    (dataItem.dataContext as any).id === regionCode
                ) {
                    return am5.color(regionColor);
                }
                return fill;
            });
        }

        // Zoom sur la France
        chart.geoBounds = () => ({
            left: -5.5,
            right: 8.5,
            top: 51.5,
            bottom: 41.5,
        });

        return () => {
            root.dispose();
        };
    }, [regionName, regionColor, cityName]);

    return (
        <div className={`relative ${className}`}>
            <div className="h-full w-full" ref={mapRef} />
        </div>
    );
}
