import { useMeetingsByProspectId } from '@/api/queries/meetingQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { Badge } from '@/components/ui/Badge/Badge';

interface AppointmentHistoryProps {
    prospectId: string;
}

export function AppointmentHistory({ prospectId }: AppointmentHistoryProps) {
    const { data: meetings, isLoading, error } = useMeetingsByProspectId(prospectId);

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
        switch (status) {
            case 'COMPLETED':
                return <Badge variant="success" rounded>Réalisé</Badge>;
            case 'SCHEDULED':
            case 'CONFIRMED':
                return <Badge variant="info" rounded>Planifié</Badge>;
            case 'CANCELLED':
                return <Badge variant="danger" rounded>Annulé</Badge>;
            case 'NO_SHOW':
                return <Badge variant="warning" rounded>Absent</Badge>;
            case 'RESCHEDULED':
                return <Badge variant="secondary" rounded>Reporté</Badge>;
            default:
                return <Badge variant="primary" rounded>{status}</Badge>;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'R1':
                return 'R1 - Premier contact';
            case 'R2':
                return 'R2 - Deuxième entretien';
            case 'R3':
                return 'R3 - Finalisation';
            case 'DISCOVERY':
                return 'Découverte';
            case 'PRESENTATION':
                return 'Présentation';
            case 'FOLLOW_UP':
                return 'Suivi';
            case 'CLOSING':
                return 'Signature';
            default:
                return type;
        }
    };

    return (
        <div className="relative w-full rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Historique des rendez-vous</h2>
            
            {isLoading && (
                <div className="text-center text-gray-500">Chargement des rendez-vous...</div>
            )}
            
            {error && (
                <div className="text-center text-gray-500">Aucun historique de rendez-vous disponible pour le moment</div>
            )}
            
            {!isLoading && !error && (!meetings || meetings.length === 0) && (
                <div className="text-center text-gray-500">Aucun rendez-vous planifié</div>
            )}
            
            {meetings && meetings.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Heure</TableHead>
                            <TableHead>Statut</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {meetings.map((meeting) => (
                            <TableRow key={meeting.id}>
                                <TableCell>{getTypeLabel(meeting.type)}</TableCell>
                                <TableCell>{formatDate(meeting.startingAt)}</TableCell>
                                <TableCell>{formatTime(meeting.startingAt)}</TableCell>
                                <TableCell>
                                    {getStatusBadge(meeting.status)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
