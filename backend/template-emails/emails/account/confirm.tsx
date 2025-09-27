import { Tailwind } from '@react-email/components';

import Button from '../../components/Button';
import Card from '../../components/Card';
import Footer from '../../components/Footer';

interface ConfirmEmailProps {
    name?: string;
    confirmationUrl?: string;
}

export default function ConfirmEmail({
    name = 'Investisseur',
    confirmationUrl = 'https://cashflowpositif.fr/confirm',
}: ConfirmEmailProps) {
    return (
        <html>
            <head>
                <title>Bienvenue chez Cash Flow Positif</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
            </head>
            <Tailwind>
                <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
                    <Card>
                        <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
                            Bienvenue chez <span className="text-[#02153A]">Cash Flow Positif</span>{' '}
                            ! 🎉
                        </h1>

                        <p className="text-gray-700 text-base mb-4">Salut {name},</p>

                        <p className="text-gray-700 text-base mb-5">
                            Nous sommes ravis de vous avoir à bord pour vous aider à découvrir les
                            meilleures opportunités immobilières à haut rendement.
                        </p>

                        <p className="text-gray-700 text-base mb-6">
                            Avant de commencer, nous avons juste besoin d'une petite confirmation de
                            votre email.
                            <span className="font-bold"> Cliquez sur le bouton</span> ci-dessous
                            pour valider et commencer à explorer tout ce que nous avons à offrir.
                        </p>

                        <div className="text-center my-8">
                            <Button href={confirmationUrl} primary={true}>
                                Confirmer mon email
                            </Button>
                        </div>

                        <p className="text-gray-700 font-semibold text-base mb-3">
                            Une fois votre email confirmé, vous pourrez profiter de toutes nos
                            fonctionnalités :
                        </p>

                        <div className="mb-6">
                            <p className="text-gray-700 text-sm">
                                <span className="font-bold">🔍Explorez notre plugin</span> qui
                                analyse les annonces en temps réel sur les plus grands sites
                                immobiliers.
                            </p>
                            <p className="text-gray-700 text-sm">
                                <span className="font-bold">🔔 Créez des alertes</span>{' '}
                                personnalisées pour ne manquer aucun bien intéressant.
                            </p>
                            <p className="text-gray-700 text-sm">
                                <span className="font-bold">
                                    📊 Utilisez nos simulateurs financiers
                                </span>{' '}
                                pour analyser la rentabilité des biens.
                            </p>
                        </div>

                        <p className="text-gray-800 text-base mb-0">
                            A très vite, <br />
                            <span className="font-bold">L'équipe Cash Flow Positif</span>
                        </p>
                    </Card>

                    <Footer recipientName={name} />
                </body>
            </Tailwind>
        </html>
    );
}
