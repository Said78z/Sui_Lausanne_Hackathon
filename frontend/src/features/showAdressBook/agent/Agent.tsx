import { useUserById } from '@/api/queries/userQueries';
import { useParams } from 'react-router-dom';

import { Linkedin } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { DocumentsSection } from '../components/DocumentsSection';
import { IdentitySection } from '../components/IdentitySection';
import { LogsSection } from '../components/LogsSection';
import { StatsCard } from '../components/StatsCard';
import { PropertyListSection, StatsSection } from './components';

// Données de test
const monthlyStatsData = [
    { name: 'Jan', biensCompromis: 4, clientsInteresses: 6, totalBiens: 8 },
    { name: 'Fév', biensCompromis: 6, clientsInteresses: 8, totalBiens: 10 },
    { name: 'Mar', biensCompromis: 8, clientsInteresses: 12, totalBiens: 14 },
    { name: 'Avr', biensCompromis: 5, clientsInteresses: 9, totalBiens: 11 },
    { name: 'Mai', biensCompromis: 7, clientsInteresses: 11, totalBiens: 13 },
    { name: 'Juin', biensCompromis: 9, clientsInteresses: 14, totalBiens: 16 },
];

const propertyNumberData = [
    { name: 'Jan', valeur: 4 },
    { name: 'Fév', valeur: 6 },
    { name: 'Mar', valeur: 8 },
    { name: 'Avr', valeur: 5 },
    { name: 'Mai', valeur: 7 },
    { name: 'Juin', valeur: 9 },
];

const documentsData = [
    { name: 'Contrat_2024.pdf', type: 'Contrat', date: '01/03/2024' },
    { name: 'Certification_CGP.pdf', type: 'Certification', date: '01/03/2024' },
    { name: 'KYC_Client_001.pdf', type: 'KYC', date: '01/03/2024' },
];

const logsData = [
    {
        date: '01/03/2024',
        heure: '14:30',
        action: 'Création du dossier',
        ip: '192.168.1.1',
        utilisateur: 'Admin',
    },
    {
        date: '01/03/2024',
        heure: '15:45',
        action: 'Modification du statut',
        ip: '192.168.1.1',
        utilisateur: 'Admin',
    },
    {
        date: '01/03/2024',
        heure: '16:20',
        action: 'Upload document',
        ip: '192.168.1.1',
        utilisateur: 'Admin',
    },
];

const propertiesData = [
    { name: 'Appartement T3', status: 'Accepté', proposalDate: '01/03/2024' },
    { name: 'Maison T4', status: 'Refusé', proposalDate: '28/02/2024' },
];

export default function Agent() {
    const { id } = useParams();
    const { data: user, isLoading, error } = useUserById(id!);

    if (isLoading) {
        return (
            <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
                <div className="text-center text-lg">Chargement...</div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
                <div className="text-center text-lg">Utilisateur non trouvé</div>
            </div>
        );
    }

    const fullName = `${user.firstName} ${user.lastName}`;
    const lastConnection =
        new Date(user.updatedAt).toLocaleDateString('fr-FR') +
        ' ' +
        new Date(user.updatedAt).toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
        });

    const totalBiensCompromis = monthlyStatsData.reduce(
        (sum, data) => sum + data.biensCompromis,
        0
    );
    const totalClientsInteresses = monthlyStatsData.reduce(
        (sum, data) => sum + data.clientsInteresses,
        0
    );
    const totalBiens = monthlyStatsData.reduce((sum, data) => sum + data.totalBiens, 0);
    return (
        <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
            <div className="mb-6 flex justify-between">
                <h1 className="text-3xl font-bold">{fullName}</h1>
            </div>

            <div className="flex flex-wrap gap-6">
                {/* Colonne de gauche */}
                <div className="flex flex-1 basis-[calc(50%-12px)] flex-col gap-6">
                    <IdentitySection
                        name={fullName}
                        phone={user.phone}
                        email={user.email}
                        lastConnection={lastConnection}
                        additionalInfo={
                            <div className="flex items-center gap-2">
                                <Linkedin size={16} className="text-gray-500" />
                                <a
                                    href="https://linkedin.com/in/jeandupont"
                                    className="text-primary hover:underline"
                                >
                                    linkedin.com/in/jeandupont
                                </a>
                            </div>
                        }
                    />

                    <div className="grid grid-cols-3 gap-6">
                        <StatsCard title="Biens en compromis" value={totalBiensCompromis} />
                        <StatsCard title="Clients intéressés" value={totalClientsInteresses} />
                        <StatsCard title="Total biens proposés" value={totalBiens} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <StatsSection monthlyStats={monthlyStatsData} />
                        <div className="relative rounded-xl border border-gray-200 bg-white p-10">
                            <div className="absolute left-0 top-12 h-10 w-1 -translate-y-1/2 bg-tertiary"></div>
                            <h2 className="mb-6 text-sm text-gray-600">Nombre de biens proposés</h2>

                            <div className="mt-12 h-52 pr-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={propertyNumberData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={10} />
                                        <YAxis fontSize={10} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar
                                            dataKey="valeur"
                                            fill="#e5e7eb"
                                            barSize={20}
                                            shape={(props: any) => {
                                                const { x, y, width, height } = props;
                                                const maxValue = Math.max(
                                                    ...propertyNumberData.map((item) => item.valeur)
                                                );
                                                const isMax = props.payload.valeur === maxValue;
                                                const isHovered =
                                                    props.index ===
                                                    props.tooltipPayload?.[0]?.payload?.index;

                                                return (
                                                    <g>
                                                        <rect
                                                            x={x}
                                                            y={y}
                                                            width={width}
                                                            height={height}
                                                            fill={
                                                                isMax
                                                                    ? '#1d223e'
                                                                    : isHovered
                                                                      ? '#1d223e'
                                                                      : '#e5e7eb'
                                                            }
                                                            rx={10}
                                                            ry={10}
                                                        />
                                                        <circle
                                                            cx={x + width / 2}
                                                            cy={y}
                                                            r={4}
                                                            fill="#fff"
                                                        />
                                                        <circle
                                                            cx={x + width / 2}
                                                            cy={y}
                                                            r={2}
                                                            fill="#1d223e"
                                                        />
                                                        {(isMax || isHovered) && (
                                                            <g>
                                                                <rect
                                                                    x={x - 10}
                                                                    y={y - 21}
                                                                    width={40}
                                                                    height={16}
                                                                    ry={4}
                                                                    fill={
                                                                        isMax || isHovered
                                                                            ? '#1d223e'
                                                                            : '#e5e7eb'
                                                                    }
                                                                />
                                                                <polygon
                                                                    points={`${x + width / 2 - 4},${y - 5} ${x + width / 2 + 4},${y - 5} ${x + width / 2},${y - 1}`}
                                                                    fill={
                                                                        isMax || isHovered
                                                                            ? '#1d223e'
                                                                            : '#e5e7eb'
                                                                    }
                                                                />
                                                                <text
                                                                    x={x + width / 2}
                                                                    y={34}
                                                                    textAnchor="middle"
                                                                    fill="white"
                                                                    fontSize="10"
                                                                    dominantBaseline="middle"
                                                                >
                                                                    {props.payload.valeur}
                                                                </text>
                                                            </g>
                                                        )}
                                                    </g>
                                                );
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne de droite */}
                <div className="flex flex-1 basis-[calc(50%-12px)] flex-col gap-6">
                    <PropertyListSection properties={propertiesData} />

                    {/* Graphique en barres pour les types de biens */}

                    <div className="flex items-center gap-6">
                        <DocumentsSection documents={documentsData} />
                        <LogsSection logs={logsData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
