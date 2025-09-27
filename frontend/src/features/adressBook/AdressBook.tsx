import { Button, FilterButton } from '@/components';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ContactType, InviteRequest } from '@shared/dto';
import { ProspectDto } from '@shared/dto/prospectDto';
import { motion } from 'framer-motion';
import { Building2, Eye, Flag, Landmark, Plus, User2 } from 'lucide-react';

import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table/Table';

// Import API hooks instead of mock data
import { useProspects } from '@/api/queries/prospectQueries';
import { useUsers } from '@/api/queries/userQueries';
import { ProspectCallInfo } from './components/ProspectCallInfo';

import InviteModal from './components/InviteModal';

export default function AdressBook() {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState(ContactType.Agent);
    const [search, setSearch] = useState('');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [bgStyle, setBgStyle] = useState({ left: 0, width: 0 });
    const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const navigate = useNavigate();

    const ROLE_LABELS = useMemo(() => [
        {
            label: t('addressBook.roles.agents'),
            value: ContactType.Agent,
            icon: <Building2 size={16} />,
        },
        { 
            label: t('addressBook.roles.clients'), 
            value: ContactType.Client, 
            icon: <User2 size={16} /> 
        },
        { 
            label: t('addressBook.roles.leads'), 
            value: ContactType.Prospect, 
            icon: <Flag size={16} /> 
        },
        { 
            label: t('addressBook.roles.cgp'), 
            value: ContactType.CGP, 
            icon: <Landmark size={16} /> 
        },
    ], [t]);

    // Get data based on selected role type with search
    const userParams = selectedRole !== ContactType.Prospect ? {
        type: selectedRole,
        search: search,
    } : undefined;

    const prospectParams = selectedRole === ContactType.Prospect ? {
        search: search,
    } : undefined;

    const { data: users = [], isLoading: usersLoading } = useUsers(userParams);
    const { data: prospects = [], isLoading: prospectsLoading } = useProspects(prospectParams);

    // Combine the data and loading states
    const isLoading = selectedRole === ContactType.Prospect ? prospectsLoading : usersLoading;
    const displayData = selectedRole === ContactType.Prospect ? prospects : users;

    // Effect to update background style for selected tab
    useLayoutEffect(() => {
        const updateBgStyle = () => {
            const currentIndex = ROLE_LABELS.findIndex(role => role.value === selectedRole);
            const currentBtn = btnRefs.current[currentIndex];
            
            if (currentBtn) {
                const { offsetLeft, offsetWidth } = currentBtn;
                setBgStyle({
                    left: offsetLeft,
                    width: offsetWidth,
                });
            }
        };

        updateBgStyle();
        window.addEventListener('resize', updateBgStyle);

        return () => window.removeEventListener('resize', updateBgStyle);
    }, [selectedRole, ROLE_LABELS]);

    const handleInvite = async (request: InviteRequest) => {
        try {
            // TODO: Implémenter l'appel API pour envoyer les invitations
            console.log('Envoi des invitations:', request);
            // await inviteUsers(request);
        } catch (error) {
            console.error("Erreur lors de l'envoi des invitations:", error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">{t('addressBook.title')}</h1>
            <div className="mb-6 flex items-center gap-4">
                <div className="flex-1 border-r border-r-gray-400 pr-4">
                    <SearchBar
                        onSearch={setSearch}
                        className="w-full"
                        placeholder={t('addressBook.search.placeholder')}
                    />
                </div>
                <div className="flex items-center gap-4 border-r border-r-gray-400 pr-4">
                    <FilterButton
                        filters={{
                            role: selectedRole,
                        }}
                        filterOptions={ROLE_LABELS.map((role) => ({
                            label: role.label,
                            value: role.value,
                            type: 'role',
                        }))}
                        onFilterChange={(type: string, value: string) => {
                            if (type === 'role') {
                                setSelectedRole(value as ContactType);
                            }
                        }}
                    />
                    <Button
                        variant="primary"
                        className="flex items-center gap-2 px-6"
                        onClick={() => setIsInviteModalOpen(true)}
                    >
                        <Plus size={16} />
                        {t('addressBook.invite')}
                    </Button>
                </div>
                <div className="relative flex items-center gap-0" style={{ minHeight: 40 }}>
                    <motion.div
                        className="absolute bottom-0 top-0 z-0 rounded-md bg-tertiary"
                        animate={bgStyle}
                        style={{ left: bgStyle.left, width: bgStyle.width, height: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                    {ROLE_LABELS.map((role, idx) => (
                        <button
                            key={role.value}
                            ref={(el) => (btnRefs.current[idx] = el)}
                            className={`relative z-10 flex cursor-pointer items-center justify-center gap-2 rounded-md px-6 py-2 font-semibold transition-colors duration-300 ${
                                selectedRole === role.value ? 'text-white' : 'text-gray-700'
                            }`}
                            onClick={() => setSelectedRole(role.value)}
                        >
                            {role.icon}
                            <p className="text-sm">{role.label}</p>
                        </button>
                    ))}
                </div>
            </div>
            <Table variant="default">
                {selectedRole === ContactType.Agent && (
                    <TableHeader sticky>
                        <TableRow>
                            <TableHead className="w-[20%]">
                                {t('addressBook.table.agent.name')}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t('addressBook.table.agent.proposedProperties')}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t('addressBook.table.agent.acceptedProperties')}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t('addressBook.table.agent.registrationDate')}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t('addressBook.table.agent.region')}
                            </TableHead>
                            <TableHead className="w-[5%]">
                                {t('addressBook.table.actions')}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                )}
                {selectedRole === ContactType.Client && (
                    <TableHeader sticky>
                        <TableRow>
                            <TableHead className="w-[10%]">
                                {t('addressBook.table.client.name')}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t('addressBook.table.client.consultant')}
                            </TableHead>
                            <TableHead className="w-[20%]">
                                {t('addressBook.table.client.investmentCapacity')}
                            </TableHead>
                            <TableHead className="w-[5%]">
                                {t('addressBook.table.client.status')}
                            </TableHead>
                            <TableHead className="w-[17%]">
                                {t('addressBook.table.client.registrationDate')}
                            </TableHead>
                            <TableHead className="w-[17%]">
                                {t('addressBook.table.client.lastProposedProperty')}
                            </TableHead>
                            <TableHead className="w-[5%]">
                                {t('addressBook.table.actions')}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                )}
                {selectedRole === ContactType.Prospect && (
                    <TableHeader sticky>
                        <TableRow>
                            <TableHead className="w-[10%]">
                                {t('addressBook.table.lead.name')}
                            </TableHead>
                            <TableHead className="w-[10%]">
                                {t('addressBook.table.lead.type')}
                            </TableHead>
                            <TableHead className="w-[10%]">
                                {t('addressBook.table.lead.source')}
                            </TableHead>
                            <TableHead className="w-[13%]">
                                {t('addressBook.table.lead.lastCall')}
                            </TableHead>
                            <TableHead className="w-[10%]">
                                {t('addressBook.table.lead.calledBy')}
                            </TableHead>
                            <TableHead className="w-[20%]">
                                {t('addressBook.table.lead.doNotCallBefore')}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t('addressBook.table.lead.registrationDate')}
                            </TableHead>
                            <TableHead className="w-[5%]">
                                {t('addressBook.table.actions')}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                )}
                {selectedRole === ContactType.CGP && (
                    <TableHeader sticky>
                        <TableRow>
                            <TableHead className="w-[10%]">
                                {t('addressBook.table.cgp.name')}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t('addressBook.table.cgp.broughtClients')}
                            </TableHead>
                            <TableHead className="w-[15%]">
                                {t('addressBook.table.cgp.investedClients')}
                            </TableHead>
                            <TableHead className="w-[17%]">
                                {t('addressBook.table.cgp.lastClientBrought')}
                            </TableHead>
                            <TableHead className="w-[13%]">
                                {t('addressBook.table.cgp.totalEarnings')}
                            </TableHead>
                            <TableHead className="w-[13%]">
                                {t('addressBook.table.cgp.registrationDate')}
                            </TableHead>
                            <TableHead className="w-[5%]">
                                {t('addressBook.table.actions')}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                )}
                <TableBody>
                    {(!displayData || displayData.length === 0) && (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                <span className="text-gray-400">
                                    {isLoading ? 'Chargement...' : t('addressBook.table.noUsers')}
                                </span>
                            </TableCell>
                        </TableRow>
                    )}
                    {displayData?.map((item) => (
                        <TableRow key={item.id} hover>
                            <TableCell>
                                {item.firstName} {item.lastName}
                            </TableCell>
                            {selectedRole === ContactType.Agent && (
                                <>
                                    <TableCell>0</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate(`/agent/${item.id}`)}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                    </TableCell>
                                </>
                            )}
                            {selectedRole === ContactType.Client && (
                                <>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>
                                        <span
                                            className="rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800"
                                        >
                                            N/A
                                        </span>
                                    </TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate(`/client/${item.id}`)}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                    </TableCell>
                                </>
                            )}
                            {selectedRole === ContactType.Prospect && (
                                <>
                                    <TableCell>
                                        <span
                                            className="rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            Prospect
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {(item as ProspectDto).source || 'N/A'}
                                    </TableCell>
                                    <ProspectCallInfo prospectId={item.id} />
                                    <TableCell>
                                        {(item as ProspectDto).doNotCallBefore 
                                            ? new Date((item as ProspectDto).doNotCallBefore!).toLocaleDateString('fr-FR')
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {(item as ProspectDto).createdAt 
                                            ? new Date((item as ProspectDto).createdAt).toLocaleDateString('fr-FR')
                                            : 'N/A'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate(`/lead/${item.id}`)}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                    </TableCell>
                                </>
                            )}
                            {selectedRole === ContactType.CGP && (
                                <>
                                    <TableCell>0</TableCell>
                                    <TableCell>0</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>N/A</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="primary"
                                            onClick={() => navigate(`/cgp/${item.id}`)}
                                        >
                                            <Eye size={16} />
                                        </Button>
                                    </TableCell>
                                </>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onSubmit={handleInvite}
                defaultRole={selectedRole}
            />
        </div>
    );
}
