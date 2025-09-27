import {
    useCreateDossier,
    useDeleteDossier,
    useDossiers,
    useUpdateDossier,
} from '@/api/queries/dossierQueries';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CreateDossierDto, DossierListDto, UpdateDossierDto } from '@shared/dto';
import { DossierStatus } from '@shared/enums/dossierEnums';
import { LayoutDashboard, List, Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';
import { FilterButton } from '@/components/ui/FilterButton/FilterButton';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';

import AddFolder from './components/AddFolder';
import EditFolder from './components/EditFolder';
import FoldersCards from './components/FoldersCards';
import FoldersList from './components/FoldersList';

interface FilterOption {
    label: string;
    value: string;
    type: string;
}

export default function Folders() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: 'Tous les dossier',
    });
    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [selectedDossier, setSelectedDossier] = useState<DossierListDto | null>(null);
    const [activeView, setActiveView] = useState<'list' | 'cards'>('list');

    // API Queries and Mutations
    const {
        data: dossiersResponse,
        isLoading,
        error,
        refetch: refetchDossiers,
    } = useDossiers(
        {
            name: searchQuery || undefined,
            status: filters.status !== 'Tous les dossier' ? [filters.status as any] : undefined,
        },
        page,
        limit
    );

    const createDossierMutation = useCreateDossier();
    const updateDossierMutation = useUpdateDossier();
    const deleteDossierMutation = useDeleteDossier();

    // Map backend data to frontend format
    console.log('🔍 Full dossiersResponse:', dossiersResponse);
    console.log('🔍 dossiersResponse.data:', dossiersResponse?.data);
    console.log('🔍 Is dossiersResponse.data an array?', Array.isArray(dossiersResponse?.data));

    // Actual API Response structure: { data: DossierListDto[], pagination: Pagination }
    // The dossiers array is directly in dossiersResponse.data
    const dataArray = dossiersResponse?.data;

    console.log('🔍 Final dataArray:', dataArray);
    console.log('🔍 dataArray length:', dataArray?.length);

    const dossiers: DossierListDto[] = dataArray || [];

    // Pagination is at the top level of the response
    const pagination = dossiersResponse?.pagination;

    console.log('🔍 Final dossiers:', dossiers);
    console.log('🔍 Final pagination:', pagination);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPage(1); // Reset to first page when searching
    }, []);

    const handleFilterChange = useCallback(
        (type: string, value: string) => {
            setFilters({
                ...filters,
                [type]: value,
            });
            setPage(1); // Reset to first page when filtering
        },
        [filters]
    );

    const handleDeleteDossier = (dossierId: string) => {
        deleteDossierMutation.mutate(dossierId);
    };

    const handleAddFolder = (data: {
        name: string;
        clientId: string[];
        consultantId: string;
        partnerId: string;
        country: string;
    }) => {
        const createData: CreateDossierDto = {
            name: data.name,
            status: DossierStatus.NEW,
            mandateVersion: 1,
            ownerId: data.consultantId || undefined,
            partnerId: data.partnerId || undefined,
            customerIds: data.clientId.length > 0 ? data.clientId : undefined,
        };

        createDossierMutation.mutate(createData, {
            onSuccess: () => {
                setIsAddPopupOpen(false);
                refetchDossiers();
            },
            onError: (error: Error) => {
                console.error('Failed to create dossier:', error);
            },
        });
    };

    const handleEditFolder = (data: {
        name: string;
        clientId: string[];
        consultantId: string;
        partnerId: string;
        country: string;
    }) => {
        if (!selectedDossier) return;

        const updateData: UpdateDossierDto = {
            name: data.name,
            ownerId: data.consultantId || undefined,
            partnerId: data.partnerId || undefined,
            customerIds: data.clientId.length > 0 ? data.clientId : undefined,
        };

        updateDossierMutation.mutate(
            { id: selectedDossier.id, data: updateData },
            {
                onSuccess: () => {
                    setIsEditPopupOpen(false);
                    setSelectedDossier(null);
                },
            }
        );
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const statusOptions = [
        { label: t('folders.filters.allFolders'), value: 'Tous les dossier', type: 'status' },
        { label: t('folders.filters.status.new'), value: 'new', type: 'status' },
        { label: t('folders.filters.status.open'), value: 'open', type: 'status' },
        { label: t('folders.filters.status.cancelled'), value: 'cancelled', type: 'status' },
        { label: t('folders.filters.status.sold'), value: 'sold', type: 'status' },
        { label: t('folders.filters.status.on_hold'), value: 'on_hold', type: 'status' },
        {
            label: t('folders.filters.status.waiting_for_opportunities'),
            value: 'waiting_for_opportunities',
            type: 'status',
        },
        {
            label: t('folders.filters.status.ongoing_opportunities'),
            value: 'ongoing_opportunities',
            type: 'status',
        },
        {
            label: t('folders.filters.status.writing_sales_agreement'),
            value: 'writing_sales_agreement',
            type: 'status',
        },
        {
            label: t('folders.filters.status.sales_agreement_signed'),
            value: 'sales_agreement_signed',
            type: 'status',
        },
        { label: t('folders.filters.status.financed'), value: 'financed', type: 'status' },
    ];

    const filterOptions: FilterOption[] = statusOptions;

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-lg text-red-500">Error loading dossiers</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">{t('folders.title')}</h1>

            <div className="flex justify-between gap-4">
                <div className="mb-6 flex w-full gap-4 border-r border-r-gray-400 pr-4">
                    <SearchBar onSearch={handleSearch} className="flex-1" />
                    <FilterButton
                        filters={{
                            status: filters.status,
                        }}
                        filterOptions={filterOptions}
                        onFilterChange={handleFilterChange}
                    />
                    <Button
                        variant="primary"
                        onClick={() => setIsAddPopupOpen(true)}
                        className="w-auto"
                        disabled={createDossierMutation.isPending}
                    >
                        <div className="flex items-center gap-2">
                            <Plus size={16} />
                            <span>{t('folders.add')}</span>
                        </div>
                    </Button>
                </div>
                <div className="mb-6 flex justify-end gap-4">
                    <div className="relative">
                        <div className="flex items-center justify-center gap-4">
                            <div
                                className="absolute bottom-0 h-full rounded-md bg-tertiary transition-all duration-300 ease-in-out"
                                style={{
                                    width: '50%',
                                    left: activeView === 'list' ? '0%' : '50%',
                                }}
                            />
                            <div
                                className={`relative flex cursor-pointer items-center justify-center px-4 py-2 transition-colors duration-300 ${
                                    activeView === 'list' ? 'text-white' : 'text-gray-700'
                                }`}
                                onClick={() => setActiveView('list')}
                            >
                                <div className="flex items-center gap-2">
                                    <List size={16} />
                                    <span>{t('folders.list')}</span>
                                </div>
                            </div>
                            <div
                                className={`relative flex cursor-pointer items-center justify-center px-4 py-2 transition-colors duration-300 ${
                                    activeView === 'cards' ? 'text-white' : 'text-gray-700'
                                }`}
                                onClick={() => setActiveView('cards')}
                            >
                                <div className="flex items-center gap-2">
                                    <LayoutDashboard size={16} />
                                    <span>{t('folders.cards')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {activeView === 'list' ? (
                <FoldersList
                    dossiers={dossiers}
                    sortColumn={null}
                    sortDirection={null}
                    onSort={() => {}} // TODO: Implement server-side sorting
                    onEdit={(dossier) => {
                        setSelectedDossier(dossier as DossierListDto);
                        setIsEditPopupOpen(true);
                    }}
                    onDelete={handleDeleteDossier}
                />
            ) : (
                <FoldersCards
                    dossiers={dossiers}
                    onEdit={(dossier) => {
                        setSelectedDossier(dossier as DossierListDto);
                        setIsEditPopupOpen(true);
                    }}
                    onDelete={handleDeleteDossier}
                />
            )}

            <div className="mt-auto flex justify-center pt-4">
                {pagination && pagination.totalPages > 1 && (
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            <AddFolder
                isOpen={isAddPopupOpen}
                onClose={() => setIsAddPopupOpen(false)}
                onSubmit={handleAddFolder}
            />

            {selectedDossier && (
                <EditFolder
                    isOpen={isEditPopupOpen}
                    onClose={() => {
                        setIsEditPopupOpen(false);
                        setSelectedDossier(null);
                    }}
                    onSubmit={handleEditFolder}
                    folder={selectedDossier}
                />
            )}
        </div>
    );
}
