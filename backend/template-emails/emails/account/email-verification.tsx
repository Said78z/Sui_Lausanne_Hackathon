import { Tailwind } from '@react-email/components';

import Button from '../../components/Button';
import Card from '../../components/Card';
import Footer from '../../components/Footer';

interface EmailVerificationProps {
    name?: string;
    verificationUrl?: string;
}

export default function EmailVerificationEmail({
    name = 'Utilisateur',
    verificationUrl = 'https://cashflowpositif.fr/verify-email',
}: EmailVerificationProps) {
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
                            Vérifiez votre <span className="text-[#02153A]">adresse email</span> ✉️
                        </h1>

                        <p className="text-gray-700 text-base mb-4">Bonjour {name},</p>

                        <p className="text-gray-700 text-base mb-5">
                            Merci de vous être inscrit sur Cash Flow Radar. Pour activer votre
                            compte et accéder à toutes les fonctionnalités, veuillez vérifier votre
                            adresse email.
                        </p>

                        <p className="text-gray-700 text-base mb-6">
                            Ce lien expirera dans 24 heures. Si vous ne confirmez pas votre email
                            dans ce délai, vous devrez faire une nouvelle demande d'inscription.
                        </p>

                        <div className="text-center my-8">
                            <Button href={verificationUrl} primary={true}>
                                Vérifier mon email
                            </Button>
                        </div>

                        <p className="text-gray-700 text-base mb-4">
                            Si vous n'avez pas créé de compte sur Cash Flow Radar, vous pouvez
                            ignorer cet email.
                        </p>

                        <p className="text-gray-800 text-base mb-0">
                            Nous sommes ravis de vous compter parmi nos utilisateurs. <br />
                            <span className="font-bold">L'équipe Cash Flow Radar</span>
                        </p>
                    </Card>

                    <Footer recipientName={name} />
                </body>
            </Tailwind>
        </html>
    );
}
