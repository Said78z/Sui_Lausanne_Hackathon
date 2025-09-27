import { Tailwind } from '@react-email/components';

import Card from '../../components/Card';
import Footer from '../../components/Footer';

interface SignedOfferEmailProps {
    recipientName?: string;
    opportunityTitle?: string;
    customerFirstName?: string;
    customerLastName?: string;
    customerPhone?: string;
}

export function SignedOfferEmail({
    recipientName = 'Agent',
    opportunityTitle = 'Bien immobilier',
    customerFirstName = 'Client',
    customerLastName = '',
    customerPhone = '',
}: SignedOfferEmailProps) {
    const greetings = ['Bien cordialement,', 'Cordialement,', 'Très cordialement,'];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    return (
        <html>
            <head>
                <title>Offre d'achat signée</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
            </head>
            <Tailwind>
                <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
                    <Card>
                        <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
                            Offre d'achat <span className="text-[#02153A]">signée</span> ✍️
                        </h1>

                        <p className="text-gray-700 text-base mb-4">Bonjour {recipientName},</p>

                        <p className="text-gray-700 text-base mb-5">
                            Voici une offre d'achat complétée et signée de la part de mon client
                            pour le bien {opportunityTitle}.
                        </p>

                        <p className="text-gray-700 text-base mb-6">
                            N'hésitez pas à m'appeler si vous avez la moindre question.
                        </p>

                        <p className="text-gray-800 text-base mb-0">
                            {randomGreeting}
                            <br />
                            <span className="font-bold">
                                {customerFirstName} {customerLastName}
                            </span>
                            {customerPhone && (
                                <>
                                    <br />
                                    {customerPhone}
                                </>
                            )}
                        </p>
                    </Card>

                    <Footer recipientName={recipientName} />
                </body>
            </Tailwind>
        </html>
    );
}
