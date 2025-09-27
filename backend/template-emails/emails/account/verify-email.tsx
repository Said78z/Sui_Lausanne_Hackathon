import { Tailwind } from '@react-email/components';

import Button from '../../components/Button';
import Card from '../../components/Card';
import Footer from '../../components/Footer';

interface VerifyEmailProps {
    name?: string;
    verificationUrl?: string;
}

export default function VerifyEmailEmail({
    name = 'Utilisateur',
    verificationUrl = 'https://cashflowpositif.fr/verify-email',
}: VerifyEmailProps) {
    return (
        <html>
            <head>
                <title>Vérifiez votre adresse email</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
            </head>
            <Tailwind>
                <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
                    <Card>
                        <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
                            Confirmation de votre adresse email
                        </h1>

                        <p className="text-gray-700 text-base mb-4">Bonjour {name},</p>

                        <p className="text-gray-700 text-base mb-5">
                            Merci d'avoir créé votre compte sur Cash Flow Radar. Pour finaliser
                            votre inscription et commencer à utiliser nos services, veuillez
                            confirmer votre adresse email.
                        </p>

                        <div className="text-center my-8">
                            <Button href={verificationUrl} primary={true}>
                                Vérifier mon adresse email
                            </Button>
                        </div>

                        <p className="text-gray-700 text-base mb-4">
                            Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien
                            suivant dans votre navigateur :
                        </p>

                        <p className="text-xs text-gray-500 mb-6 bg-gray-100 p-2 rounded break-all">
                            {verificationUrl}
                        </p>

                        <p className="text-gray-700 text-base mb-5">
                            Ce lien est valable pendant 24 heures. Passé ce délai, vous pourrez
                            demander un nouveau lien de vérification depuis la page de connexion.
                        </p>

                        <p className="text-gray-700 text-base mb-4">
                            Une fois votre email vérifié, vous aurez accès à toutes les
                            fonctionnalités de Cash Flow Radar pour gérer efficacement votre
                            trésorerie et vos finances personnelles.
                        </p>

                        <p className="text-gray-800 text-base mb-0">
                            Cordialement, <br />
                            <span className="font-bold">L'équipe Cash Flow Radar</span>
                        </p>
                    </Card>

                    <Footer recipientName={name} />
                </body>
            </Tailwind>
        </html>
    );
}
