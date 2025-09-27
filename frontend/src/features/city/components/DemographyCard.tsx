import { City } from '@/types/city';

interface DemographyCardProps {
    city: City;
}

export function DemographyCard({ city }: DemographyCardProps) {
    return (
        <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Démographie</h2>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-600">Population</p>
                    <p className="text-xl font-semibold">
                        {city.population.toLocaleString()} habitants
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Densité de population</p>
                    <p className="text-xl font-semibold">{city.populationDensity} hab/km²</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Âge moyen</p>
                    <p className="text-xl font-semibold">{city.averageAge} ans</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Superficie</p>
                    <p className="text-xl font-semibold">{city.area} km²</p>
                </div>
            </div>
        </div>
    );
}
