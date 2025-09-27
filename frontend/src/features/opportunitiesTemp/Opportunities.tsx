import React from 'react';

import { useAuthStore } from '@/stores/authStore';

import { OpportunityList } from './component/OpportunityList';

const Opportunities: React.FC = () => {
    const { user } = useAuthStore();
    const userRoles = user?.roles ? [user.roles] : [];
    const userHasTokens = true; // À remplacer par la vraie logique si besoin

    return (
        <div className="d-flex">
            {/* Colonne de gauche pour le layout (si nécessaire) */}
            <div className="flex-shrink-0" style={{ width: '250px' }}>
                {/* Votre layout ici */}
            </div>

            {/* Colonne de droite pour la liste des opportunités */}
            <div className="flex-grow-1 px-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h1 className="mb-0">Opportunités</h1>
                </div>
                <OpportunityList userRoles={userRoles} userHasTokens={userHasTokens} />
            </div>
        </div>
    );
};

export default Opportunities;
