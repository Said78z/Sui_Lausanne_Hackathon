import { City } from '@/types/city';

interface TransportCardProps {
    city: City;
}

export function TransportCard({ city }: TransportCardProps) {
    return (
        <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Transport</h2>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-600">Déplacements en voiture</p>
                    <p className="text-xl font-semibold">{city.carCommuteRate}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Transports en commun</p>
                    <p className="text-xl font-semibold">{city.publicTransportRate}%</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Accessibilité transport</p>
                    <p className="text-xl font-semibold">{city.transportAccessibility}/10</p>
                </div>
                <div>
                    <p className="text-xs text-gray-600">Distance à l'aéroport</p>
                    <p className="text-xl font-semibold">{city.airportDistance} km</p>
                </div>
            </div>
        </div>
    );
}
