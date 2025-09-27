import { Calendar, Mail, Phone } from 'lucide-react';

interface IdentitySectionProps {
    name: string;
    phone: string;
    email: string;
    lastConnection?: string;
    creationDate?: string;
    additionalInfo?: React.ReactNode;
}

export function IdentitySection({
    name,
    phone,
    email,
    lastConnection,
    creationDate,
    additionalInfo,
}: IdentitySectionProps) {
    return (
        <div className="relative rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-16 h-1/5 w-1 -translate-y-1/2 bg-tertiary"></div>
            <div className="mb-2 border-b border-gray-200 pb-4">
                <p className="text-xs text-gray-600">Informations personnelles</p>
                <h2 className="text-2xl font-medium">{name}</h2>
            </div>

            <div className="mt-6">
                <div className="flex justify-between">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-primary" />
                            <span>{phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-500" />
                            <span>{email}</span>
                        </div>
                        {lastConnection && (
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-500" />
                                <span>Dernière connexion: {lastConnection}</span>
                            </div>
                        )}
                        {creationDate && (
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-500" />
                                <span>Date de création: {creationDate}</span>
                            </div>
                        )}
                    </div>
                    {additionalInfo}
                </div>
            </div>
        </div>
    );
}
