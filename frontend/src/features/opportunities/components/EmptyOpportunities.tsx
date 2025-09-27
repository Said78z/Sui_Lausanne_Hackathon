import { Filter } from 'lucide-react';

export function EmptyOpportunities() {
    return (
        <div className="py-12 text-center">
            <div className="mb-2 text-gray-400">
                <Filter size={48} className="mx-auto" />
            </div>
            <h3 className="mb-1 text-lg font-medium text-gray-900">Aucune opportunité trouvée</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche</p>
        </div>
    );
}
