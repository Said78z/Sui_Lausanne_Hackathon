import { BadgeService } from '@/services/badgeService';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { DossierListDto } from '@shared/dto';
import { Eye, Pencil, Trash } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';

interface FoldersCardsProps {
    dossiers: DossierListDto[];
    onEdit: (dossier: DossierListDto) => void;
    onDelete: (id: string) => void;
}

export default function FoldersCards({ dossiers, onEdit, onDelete }: FoldersCardsProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const getClientNames = (dossier: DossierListDto): string => {
        if (!dossier.customers || dossier.customers.length === 0) {
            return t('folders.components.cards.noClients');
        }

        return dossier.customers
            .map((customer) => `${customer.firstName} ${customer.lastName}`)
            .join(', ');
    };

    const getConsultantName = (dossier: DossierListDto): string => {
        if (dossier.owner) {
            return `${dossier.owner.firstName} ${dossier.owner.lastName}`;
        }
        return t('folders.components.cards.unknownConsultant');
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dossiers.map((dossier, index) => {
                return (
                    <div
                        key={index}
                        className="group relative rounded-lg border border-gray-200 p-4 pl-6 transition-all"
                    >
                        <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary transition-all duration-300 ease-in-out group-hover:h-3/4 group-hover:rounded-full"></div>
                        <h3 className="mb-2 text-lg font-semibold">{dossier.name}</h3>
                        <div className="mb-2">
                            <span className="text-xs text-gray-600">
                                {t('folders.components.cards.clients')} :{' '}
                            </span>
                            <span className="text-sm">{getClientNames(dossier)}</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-xs text-gray-600">
                                {t('folders.components.cards.consultant')} :{' '}
                            </span>
                            <span className="text-sm">{getConsultantName(dossier)}</span>
                        </div>
                        <div className="mb-4 flex gap-2">
                            <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${BadgeService.getStatusColor(dossier.status)}`}
                            >
                                {dossier.status}
                            </span>
                            <span className="text-xs text-gray-500">
                                {dossier.customerCount} client{dossier.customerCount > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex justify-end gap-2">
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
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
