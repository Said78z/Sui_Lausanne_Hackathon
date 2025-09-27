import { City } from '@/types/city';

interface EconomyCardProps {
    city: City;
}

export function EconomyCard({ city }: EconomyCardProps) {
    return (
        <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Économie</h2>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-600">Médiane du niveau de vie</p>
                    <p className="text-xl font-semibold">{city.medianIncome} €/ménage</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Taux de chômage</p>
                    <p className="text-xl font-semibold">{city.unemploymentRate}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">
                        Catégorie socio-professionnelle principale
                    </p>
                    <p className="text-xl font-semibold">{city.mainSocioProfCategory}</p>
                </div>
            </div>
        </div>
    );
}
