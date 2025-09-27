import { Tailwind } from '@react-email/components';

import Button from '../../components/Button';
import Card from '../../components/Card';
import Footer from '../../components/Footer';

interface PurchaseOfferSignatureNotificationProps {
    consultantName: string;
    dossierId: string;
    actionUrl?: string;
}

export default function PurchaseOfferSignatureNotification({
    consultantName,
    dossierId,
    actionUrl = 'https://cashflowpositif.fr/dashboard',
}: PurchaseOfferSignatureNotificationProps) {
    return (
        <html>
            <head>
                <title>Signature d'offre d'achat activée</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
            </head>
            <Tailwind>
                <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
                    <Card>
                        <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
                            Signature d'offre d'achat activée
                        </h1>

                        <p className="text-gray-700 text-base mb-4">Bonjour {consultantName},</p>

                        <p className="text-gray-700 text-base mb-5">
                            La signature d'une offre d'achat a été activée pour le dossier{' '}
                            <strong className="text-gray-900">{dossierId}</strong>.
                        </p>

                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-4 mb-6">
                            <h3 className="text-blue-900 text-lg font-semibold mb-2">
                                Action requise
                            </h3>
                            <p className="text-blue-800 text-base mb-3">
                                Veuillez procéder à la signature de l'offre d'achat dès que
                                possible. Cette étape est cruciale pour la progression du dossier.
                            </p>
                            <p className="text-blue-700 text-sm font-medium">
                                Dossier: {dossierId}
                            </p>
                        </div>

                        <div className="text-center my-8">
                            <Button href={actionUrl} primary={true}>
                                Accéder au dossier
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
                            Une fois la signature effectuée, le dossier passera automatiquement à
                            l'étape suivante et vous recevrez une confirmation.
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
