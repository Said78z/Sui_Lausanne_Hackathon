import { Button } from '@/components';
import { ProspectDto } from '@shared/dto/prospectDto';

import { Calendar, Link, Mail, Phone, User } from 'lucide-react';

interface LeadIdentityProps {
    prospect: ProspectDto;
}

export function LeadIdentity({ prospect }: LeadIdentityProps) {
    const creationDate = new Date(prospect.createdAt).toLocaleDateString('fr-FR');

    // Use prospect data directly
    const contactInfo = {
        phone: prospect.phoneNumber || 'Non renseigné',
        email: prospect.email || 'Non renseigné',
        firstName: prospect.firstName,
        lastName: prospect.lastName,
        civility: prospect.civility,
        ageEstimate: prospect.ageEstimate,
    };

    const displayName = `${contactInfo.civility ? contactInfo.civility + ' ' : ''}${contactInfo.firstName} ${contactInfo.lastName}`;

    return (
        <div className="relative mb-6 rounded-xl border border-gray-200 bg-white p-10">
            <div className="absolute left-0 top-1/4 h-1/4 w-1 -translate-y-1/2 bg-tertiary"></div>
            <div className="mb-2 border-b border-gray-200 pb-4">
                <p className="text-xs text-gray-600">Informations de contact</p>
                <h2 className="text-2xl font-medium">{displayName}</h2>
                {contactInfo.ageEstimate && (
                    <p className="text-sm text-gray-500">{contactInfo.ageEstimate} ans</p>
                )}
            </div>

            <div className="flex justify-between">
                <div className="mt-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Phone size={16} className="text-primary" />
                            <span>{contactInfo.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} className="text-gray-500" />
                            <span>{contactInfo.email}</span>
                        </div>
                        {prospect.professionalSituation && (
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-gray-500" />
                                <span>{prospect.professionalSituation}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500" />
                            <span>Date de création: {creationDate}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <Button variant="outline" className="flex items-center gap-2">
                        <Link size={16} />
                        Dossier 1
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Link size={16} />
                        Dossier 2
                    </Button>
                </div>
            </div>
        </div>
    );
}
