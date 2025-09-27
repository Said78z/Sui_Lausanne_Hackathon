import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

interface Log {
    date: string;
    heure: string;
    action: string;
    details?: string;
    ip?: string;
    utilisateur?: string;
}

interface LogsSectionProps {
    logs: Log[];
    title?: string;
}

export function LogsSection({ logs, title = 'Logs' }: LogsSectionProps) {
    return (
        <div className="relative h-full w-full rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">{title}</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Action</TableHead>
                        {logs[0]?.details && <TableHead>Détails</TableHead>}
                        {logs[0]?.ip && <TableHead>IP</TableHead>}
                        {logs[0]?.utilisateur && <TableHead>Utilisateur</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log, index) => (
                        <TableRow key={index}>
                            <TableCell>{log.date}</TableCell>
                            <TableCell>{log.heure}</TableCell>
                            <TableCell>{log.action}</TableCell>
                            {log.details && <TableCell>{log.details}</TableCell>}
                            {log.ip && <TableCell>{log.ip}</TableCell>}
                            {log.utilisateur && <TableCell>{log.utilisateur}</TableCell>}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
