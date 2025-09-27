import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components';
import { BadgeService } from '@/services/badgeService';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { DossierListDto } from '@shared/dto';
import { Eye, Pencil, Trash } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';

interface FoldersListProps {
    dossiers: DossierListDto[];
    sortColumn: string | null;
    sortDirection: 'asc' | 'desc' | null;
    onSort: (column: string) => void;
    onEdit: (dossier: DossierListDto) => void;
    onDelete: (id: string) => void;
}

export default function FoldersList({
    dossiers,
    sortColumn,
    sortDirection,
    onSort,
    onEdit,
    onDelete,
}: FoldersListProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Use actual customer data from backend
    const getClientNames = (dossier: DossierListDto): string => {
        if (!dossier.customers || dossier.customers.length === 0) {
            return t('folders.components.list.noClients');
        }

        return dossier.customers
            .map((customer) => `${customer.firstName} ${customer.lastName}`)
            .join(', ');
    };

    const getConsultantName = (dossier: DossierListDto): string => {
        if (dossier.owner) {
            return `${dossier.owner.firstName} ${dossier.owner.lastName}`;
        }
        return t('folders.components.list.unknownConsultant');
    };

    const handleRowClick = (dossier: DossierListDto) => {
        console.log('Dossier sélectionné:', dossier);
    };

    return (
        <Table variant="default">
            <TableHeader sticky>
                <TableRow>
                    <TableHead
                        className="w-1/6"
                        sortable
                        sortDirection={sortColumn === 'name' ? sortDirection : null}
                        onClick={() => onSort('name')}
                    >
                        {t('folders.components.list.name')}
                    </TableHead>
                    <TableHead
                        className="w-1/6"
                        sortable
                        sortDirection={sortColumn === 'clientId' ? sortDirection : null}
                        onClick={() => onSort('clientId')}
                    >
                        {t('folders.components.list.client')}
                    </TableHead>
                    <TableHead
                        className="w-1/6"
                        sortable
                        sortDirection={sortColumn === 'consultantId' ? sortDirection : null}
                        onClick={() => onSort('consultantId')}
                    >
                        {t('folders.components.list.consultant')}
                    </TableHead>
                    <TableHead className="w-1/6">{t('folders.components.list.status')}</TableHead>
                    <TableHead className="w-1/6">{t('folders.components.list.citySize')}</TableHead>
                    <TableHead className="w-1/6">{t('folders.components.list.actions')}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {dossiers.map((dossier, index) => {
                    const consultant = getConsultantName(dossier);
                    return (
                        <TableRow key={index} onClick={() => handleRowClick(dossier)} hover>
                            <TableCell>{dossier.name}</TableCell>
                            <TableCell>{getClientNames(dossier)}</TableCell>
                            <TableCell>{consultant}</TableCell>
                            <TableCell>
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${BadgeService.getStatusColor(dossier.status)}`}
                                >
                                    {dossier.status}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm text-gray-500">
                                    {t('folders.components.list.seeDetails')}
                                </span>
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`/folder/${dossier.id}`)}
                                >
                                    <Eye size={16} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(dossier);
                                    }}
                                >
                                    <Pencil size={16} />
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(dossier.id);
                                    }}
                                >
                                    <Trash size={16} />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
