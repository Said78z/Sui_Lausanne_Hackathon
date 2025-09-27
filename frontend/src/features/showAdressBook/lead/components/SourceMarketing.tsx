import { useProspectById } from '@/api/queries/prospectQueries';

interface SourceMarketingProps {
    prospectId: string;
}

export function SourceMarketing({ prospectId }: SourceMarketingProps) {
    const { data: prospect, isLoading, error } = useProspectById(prospectId);

    if (isLoading) {
        return (
            <div className="relative rounded-xl border border-gray-200 bg-white p-10">
                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                <h2 className="mb-6 text-sm text-gray-600">Source et Marketing</h2>
                <div className="text-center text-gray-500">Chargement...</div>
            </div>
        );
    }

    if (error || !prospect) {
        return (
            <div className="relative rounded-xl border border-gray-200 bg-white p-10">
                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                <h2 className="mb-6 text-sm text-gray-600">Source et Marketing</h2>
                <div className="text-center text-gray-500">Aucune donnée marketing disponible</div>
            </div>
        );
    }

    return (
        <div className="relative rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Source et Marketing</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-600">Source</p>
                    <p className="text-gray-800">{prospect.source || 'Non renseigné'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">UTM Source</p>
                    <p className="text-gray-800">{prospect.utmSource || 'Non renseigné'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">UTM Medium</p>
                    <p className="text-gray-800">{prospect.utmMedium || 'Non renseigné'}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-600">UTM Campaign</p>
                    <p className="text-gray-800">{prospect.utmCampaign || 'Non renseigné'}</p>
                </div>
            </div>
        </div>
    );
}
