import { City } from '@/types/city';

import { useEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5geodata_franceLow from '@amcharts/amcharts5-geodata/franceLow';
import * as am5map from '@amcharts/amcharts5/map';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

interface CityMapProps {
    city: City;
}

export function CityMap({ city }: CityMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<am5.Root | null>(null);
    const chartRef = useRef<am5map.MapChart | null>(null);

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
                    radius: 5,
                    fill: am5.color(0x1d223e),
                    tooltipText: '{name}',
                }),
            });
        });

        pointSeries.data.setAll([city]);

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
    }, [city]);

    return (
        <div className="relative h-[calc(100vh-48px)] px-4">
            <div className="h-full w-full" ref={mapRef} />
        </div>
    );
}
