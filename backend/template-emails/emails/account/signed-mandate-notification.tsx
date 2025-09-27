import { Tailwind } from '@react-email/components';

import Button from '../../components/Button';
import Card from '../../components/Card';
import Footer from '../../components/Footer';

interface SignedMandateNotificationProps {
    consultantName: string;
    dossierId: string;
    mandateReference?: string;
    actionUrl?: string;
}

export default function SignedMandateNotification({
    consultantName,
    dossierId,
    mandateReference,
    actionUrl = 'https://cashflowpositif.fr/dashboard',
}: SignedMandateNotificationProps) {
    return (
        <html>
            <head>
                <title>Mandat signé - Dossier {dossierId}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
            </head>
            <Tailwind>
                <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
                    <Card>
                        <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
                            Mandat signé avec succès
                        </h1>

                        <p className="text-gray-700 text-base mb-4">Bonjour {consultantName},</p>

                        <p className="text-gray-700 text-base mb-5">
                            Le mandat pour le dossier{' '}
                            <strong className="text-gray-900">{dossierId}</strong> a été signé avec
                            succès.
                        </p>

                        <div className="bg-green-50 border-l-4 border-green-400 rounded-r-lg p-4 mb-6">
                            <h3 className="text-green-900 text-lg font-semibold mb-2">
                                Mandat validé
                            </h3>
                            <p className="text-green-800 text-base mb-3">
                                Le mandat a été signé et validé. Le dossier peut maintenant passer à
                                l'étape suivante du processus de traitement.
                            </p>
                            {mandateReference && (
                                <p className="text-green-700 text-sm font-medium">
                                    Référence mandat: {mandateReference}
                                </p>
                            )}
                            <p className="text-green-700 text-sm font-medium">
                                Dossier: {dossierId}
                            </p>
                        </div>

                        <div className="text-center my-8">
                            <Button href={actionUrl} primary={true}>
                                Voir le dossier
                            </Button>
                        </div>

                        <p className="text-gray-700 text-base mb-4">
                            Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien
                            suivant dans votre navigateur :
                        </p>

                        <p className="text-xs text-gray-500 mb-6 bg-gray-100 p-2 rounded break-all">
                            {actionUrl}
                        </p>

                        <p className="text-gray-700 text-base mb-5">
                            Le dossier a été automatiquement mis à jour dans Pipedrive et les
                            informations du mandat ont été enregistrées. Vous pouvez maintenant
                            procéder aux étapes suivantes.
                        </p>

                        <p className="text-gray-800 text-base mb-0">
                            Si vous avez des questions, n'hésitez pas à nous contacter.
                        </p>

                        <p className="text-gray-800 text-base mb-0 mt-6">
                            Cordialement, <br />
                            <span className="font-bold">L'équipe Cash Flow Radar</span>
                        </p>
                    </Card>

                    <Footer recipientName={consultantName} />
                </body>
            </Tailwind>
        </html>
    );
}
