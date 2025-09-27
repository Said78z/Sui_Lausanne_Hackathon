import { useNavigate } from 'react-router-dom';

import { OpportunityDto } from '@shared/dto/opportunityDto';

// Replace mock import with API hook
import { useOpportunities } from '@/api/queries/opportunityQueries';

import { OpportunitiesGrid } from './components/OpportunitiesGrid';

export default function Opportunities() {
    const navigate = useNavigate();
    
    // Fetch opportunities from backend
    const { 
        data: opportunitiesResponse, 
        isLoading, 
        error 
    } = useOpportunities({ limit: "50" }); // Get more opportunities for the list
    
    const opportunities = opportunitiesResponse?.data || [];

    const handleOpportunityClick = (opportunity: OpportunityDto) => {
        navigate(`/opportunity/${opportunity.id}`);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen w-full overflow-y-auto p-6">
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Opportunités</h1>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des opportunités...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen w-full overflow-y-auto p-6">
                <div className="mb-8">
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">Opportunités</h1>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="text-red-600 text-lg mb-4">
                            Erreur lors du chargement des opportunités
                        </div>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-y-auto p-6">
            <div className="mb-8">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Opportunités</h1>
                <p className="text-gray-600">
                    {opportunities.length} opportunité{opportunities.length > 1 ? 's' : ''} trouvée{opportunities.length > 1 ? 's' : ''}
                </p>
            </div>

            <OpportunitiesGrid
                opportunities={opportunities}
                onOpportunityClick={handleOpportunityClick}
            />
        </div>
    );
}
