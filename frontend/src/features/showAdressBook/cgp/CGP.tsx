import { useParams } from 'react-router-dom';

import { ChartPie, FileText, Linkedin, ListCheck } from 'lucide-react';

import { Button } from '@/components/ui/Button/Button';

import usersData from '@/mocks/usersMock.json';

import { DocumentsSection } from '../components/DocumentsSection';
import { IdentitySection } from '../components/IdentitySection';
import { LogsSection } from '../components/LogsSection';
import { FinancialChartSection, PlanningSection } from './components';

// Données de test
const financialData = [
    { name: 'Jan', gainsTotaux: 4000, gainsPotentiels: 6000, revenusMensuels: 2000 },
    { name: 'Fév', gainsTotaux: 5000, gainsPotentiels: 7000, revenusMensuels: 2500 },
    { name: 'Mar', gainsTotaux: 6000, gainsPotentiels: 8000, revenusMensuels: 3000 },
    { name: 'Avr', gainsTotaux: 5500, gainsPotentiels: 7500, revenusMensuels: 2750 },
    { name: 'Mai', gainsTotaux: 6500, gainsPotentiels: 8500, revenusMensuels: 3250 },
    { name: 'Juin', gainsTotaux: 7000, gainsPotentiels: 9000, revenusMensuels: 3500 },
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

const appointmentsData = [
    { date: '01/03/2024', time: '14:30', client: 'Jean Dupont', type: 'Consultation' },
    { date: '02/03/2024', time: '10:00', client: 'Marie Martin', type: 'Suivi' },
    { date: '03/03/2024', time: '16:00', client: 'Pierre Durand', type: 'Signature' },
];

export default function CGP() {
    const { id } = useParams();
    const user = usersData.users.find((u) => u.id === id);

    if (!user) {
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

    return (
        <div className="min-h-screen w-full overflow-y-auto p-6 pb-6">
            <div className="mb-6 flex justify-between">
                <h1 className="text-3xl font-bold">{fullName}</h1>
                <div className="flex items-center gap-4">
                    <Button variant="primary" className="flex items-center gap-2 px-6">
                        <ChartPie size={16} />
                        Statistiques
                    </Button>
                    <Button variant="primary" className="flex items-center gap-2 px-6">
                        <ListCheck size={16} />
                        Checklist
                    </Button>
                    <Button variant="primary" className="flex items-center gap-2 px-6">
                        <FileText size={16} />
                        Documents
                    </Button>
                </div>
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

                    <div className="grid grid-cols-2 gap-6">
                        <FinancialChartSection financialData={financialData} />

                        <div className="flex flex-col gap-6">
                            {/* Cartes de statistiques */}
                            <div className="relative rounded-xl border p-10">
                                <h3 className="text-sm text-gray-600">Gains totaux</h3>
                                <p className="text-4xl font-semibold">42 000 €</p>
                                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                            </div>
                            <div className="relative rounded-xl border p-10">
                                <h3 className="text-sm text-gray-600">Gains potentiels</h3>
                                <p className="text-4xl font-semibold">28 000 €</p>
                                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                            </div>
                            <div className="relative rounded-xl border p-10">
                                <h3 className="text-sm text-gray-600">Revenus mensuels</h3>
                                <p className="text-4xl font-semibold">11 000 €</p>
                                <div className="absolute left-0 top-1/2 h-2/3 w-1 -translate-y-1/2 bg-tertiary"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne de droite */}
                <div className="flex flex-1 basis-[calc(50%-12px)] flex-col gap-6">
                    <PlanningSection appointments={appointmentsData} />

                    <div className="flex items-center gap-6">
                        <DocumentsSection documents={documentsData} />
                        <LogsSection logs={logsData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
