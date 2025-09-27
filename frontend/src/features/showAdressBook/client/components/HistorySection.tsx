import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';

interface Appointment {
    sujet: string;
    date: string;
    statut: string;
}

interface Mail {
    sujet: string;
    date: string;
}

interface HistorySectionProps {
    appointments: Appointment[];
    mails: Mail[];
}

export function HistorySection({ appointments, mails }: HistorySectionProps) {
    return (
        <div className="grid w-full grid-cols-2 gap-6">
            {/* Section historique rendez-vous */}
            <div className="relative rounded-xl border border-gray-200 bg-white p-10">
                <div className="absolute left-0 top-1/2 h-3/4 w-1 -translate-y-1/2 bg-tertiary"></div>
                <h2 className="mb-6 text-sm text-gray-600">Historique rendez-vous</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sujet</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Statut</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {appointments.map((rdv, index) => (
                            <TableRow key={index}>
                                <TableCell>{rdv.sujet}</TableCell>
                                <TableCell>{rdv.date}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={rdv.statut === 'Terminé' ? 'success' : 'warning'}
                                        rounded
                                    >
                                        {rdv.statut}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Section historique mails automatiques */}
            <div className="relative rounded-xl border border-gray-200 bg-white p-10">
                <div className="absolute left-0 top-1/2 h-3/4 w-1 -translate-y-1/2 bg-tertiary"></div>
                <h2 className="mb-6 text-sm text-gray-600">Historique mails automatiques</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sujet</TableHead>
                            <TableHead>Date d'envoi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mails.map((mail, index) => (
                            <TableRow key={index}>
                                <TableCell>{mail.sujet}</TableCell>
                                <TableCell>{mail.date}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
