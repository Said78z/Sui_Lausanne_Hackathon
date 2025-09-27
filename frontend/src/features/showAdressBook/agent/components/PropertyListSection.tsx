import { Badge } from '@/components/ui/Badge/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

interface Property {
    name: string;
    status: string;
    proposalDate: string;
}

interface PropertyListSectionProps {
    properties: Property[];
}

export function PropertyListSection({ properties }: PropertyListSectionProps) {
    return (
        <div className="relative rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
            <h2 className="mb-6 text-sm text-gray-600">Liste des biens proposés</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Bien</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de proposition</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {properties.map((property, index) => (
                        <TableRow key={index}>
                            <TableCell>{property.name}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={property.status === 'Accepté' ? 'success' : 'danger'}
                                    rounded
                                >
                                    {property.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{property.proposalDate}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
