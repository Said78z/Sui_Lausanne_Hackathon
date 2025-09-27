import { Tailwind } from '@react-email/components';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Footer from '../../components/Footer';

interface FailedLoginAttemptProps {
  name?: string;
  attemptDate?: string;
  ipAddress?: string;
  location?: string;
  passwordResetUrl?: string;
  deviceInfo?: string;
}

export function FailedLoginAttempt({
  name = 'Investisseur',
  attemptDate = new Date().toLocaleString('fr-FR'),
  ipAddress = '0.0.0.0',
  location = 'Lieu inconnu',
  passwordResetUrl = 'https://cashflowpositif.fr/reset-password',
  deviceInfo = 'Appareil inconnu',
}: FailedLoginAttemptProps) {
  return (
    <html>
      <head>
        <title>Alerte de sécurité : Activité suspecte détectée</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </head>
      <Tailwind>
        <body className="bg-gray-50 font-sans m-0 p-0 w-full py-4">
          <Card>
            <h1 className="text-gray-900 text-2xl font-bold mt-0 mb-6 text-start">
              Alerte de sécurité : Activité suspecte 🔒
            </h1>
            
            <p className="text-gray-700 text-base mb-4">
              Bonjour {name},
            </p>
            
            <p className="text-gray-700 text-base mb-5">
              Nous avons détecté une activité suspecte sur votre compte <span className="text-[#02153A] font-semibold">Cash Flow Positif</span>. Il semble qu'il y ait eu une tentative de connexion échouée.
            </p>
            
            <p className="text-gray-700 text-base mb-4">
              Si vous êtes à l'origine de cette action, tout va bien et aucune mesure n'est nécessaire. Si ce n'est pas le cas, nous vous conseillons de <span className="font-bold text-red-600">changer immédiatement votre mot de passe</span> pour protéger votre compte.
            </p>
            
            <div className="bg-red-50 p-4 rounded-md my-6 border-l-4 border-l-red-500">
              <p className="text-gray-700 font-semibold text-base mb-3">
                Voici les détails de l'activité suspecte :
              </p>
              
              <ul className="list-none pl-0 m-0">
                <li className="text-gray-700 text-sm mb-2">
                  <span className="font-bold">Date et heure de la tentative :</span> {attemptDate}
                </li>
                <li className="text-gray-700 text-sm mb-2">
                  <span className="font-bold">Adresse IP suspecte :</span> {ipAddress}
                </li>
                <li className="text-gray-700 text-sm mb-2">
                  <span className="font-bold">Localisation approximative :</span> {location}
                </li>
                <li className="text-gray-700 text-sm mb-0">
                  <span className="font-bold">Appareil :</span> {deviceInfo}
                </li>
              </ul>
            </div>
            
            <p className="text-gray-700 text-base mb-6">
              Si vous pensez que votre compte a été compromis ou si vous avez des questions, n'hésitez pas à nous contacter immédiatement à <a href="mailto:support@cashflowpositif.fr" className="text-blue-600 underline">support@cashflowpositif.fr</a>.
            </p>
            
            <div className="text-center my-8">
              <Button href={passwordResetUrl} primary={true}>
                Modifier mon mot de passe
              </Button>
            </div>
            
            <p className="text-gray-700 text-sm mt-6 mb-6 bg-gray-100 p-3 rounded">
              <span className="font-semibold">Conseil de sécurité :</span> Pour optimiser la sécurité de votre compte, nous vous recommandons d'utiliser un mot de passe unique et complexe, comportant au moins 12 caractères, des lettres majuscules et minuscules, des chiffres et des caractères spéciaux.
            </p>
            
            <p className="text-gray-800 text-base mb-0">
              À bientôt, <br />
              <span className="font-bold">L'équipe Cash Flow Positif</span>
            </p>
          </Card>
          
          <Footer
            companyName="Cash Flow Positif"
            contactEmail="contact@cashflowpositif.fr"
            recipientName={name}
            socialLinks={[
              {
                href: 'https://instagram.com/cashflowpositif',
                icon: <span>📷</span>,
                alt: 'Instagram'
              },
              {
                href: 'https://linkedin.com/company/cashflowpositif',
                icon: <span>📱</span>,
                alt: 'LinkedIn'
              },
              {
                href: 'https://cashflowpositif.fr',
                icon: <span>🌐</span>,
                alt: 'Website'
              },
            ]}
          />
        </body>
      </Tailwind>
    </html>
  );
} 