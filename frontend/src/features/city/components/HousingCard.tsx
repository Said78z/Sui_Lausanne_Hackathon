import { City } from '@/types/city';

interface HousingCardProps {
    city: City;
}

export function HousingCard({ city }: HousingCardProps) {
    return (
        <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Logement</h2>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-600">Part de logement social</p>
                    <p className="text-xl font-semibold">{city.socialHousingRate}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Part de logement vacant</p>
                    <p className="text-xl font-semibold">{city.vacantHousingRate}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Densité de logement</p>
                    <p className="text-xl font-semibold">{city.housingDensity} log/km²</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Niveau de tension locative</p>
                    <p className="text-xl font-semibold">{city.rentalTension}/5</p>
                </div>
            </div>
        </div>
    );
}
