import { useParams } from 'react-router-dom';

import { Link, UserPlus } from 'lucide-react';

import usersData from '@/mocks/usersMock.json';

import { DocumentsSection } from '../components/DocumentsSection';
import { IdentitySection } from '../components/IdentitySection';
import { LogsSection } from '../components/LogsSection';
import { FinancialInfoSection, HistorySection } from './components';

// Données de test
const financialData = {
    apport: 50000,
    epargne: 25000,
    revenuAnnuel: 75000,
    revenusLocatifs: 12000,
    empruntsActuels: 150000,
    loyersActuels: 800,
    premierInvestissement: true,
    possessionImmobiliere: true,
};

const rendezVousData = [
    { sujet: 'Premier contact', date: '01/03/2024', statut: 'Terminé' },
    { sujet: 'Visite appartement', date: '15/03/2024', statut: 'Planifié' },
];

const mailsAutomatiquesData = [
    { sujet: 'Bienvenue', date: '01/03/2024' },
    { sujet: 'Rappel rendez-vous', date: '14/03/2024' },
];

const documentsData = [
    { name: 'Contrat de mandat', type: 'Mandat', date: '01/03/2024' },
    { name: 'Justificatif de revenus', type: 'Justificatif', date: '02/03/2024' },
    { name: 'Simulation prêt', type: 'Simulation', date: '03/03/2024' },
];

const logsData = [
    {
        date: '01/03/2024',
        heure: '14:30',
        ip: '192.168.1.1',
        action: 'Connexion',
        details: 'Connexion réussie',
    },
    {
        date: '01/03/2024',
        heure: '14:35',
        ip: '192.168.1.1',
        action: 'Modification profil',
        details: 'Mise à jour des informations financières',
    },
    {
        date: '01/03/2024',
        heure: '15:00',
        ip: '192.168.1.1',
        action: 'Upload document',
        details: 'Contrat de mandat',
    },
];

export default function Client() {
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
                            <>
                                <div className="flex items-center gap-2">
                                    <UserPlus size={16} className="text-gray-500" />
                                    <span>Source du lead: Site web</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link size={16} className="text-gray-500" />
                                    <a href="#" className="text-primary hover:underline">
                                        Voir les informations prospect
                                    </a>
                                </div>
                            </>
                        }
                    />

                    <FinancialInfoSection financialData={financialData} />

                    {/* Section documents */}
                    <DocumentsSection documents={documentsData} />

                    <HistorySection appointments={rendezVousData} mails={mailsAutomatiquesData} />
                </div>

                {/* Colonne de droite */}
                <div className="flex flex-1 basis-[calc(50%-12px)] flex-col gap-6">
                    <LogsSection logs={logsData} />
                </div>
            </div>
        </div>
    );
}
