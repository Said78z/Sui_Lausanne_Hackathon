import { useTranslation } from 'react-i18next';

import { ChevronLeft } from 'lucide-react';

interface NotesPanelProps {
    showAllNotes: boolean;
    notesTopPosition: number;
    onToggleNotes: () => void;
}

export function NotesPanel({ showAllNotes, notesTopPosition, onToggleNotes }: NotesPanelProps) {
    const { t } = useTranslation();

    return (
        <div
            className={`fixed right-0 w-[25%] border-l transition-all duration-300 ${showAllNotes ? 'right-0' : 'right-[-25%]'}`}
            style={{
                top: `${notesTopPosition}px`,
                height: `calc(100vh - ${notesTopPosition}px - 34px)`,
            }}
        >
            <div className="space-y-6 p-6">
                <div
                    className="group flex cursor-pointer items-center gap-2"
                    onClick={onToggleNotes}
                >
                    <ChevronLeft className="h-5 w-5 transition-all duration-300 group-hover:-translate-x-1" />
                    <h3 className="text-lg font-semibold">{t('powerdialer.notes.title')}</h3>
                </div>

                <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">John Doe</span>
                            <span className="text-xs text-gray-500">01/01/2024 - 14:30</span>
                        </div>
                        <p className="text-sm text-gray-600">Note de test</p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">Marie Dupont</span>
                            <span className="text-xs text-gray-500">12/03/2024 - 09:15</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Propriétaire intéressé par une rénovation complète. Souhaite un devis
                            pour isolation thermique et remplacement des fenêtres.
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">Pierre Martin</span>
                            <span className="text-xs text-gray-500">10/03/2024 - 16:45</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Problème d'humidité signalé dans la salle de bain. Nécessite une
                            inspection rapide.
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">Sophie Bernard</span>
                            <span className="text-xs text-gray-500">08/03/2024 - 11:20</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Locataire demande une intervention pour le chauffage qui ne fonctionne
                            pas correctement.
                        </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">Thomas Leroy</span>
                            <span className="text-xs text-gray-500">05/03/2024 - 15:30</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Rénovation de la cuisine prévue pour le mois prochain. Attente des devis
                            des artisans.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
