import { City } from '@/types/city';

interface TaxCardProps {
    city: City;
}

export function TaxCard({ city }: TaxCardProps) {
    return (
        <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Fiscalité</h2>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-600">Taxe foncière</p>
                    <p className="text-xl font-semibold">{city.propertyTaxRate}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Taxe d'habitation</p>
                    <p className="text-xl font-semibold">{city.housingTaxRate}%</p>
                </div>
            </div>
        </div>
    );
}
