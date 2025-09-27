// Remove mock imports and add API imports
import { useDossierById } from '@/api/queries/dossierQueries';
import { Button } from '@/components';

import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { BasicUserDto, ExtendedDossierDto } from '@shared/dto';
import {
    Building2,
    Calendar,
    ChartPie,
    Euro,
    FileText,
    ListCheck,
    Mail,
    MapPin,
    Percent,
    Phone,
    Search,
} from 'lucide-react';

export default function Folder() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Use the API to fetch the dossier by UUID
    const { data: dossier, isLoading, error } = useDossierById(id || '');

    // Debug logging
    console.log('🔍 Folder - dossier data:', dossier);
    console.log('📊 Budget values:', {
        minBudget: dossier?.minBudget,
        maxBudget: dossier?.maxBudget,
        minBuyerRentalYield: dossier?.minBuyerRentalYield,
        minOccupancy: dossier?.minOccupancy,
    });

    if (isLoading) {
        return <div className="p-8 text-center text-lg">Loading...</div>;
    }

    if (error || !dossier) {
        return <div className="p-8 text-center text-lg">{t('folder.notFound')}</div>;
    }

    // The API dossier may include extended relations depending on backend response
    const extended = dossier as Partial<ExtendedDossierDto>;

    // Clients from extended dossier (basic user info)
    const clients: BasicUserDto[] = extended.customers ?? [];
    const clientNames = clients.map((c: BasicUserDto) => `${c.firstName} ${c.lastName}`).join(', ');

    // Owner/consultant from extended dossier (basic user info)
    const consultant: BasicUserDto | undefined = extended.owner;
    const consultantPhone: string | undefined = (consultant as unknown as { phone?: string })
        ?.phone;

    // Location helpers from extended dossier
    const addressLabel = extended.referenceCity?.name || 'No address specified';
    const perimeterLabel = extended.regions?.map((r) => r.name).join(', ') || 'N/A';
    const cityDemographyLabel = extended.department?.name || 'N/A';

    // Dates
    const lastStatusUpdate = dossier.statusUpdatedAt
        ? new Date(dossier.statusUpdatedAt).toLocaleDateString('fr-FR')
        : '-';

    // Investment criteria helpers
    const renovationText = (() => {
        const min = dossier.minRework;
        const max = dossier.maxRework;
        if (min != null && max != null) return `${min} - ${max} K€`;
        if (min != null) return `${min} K€`;
        if (max != null) return `${max} K€`;
        return 'N/A';
    })();

    const occupancyText = (() => {
        const min = dossier.minOccupancy;
        const max = dossier.maxOccupancy;
        if (min != null && max != null) return `${min} - ${max} %`;
        if (min != null) return `${min} %`;
        if (max != null) return `${max} %`;
        return 'N/A';
    })();

    return (
        <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
            <div className="mb-6 flex justify-between">
                <h1 className="text-3xl font-bold">{dossier.name}</h1>
                <div className="flex items-center gap-4">
                    <Button variant="primary" className="flex items-center gap-2 px-6">
                        <ChartPie size={16} />
                        {t('folder.buttons.status')}
                    </Button>
                    <Button variant="primary" className="flex items-center gap-2 px-6">
                        <ListCheck size={16} />
                        {t('folder.buttons.checklist')}
                    </Button>
                    <Button variant="primary" className="flex items-center gap-2 px-6">
                        <FileText size={16} />
                        {t('folder.buttons.documents')}
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap gap-6">
                {/* Colonne de gauche */}
                <div className="flex flex-1 basis-[calc(50%-12px)] flex-col gap-6">
                    {/* Section identité */}
                    <div className="rounded-[1rem] border border-gray-200 bg-white p-10">
                        <div className="mb-2 border-b border-gray-200 pb-4">
                            <p className="text-xs text-gray-600">
                                {t('folder.sections.identity.title')}
                            </p>
                            <h2 className="text-2xl font-medium">{clientNames}</h2>
                        </div>

                        {consultant && (
                            <div className="mt-6">
                                <p className="mb-2 text-xs text-gray-600">
                                    {t('folder.sections.identity.consultant')}
                                </p>
                                <h3 className="mb-4 font-medium">{`${consultant.firstName} ${consultant.lastName}`}</h3>

                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-primary" />
                                        <a
                                            href="#"
                                            className="hover:text-primary-dark font-medium text-primary underline"
                                        >
                                            {t('folder.buttons.scheduleMeeting')}
                                        </a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-gray-500" />
                                        <span>{consultant.email}</span>
                                    </div>
                                    {consultantPhone && (
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} className="text-gray-500" />
                                            <span>{consultantPhone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section localisation */}
                    <div className="rounded-[1rem] border border-gray-200 bg-white p-10">
                        <h2 className="mb-6 text-sm text-gray-600">
                            {t('folder.sections.location.title')}
                        </h2>

                        <div className="mb-4 flex items-start gap-3 border-b border-gray-200 pb-4">
                            <MapPin size={20} className="mt-1 text-primary" />
                            <div>
                                <p className="font-medium">{addressLabel}</p>
                                <p className="text-sm text-gray-500">
                                    {t('folder.sections.location.perimeter')}: {perimeterLabel}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Building2 size={20} className="mt-1 text-primary" />
                            <div>
                                <p className="font-medium">{cityDemographyLabel}</p>
                                <p className="text-sm text-gray-500">
                                    {t('folder.sections.location.cityType')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section statut */}
                    <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
                        <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                        <h2 className="mb-6 text-xs text-gray-600">
                            {t('folder.sections.status.title')}
                        </h2>

                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.status.folderStatus')}
                                </p>
                                <p className="text-lg font-medium">{dossier.status}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.status.lastUpdate')}
                                </p>
                                <p className="font-medium">{lastStatusUpdate}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne de droite */}
                <div className="flex flex-1 basis-[calc(50%-12px)] flex-col gap-6">
                    {/* Section finances */}
                    <div className="rounded-[1rem] border border-gray-200 bg-white p-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.mandates.searchMandate')}
                                </p>
                                <Button variant="primary" className="mt-2 flex items-center gap-2">
                                    <FileText size={16} className="text-white" />
                                    {t('folder.buttons.sendSearchMandate')}
                                </Button>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.mandates.managementMandate')}
                                </p>
                                <Button variant="primary" className="mt-2 flex items-center gap-2">
                                    <FileText size={16} className="text-white" />
                                    {t('folder.buttons.sendManagementMandate')}
                                </Button>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.mandates.searchCriteria')}
                                </p>
                                <Button
                                    variant="primary"
                                    className="mt-2 flex items-center gap-2"
                                    onClick={() => navigate(`/folder/${id}/search-definition`)}
                                >
                                    <Search size={16} className="text-white" />
                                    {t('folder.buttons.viewSearchCriteria')}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Section finances */}
                    <div className="relative rounded-[1rem] border border-gray-200 bg-white p-10">
                        <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                        <h2 className="mb-6 text-xs text-gray-600">
                            {t('folder.sections.finances.title')}
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.finances.budget')}
                                </p>
                                <p className="text-xl font-semibold">
                                    {dossier.minBudget?.toLocaleString() || 'N/A'} €
                                </p>
                                <p className="text-xs text-gray-500">
                                    {t('folder.sections.finances.max')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.finances.downPayment')}
                                </p>
                                <p className="text-xl font-semibold">
                                    {dossier.downpayment?.toLocaleString() || 'N/A'} €
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.finances.repaymentCapacity')}
                                </p>
                                <p className="text-xl font-semibold">
                                    {dossier.annualMortgageReimbursement?.toLocaleString() || 'N/A'}{' '}
                                    €
                                </p>
                                <p className="text-xs text-gray-500">
                                    {t('folder.sections.finances.perYear')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">
                                    {t('folder.sections.finances.investmentCapacity')}
                                </p>
                                <p className="text-xl font-semibold">
                                    {dossier.availableSavings?.toLocaleString() || 'N/A'} €
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section critères */}
                    <div className="rounded-[1rem] border border-gray-200 bg-white p-10">
                        <h2 className="mb-6 text-sm text-gray-600">
                            {t('folder.sections.investmentCriteria.title')}
                        </h2>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-primary" />
                                    <span className="text-gray-600">
                                        {t('folder.sections.investmentCriteria.budget')}
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {dossier.maxBudget?.toLocaleString() || 'N/A'} €
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Percent size={16} className="text-primary" />
                                    <span className="text-gray-600">
                                        {t('folder.sections.investmentCriteria.minimumYield')}
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {dossier.minBuyerRentalYield ?? 'N/A'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-primary" />
                                    <span className="text-gray-600">
                                        {t('folder.sections.investmentCriteria.propertyType')}
                                    </span>
                                </div>
                                <span className="font-medium">{'N/A'}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Euro size={16} className="text-primary" />
                                    <span className="text-gray-600">
                                        {t('folder.sections.investmentCriteria.renovation')}
                                    </span>
                                </div>
                                <span className="font-medium">{renovationText}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Building2 size={16} className="text-primary" />
                                    <span className="text-gray-600">
                                        {t('folder.sections.investmentCriteria.searchType')}
                                    </span>
                                </div>
                                <span className="font-medium">{'N/A'}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Percent size={16} className="text-primary" />
                                    <span className="text-gray-600">
                                        {t('folder.sections.investmentCriteria.occupancyRate')}
                                    </span>
                                </div>
                                <span className="font-medium">{occupancyText}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section objectifs/remarques */}
                    {dossier.goal && (
                        <div className="rounded-[1rem] border border-gray-200 bg-white p-10">
                            <h2 className="mb-6 text-sm text-gray-600">
                                {t('folder.sections.goals.title')}
                            </h2>
                            <div className="text-gray-800">
                                <p className="whitespace-pre-wrap">{dossier.goal}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
