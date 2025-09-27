import InvitationService from '@/api/invitationService';
import { Button, FilterButton } from '@/components';
import { formatDate } from '@/utils/dateUtils';

import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { Loader, Plus, RefreshCw, Trash } from 'lucide-react';

import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

import DeleteConfirmation from './component/deleteConfirmation';
import SendNewInvitation from './component/sendNewInvitation';
import { InvitationType } from './types';

// TODO : Rajouter Error.tsx and locales
// TODO : Rajouter Mapping trad sur valeurs DB

export default function Invitation() {
    const { t } = useTranslation();
    const [invitations, setInvitations] = useState<InvitationType[]>([]);
    const [filteredInvitations, setFilteredInvitations] = useState<InvitationType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all',
    });
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [invitationToDelete, setInvitationToDelete] = useState<InvitationType | null>(null);
    const [isSendNewInvitationOpen, setIsSendNewInvitationOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isResendingInvitation, setIsResendingInvitation] = useState(false);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleFilterChange = useCallback(
        (type: string, value: string) => {
            setFilters({
                ...filters,
                [type]: value,
            });
        },
        [filters]
    );

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handleDeleteInvitation = (invitation: InvitationType) => {
        // Vérifier si l'invitation peut être supprimée
        if (invitation.status === 'ACCEPTED' || invitation.status === 'REJECTED') {
            setError(
                invitation.status === 'ACCEPTED'
                    ? t('invitation.alreadyAccepted')
                    : t('invitation.alreadyRejected')
            );
            return;
        }

        setInvitationToDelete(invitation);
        setIsConfirmDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (invitationToDelete) {
            setIsLoading(true);
            try {
                console.log('Deleting invitation:', invitationToDelete);

                // Utiliser l'ID de l'invitation directement au lieu du tokenId
                await InvitationService.deleteInvitation({
                    tokenId: invitationToDelete.id,
                });

                console.log('Invitation deleted successfully');

                setInvitations((prevInvitations) =>
                    prevInvitations.filter((invitation) => invitation.id !== invitationToDelete.id)
                );

                // Afficher un message de succès
                toast.success(t('invitation.deleteSuccess'));
            } catch (err) {
                setError('Failed to delete invitation');
                console.error('Error deleting invitation:', err);
            } finally {
                setIsLoading(false);
                setIsConfirmDialogOpen(false);
                setInvitationToDelete(null);
            }
        }
    };

    const handleSendNewInvitation = () => {
        setIsSendNewInvitationOpen(true);
    };

    const handleResendInvitation = async (invitation: InvitationType) => {
        // Vérifier si l'invitation peut être renvoyée
        if (invitation.status === 'ACCEPTED' || invitation.status === 'REJECTED') {
            setError(
                invitation.status === 'ACCEPTED'
                    ? t('invitation.alreadyAccepted')
                    : t('invitation.alreadyRejected')
            );
            return;
        }

        setIsResendingInvitation(true);
        try {
            console.log('Resending invitation for:', invitation.email);
            // Utiliser la nouvelle méthode pour renvoyer l'invitation
            const response = await InvitationService.resendInvitation(invitation.email);
            console.log('Resend invitation response:', response);

            if (response && response.data) {
                // Mettre à jour l'invitation dans la liste avec les nouvelles données
                const updatedInvitation = response.data;
                console.log('Updated invitation data:', updatedInvitation);

                setInvitations((prevInvitations) =>
                    prevInvitations.map((inv) =>
                        inv.id === invitation.id
                            ? {
                                  ...inv,
                                  tokenId:
                                      updatedInvitation.token?.id ||
                                      updatedInvitation.tokenId ||
                                      inv.tokenId,
                                  token:
                                      updatedInvitation.token?.token ||
                                      updatedInvitation.token ||
                                      inv.token,
                                  invitedAt: updatedInvitation.invitedAt || inv.invitedAt,
                                  expiresAt: updatedInvitation.expiresAt || inv.expiresAt,
                                  status: updatedInvitation.status || inv.status,
                              }
                            : inv
                    )
                );

                // Afficher un message de succès
                setError(null); // Effacer les erreurs précédentes
                toast.success(t('invitation.resendSuccess'));
            } else {
                // Si la réponse ne contient pas de données, rafraîchir toute la liste
                fetchInvitations();
            }
        } catch (err: any) {
            setError(err?.message || "Échec du renvoi de l'invitation");
            console.error("Erreur lors du renvoi de l'invitation:", err);
        } finally {
            setIsResendingInvitation(false);
        }
    };

    const fetchInvitations = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await InvitationService.getAllInvitations({});
            console.log('Raw response from backend:', response);

            if (response && response.data) {
                const invitationsData = Array.isArray(response.data)
                    ? response.data
                    : [response.data];

                console.log('Invitations data before formatting:', invitationsData);

                const formattedData = invitationsData.map((item: any) => {
                    console.log('Processing invitation item:', item);
                    console.log('Token data:', item.token);

                    // Extraction plus robuste du tokenId
                    let tokenId = '';
                    if (item.token && item.token.id) {
                        tokenId = item.token.id;
                    } else if (item.tokenId) {
                        tokenId = item.tokenId;
                    } else if (item.id) {
                        // Fallback à l'ID de l'invitation si aucun tokenId n'est disponible
                        tokenId = item.id;
                    }

                    console.log('Extracted tokenId:', tokenId);

                    return {
                        id: item.id || '',
                        email: item.email || '',
                        type: item.type || '',
                        status: item.status || 'pending',
                        invitedBy: {
                            id: item.invitedBy?.id || '',
                            firstName: item.invitedBy?.firstName || '',
                            lastName: item.invitedBy?.lastName || '',
                            email: item.invitedBy?.email || '',
                        },
                        invitedAt: item.invitedAt || item.createdAt || '',
                        registeredAt: item.registeredAt || null,
                        expiresAt: item.expiresAt || '',
                        token: item.token?.token || '',
                        tokenId: tokenId, // Utiliser la valeur extraite
                    };
                });

                console.log('Formatted invitations data:', formattedData);
                setInvitations(formattedData);
            } else {
                setInvitations([]);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch invitations');
            console.error('Error fetching invitations:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    useEffect(() => {
        let result = [...invitations];

        if (searchQuery) {
            result = result.filter((invitation) =>
                invitation.email.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filters.status !== 'all') {
            result = result.filter((invitation) => invitation.status === filters.status);
        }

        if (filters.type !== 'all') {
            result = result.filter((invitation) => invitation.type === filters.type);
        }

        setFilteredInvitations(result);
    }, [invitations, searchQuery, filters]);

    const statusFilterOptions = [
        { label: t('invitation.filters.all'), value: 'all', type: 'status' },
        { label: t('invitation.filters.accepted'), value: 'accepted', type: 'status' },
        { label: t('invitation.filters.rejected'), value: 'rejected', type: 'status' },
        { label: t('invitation.filters.pending'), value: 'pending', type: 'status' },
    ];

    const typeFilterOptions = [
        { label: t('invitation.filters.allTypes'), value: 'all', type: 'type' },
        { label: t('invitation.filters.employee'), value: 'EMPLOYEE', type: 'type' },
        { label: t('invitation.filters.cgp'), value: 'CGP', type: 'type' },
        { label: t('invitation.filters.agent'), value: 'AGENT', type: 'type' },
        { label: t('invitation.filters.client'), value: 'CLIENT', type: 'type' },
        { label: t('invitation.filters.prospect'), value: 'PROSPECT', type: 'type' },
        { label: t('invitation.filters.user'), value: 'USER', type: 'type' },
        { label: t('invitation.filters.admin'), value: 'ADMIN', type: 'type' },
    ];

    const filterOptions = [...statusFilterOptions, ...typeFilterOptions];

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">{t('invitation.title')}</h1>

            <div className="mb-6 flex w-full gap-4">
                <SearchBar onSearch={(query) => handleSearch(query)} className="flex-1" />
                <FilterButton
                    filters={{
                        status: filters.status,
                        type: filters.type,
                    }}
                    filterOptions={filterOptions}
                    onFilterChange={(type, value) => {
                        handleFilterChange(type, value);
                    }}
                />
                <Button variant="primary" className="w-auto" onClick={handleSendNewInvitation}>
                    <div className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>{t('invitation.new')}</span>
                    </div>
                </Button>
            </div>

            {isLoading && (
                <div className="flex h-40 w-full items-center justify-center">
                    <Loader className="h-8 w-8 animate-spin text-secondary" />
                </div>
            )}

            {error && (
                <div className="my-4 rounded-md bg-red-50 p-4 text-red-700">
                    <p>{error}</p>
                    <Button variant="secondary" onClick={fetchInvitations} className="mt-2">
                        {t('common.retry')}
                    </Button>
                </div>
            )}

            {!isLoading && !error && (
                <Table variant="default">
                    <TableHeader sticky>
                        <TableRow>
                            <TableHead>{t('invitation.sections.email')}</TableHead>
                            <TableHead>{t('invitation.sections.type')}</TableHead>
                            <TableHead>{t('invitation.sections.status')}</TableHead>
                            <TableHead>{t('invitation.sections.invitedBy')}</TableHead>
                            <TableHead
                                sortable
                                sortDirection={sortColumn === 'invitedAt' ? sortDirection : null}
                                onClick={() => handleSort('invitedAt')}
                            >
                                {t('invitation.sections.invitedOn')}
                            </TableHead>
                            <TableHead
                                sortable
                                sortDirection={sortColumn === 'registeredAt' ? sortDirection : null}
                                onClick={() => handleSort('registeredAt')}
                            >
                                {t('invitation.sections.registeredOn')}
                            </TableHead>
                            <TableHead>{t('invitation.sections.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInvitations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-8 text-center">
                                    {t('invitation.noInvitations')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInvitations.map((invitation) => (
                                <TableRow key={invitation.email}>
                                    <TableCell>{invitation.email}</TableCell>
                                    <TableCell>{invitation.type}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                invitation.status === 'ACCEPTED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : invitation.status === 'REJECTED'
                                                      ? 'bg-red-100 text-red-800'
                                                      : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {invitation.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {invitation.invitedBy?.firstName &&
                                        invitation.invitedBy?.lastName
                                            ? `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`
                                            : t('common.unknown')}
                                    </TableCell>
                                    <TableCell>{formatDate(invitation.invitedAt)}</TableCell>
                                    <TableCell>
                                        {invitation.registeredAt
                                            ? formatDate(invitation.registeredAt)
                                            : t('invitation.notRegistered')}
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleResendInvitation(invitation)}
                                            disabled={
                                                isResendingInvitation ||
                                                invitation.status === 'ACCEPTED' ||
                                                invitation.status === 'REJECTED'
                                            }
                                            title={
                                                invitation.status === 'ACCEPTED'
                                                    ? t('invitation.alreadyAccepted')
                                                    : invitation.status === 'REJECTED'
                                                      ? t('invitation.alreadyRejected')
                                                      : t('invitation.resend')
                                            }
                                        >
                                            <RefreshCw size={16} />
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={() => handleDeleteInvitation(invitation)}
                                            disabled={
                                                isLoading ||
                                                invitation.status === 'ACCEPTED' ||
                                                invitation.status === 'REJECTED'
                                            }
                                            title={
                                                invitation.status === 'ACCEPTED'
                                                    ? t('invitation.alreadyAccepted')
                                                    : invitation.status === 'REJECTED'
                                                      ? t('invitation.alreadyRejected')
                                                      : t('invitation.delete')
                                            }
                                        >
                                            <Trash size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            )}

            {isConfirmDialogOpen && (
                <DeleteConfirmation
                    isOpen={isConfirmDialogOpen}
                    onClose={() => setIsConfirmDialogOpen(false)}
                    onConfirm={handleConfirmDelete}
                    itemName={invitationToDelete?.email}
                />
            )}

            {isSendNewInvitationOpen && (
                <SendNewInvitation
                    isOpen={isSendNewInvitationOpen}
                    onClose={() => setIsSendNewInvitationOpen(false)}
                    onSubmit={async (invitations) => {
                        try {
                            await InvitationService.createInvitation(invitations[0]);
                            fetchInvitations(); // Refresh the list after creating
                        } catch (err) {
                            console.error('Error creating invitation:', err);
                        }
                    }}
                />
            )}
        </div>
    );
}
