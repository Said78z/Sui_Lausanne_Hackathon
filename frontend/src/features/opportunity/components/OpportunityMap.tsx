import { useEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5geodata_franceLow from '@amcharts/amcharts5-geodata/franceLow';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

interface OpportunityMapProps {
    city: string;
    postalCode: number;
    // Coordonnées approximatives basées sur la ville (à adapter selon vos données)
    latitude?: number;
    longitude?: number;
}

export function OpportunityMap({ city, postalCode, latitude, longitude }: OpportunityMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<am5.Root | null>(null);
    const chartRef = useRef<am5map.MapChart | null>(null);

    // Coordonnées approximatives pour quelques villes (à étendre selon vos besoins)
    const getCityCoordinates = (cityName: string) => {
        const coordinates: { [key: string]: { latitude: number; longitude: number } } = {
            Paris: { latitude: 48.8566, longitude: 2.3522 },
            Lyon: { latitude: 45.764, longitude: 4.8357 },
            Marseille: { latitude: 43.2965, longitude: 5.3698 },
            Angerville: { latitude: 48.3089, longitude: 1.9989 },
        };

        return coordinates[cityName] || { latitude: 46.6034, longitude: 1.8883 }; // Centre de la France par défaut
    };

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
            })
        );
        chartRef.current = chart;

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

        const pointSeries = chart.series.push(
            am5map.MapPointSeries.new(root, {
                latitudeField: 'latitude',
                longitudeField: 'longitude',
            })
        );

        pointSeries.bullets.push(() => {
            return am5.Bullet.new(root, {
                sprite: am5.Circle.new(root, {
                    radius: 8,
                    fill: am5.color(0x1d223e),
                    stroke: am5.color(0xffffff),
                    strokeWidth: 2,
                    tooltipText: `{name} (${postalCode})`,
                }),
            });
        });

        const coords = getCityCoordinates(city);
        const cityData = {
            name: city,
            latitude: latitude || coords.latitude,
            longitude: longitude || coords.longitude,
        };

        pointSeries.data.setAll([cityData]);

        // Zoom initial sur la France
        chart.geoBounds = () => ({
            left: -5.5,
            right: 8.5,
            top: 51.5,
            bottom: 41.5,
        });

        return () => {
            root.dispose();
        };
    }, [city, postalCode, latitude, longitude]);

    return (
        <div className="relative h-[55vh]">
            <div className="h-full w-full" ref={mapRef} />
        </div>
    );
}
