import { City } from '@/types/city';

interface SecurityCardProps {
    city: City;
}

export function SecurityCard({ city }: SecurityCardProps) {
    return (
        <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Sécurité</h2>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-600">Cambriolages</p>
                    <p className="text-xl font-semibold">{city.crimeRates?.burglary || 0}‰</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Violences intrafamiliales</p>
                    <p className="text-xl font-semibold">
                        {city.crimeRates?.domesticViolence || 0}‰
                    </p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Dégradations</p>
                    <p className="text-xl font-semibold">{city.crimeRates?.vandalism || 0}‰</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Vols sans violence</p>
                    <p className="text-xl font-semibold">{city.crimeRates?.pickpocketing || 0}‰</p>
                </div>
            </div>
        </div>
    );
}
