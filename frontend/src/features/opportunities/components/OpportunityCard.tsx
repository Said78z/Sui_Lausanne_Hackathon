import { BadgeService } from '@/services/badgeService';

import { OpportunityDto } from '@shared/dto/opportunityDto';
import { Building, FileText, MapPin, Users, Wrench } from 'lucide-react';

import citiesData from '@/mocks/citiesMock.json';

import { FranceMap } from './FranceMap';
import { getExpectedFiles } from './OpportunitiesGrid';

interface OpportunityCardProps {
    opportunity: OpportunityDto;
    onClick?: () => void;
}

// Récupérer la population réelle depuis citiesMock.json
const getCitySize = (cityName: string): number => {
    // Nettoyer le nom de la ville pour la recherche (enlever les arrondissements, etc.)
    const cleanCityName = cityName.split(' ')[0]; // Prendre seulement le premier mot

    // Chercher la ville dans les données
    const city = citiesData.cities.find(
        (c) => c.name.toLowerCase() === cleanCityName.toLowerCase()
    );

    return city ? city.population : 0; // Retourner 0 si la ville n'est pas trouvée
};

// État locatif simulé
const getRentalState = (): number => {
    return Math.floor(Math.random() * 100);
};

// Travaux simulés
const getWorkCost = (): number => {
    const costs = [0, 5000, 15000, 25000, 50000];
    return costs[Math.floor(Math.random() * costs.length)];
};

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
    const citySize = getCitySize(opportunity.city);
    const rentalState = getRentalState();
    const workCost = getWorkCost();
    const expectedFiles = getExpectedFiles(opportunity.id);

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDepartment = (postalCode: number): string => {
        return String(Math.floor(postalCode / 1000)).padStart(2, '0');
    };

    // Utiliser le badgeService pour obtenir le badge de statut
    const statusBadge = BadgeService.getOpportunityStatusBadge(opportunity.status);

    return (
        <div
            className="relative cursor-pointer rounded-[1rem] border border-gray-200 bg-white p-6 duration-200"
            onClick={onClick}
        >
            {/* Barre colorée à gauche */}
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary" />

            {/* Badge de statut */}
            <div className="absolute right-4 top-4">
                <span
                    className={`${statusBadge.color} rounded-md px-2 py-1 text-xs font-medium text-white`}
                >
                    {statusBadge.text}
                </span>
            </div>

            {/* Titre et localisation */}
            <div className="mb-4 pr-20">
                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
                    {opportunity.title}
                </h3>
                <div className="mb-1 flex items-center text-gray-600">
                    <MapPin size={14} className="mr-2" />
                    <span className="text-sm">{opportunity.city}</span>
                </div>
                <div className="text-xs text-gray-500">
                    ({formatDepartment(opportunity.postalCode)} -{' '}
                    {opportunity.address?.state || 'N/A'})
                </div>
            </div>

            {/* Prix principal */}
            <div className="mb-6">
                <div className="mb-1 text-2xl font-bold text-gray-900">
                    {formatPrice(opportunity.price)}
                </div>
                <div className="text-sm text-gray-600">INCONNU</div>
            </div>

            {/* Carte de France */}
            <div className="mb-6 h-32 overflow-hidden rounded-lg border border-gray-100">
                <FranceMap
                    regionName={opportunity.address?.state || ''}
                    regionColor="#1d223e"
                    cityName={opportunity.city}
                    className="h-full"
                />
            </div>

            {/* Informations en grille */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="mb-3 flex items-center">
                        <Wrench size={14} className="mr-2 text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-600">Travaux</div>
                            <div className="font-semibold">
                                {workCost === 0 ? '0€' : formatPrice(workCost)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <Building size={14} className="mr-2 text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-600">Taille ville</div>
                            <div className="font-semibold">
                                {citySize > 0 ? citySize.toLocaleString() : 'Inconnue'}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="mb-3 flex items-center">
                        <Users size={14} className="mr-2 text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-600">État locatif</div>
                            <div className="font-semibold">{rentalState}%</div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <FileText size={14} className="mr-2 text-gray-400" />
                        <div>
                            <div className="text-xs text-gray-600">Dossiers</div>
                            <div className="font-semibold">{expectedFiles}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
