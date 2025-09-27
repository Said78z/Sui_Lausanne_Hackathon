import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

interface Appointment {
    date: string;
    time: string;
    client: string;
    type: string;
}

interface PlanningSectionProps {
    appointments: Appointment[];
}

export function PlanningSection({ appointments }: PlanningSectionProps) {
    return (
        <div className="rounded-[1rem] border border-gray-200 bg-white p-10">
            <h2 className="mb-6 text-sm text-gray-600">Planning</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Heure</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Type</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map((appointment, index) => (
                        <TableRow key={index}>
                            <TableCell>{appointment.date}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>{appointment.client}</TableCell>
                            <TableCell>{appointment.type}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
