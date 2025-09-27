import React from 'react';
import { Link } from 'react-router-dom';

import type { OpportunityDto } from '@shared/dto';
import { OpportunityStatus } from '@shared/dto';

interface OpportunityCardProps {
    opportunity: OpportunityDto;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
    // Badge couleur selon le statut
    const statusColor =
        {
            [OpportunityStatus.QUALIFIED]: 'bg-blue-100 text-blue-700',
            [OpportunityStatus.NEW]: 'bg-gray-100 text-gray-700',
            [OpportunityStatus.PREQUALIFIED]: 'bg-purple-100 text-purple-700',
            [OpportunityStatus.RELEVANT]: 'bg-green-100 text-green-700',
        }[opportunity.status] || 'bg-gray-100 text-gray-700';

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-2xl">
            {/* Image */}
            <div className="flex h-40 w-full items-center justify-center bg-gray-200">
                {opportunity.image ? (
                    <img
                        src={opportunity.image}
                        alt={opportunity.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-gray-400">Aucune image</span>
                )}
            </div>
            {/* Contenu */}
            <div className="p-5">
                <span
                    className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
                >
                    {opportunity.status}
                </span>
                <h3 className="mb-1 text-lg font-bold">{opportunity.title}</h3>
                <div className="mb-2 text-sm text-gray-500">
                    {opportunity.city} {opportunity.cityFullName && `(${opportunity.cityFullName})`}
                </div>
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-700">
                        {formatPrice(opportunity.price)}
                    </span>
                    {opportunity.rentalYield && (
                        <span className="rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                            {opportunity.rentalYield}%
                        </span>
                    )}
                </div>
                <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-600">
                    <span>
                        Surface: <b>{opportunity.surface} m²</b>
                    </span>
                    <span>
                        Code postal: <b>{opportunity.postalCode}</b>
                    </span>
                </div>
                <Link
                    to={`/opportunity/${opportunity.id}`}
                    className="block w-full rounded-lg bg-blue-600 py-2 text-center font-semibold text-white transition hover:bg-blue-700"
                >
                    Voir les détails
                </Link>
            </div>
        </div>
    );
};
