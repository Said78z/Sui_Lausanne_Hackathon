import { City } from '@/types/city';

interface EquipmentCardProps {
    city: City;
}

export function EquipmentCard({ city }: EquipmentCardProps) {
    return (
        <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Équipements</h2>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-600">Établissements scolaires</p>
                    <p className="text-xl font-semibold">{city.schools} écoles</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Commerces à proximité</p>
                    <p className="text-xl font-semibold">{city.nearbyShops} commerces</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Équipements de loisirs</p>
                    <p className="text-xl font-semibold">{city.leisureFacilities} équipements</p>
                </div>
            </div>
        </div>
    );
}
