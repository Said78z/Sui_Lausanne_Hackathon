import { useCallsByProspectId } from '@/api/queries/callQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';

import { Badge } from '@/components/ui/Badge/Badge';

interface CallHistoryProps {
    prospectId: string;
}

export function CallHistory({ prospectId }: CallHistoryProps) {
    const { data: calls, isLoading, error } = useCallsByProspectId(prospectId);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case 'answered':
            case 'repondu':
                return <Badge variant="success" rounded>Décroché</Badge>;
            case 'no_answer':
            case 'non_repondu':
                return <Badge variant="warning" rounded>Non décroché</Badge>;
            case 'busy':
            case 'occupe':
                return <Badge variant="danger" rounded>Occupé</Badge>;
            default:
                return <Badge variant="primary" rounded>{status}</Badge>;
        }
    };

    return (
        <div className="relative w-full rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Historique des appels</h2>
            
            {isLoading && (
                <div className="text-center text-gray-500">Chargement des appels...</div>
            )}
            
            {error && (
                <div className="text-center text-red-500">Erreur lors du chargement des appels</div>
            )}
            
            {!isLoading && !error && (!calls || calls.length === 0) && (
                <div className="text-center text-gray-500">Aucun appel trouvé pour ce prospect</div>
            )}
            
            {calls && calls.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Heure</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Consultant</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {calls.map((call) => (
                            <TableRow key={call.id}>
                                <TableCell>{formatDate(call.createdAt)}</TableCell>
                                <TableCell>{formatTime(call.createdAt)}</TableCell>
                                <TableCell>
                                    {getStatusBadge(call.status)}
                                </TableCell>
                                <TableCell>
                                    {call.calledById || 'Non renseigné'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
