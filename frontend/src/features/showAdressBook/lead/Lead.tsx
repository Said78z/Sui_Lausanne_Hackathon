import { useProspectById } from '@/api/queries/prospectQueries';
import { useParams } from 'react-router-dom';

import {
    AppointmentHistory,
    AutomaticEmailHistory,
    CallHistory,
    FinancialSimulation,
    LeadIdentity,
    MarketplaceActions,
    Qualification,
    SourceMarketing,
} from './components';

export default function Lead() {
    const { id } = useParams();
    const { data: prospect, isLoading, error } = useProspectById(id!);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
                <div className="text-center text-lg">Chargement...</div>
            </div>
        );
    }

    if (error || !prospect) {
        return (
            <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
                <div className="text-center text-lg">Prospect non trouvé</div>
            </div>
        );
    }

    const fullName = `${prospect.firstName} ${prospect.lastName}`;

    return (
        <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
            <div className="mb-6 flex justify-between">
                <h1 className="text-3xl font-bold">{fullName}</h1>
            </div>

            <LeadIdentity prospect={prospect} />

            <div className="flex flex-wrap gap-6">
                {/* Colonne de gauche */}
                <div className="flex flex-1 basis-[calc(50%-12px)] flex-col gap-6">
                    <SourceMarketing prospectId={prospect.id} />
                    <FinancialSimulation prospectId={prospect.id} />
                </div>

                {/* Colonne de droite */}
                <div className="flex flex-1 basis-[calc(50%-12px)] flex-col gap-6">
                    <Qualification prospectId={prospect.id} />
                </div>

                <MarketplaceActions prospectId={prospect.id} userId={prospect.userId || undefined} />
                
                <AutomaticEmailHistory prospectId={prospect.id} />


                <div className="grid w-full grid-cols-2 gap-6">
                    <CallHistory prospectId={prospect.id} />
                    <AppointmentHistory prospectId={prospect.id} />
                </div>
            </div>
        </div>
    );
}
