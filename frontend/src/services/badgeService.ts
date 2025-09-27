export class BadgeService {
    private static readonly LEASE_TYPE_COLORS: Record<string, string> = {
        LMNP: 'bg-blue-100 text-blue-800',
        LMP: 'bg-green-100 text-green-800',
        Tous: 'bg-gray-100 text-gray-800',
    };

    private static readonly CITY_SIZE_COLORS: Record<string, string> = {
        'Grande ville': 'bg-purple-100 text-purple-800',
        'Moyenne ville': 'bg-orange-100 text-orange-800',
        'Petite ville': 'bg-yellow-100 text-yellow-800',
        Tous: 'bg-gray-100 text-gray-800',
    };

    private static readonly ROLE_BADGES: Record<string, { label: string; className: string }> = {
        ROLE_AGENT: { label: 'Agent', className: 'bg-blue-100 text-blue-800 px-4 py-1.5' },
        ROLE_CLIENT: { label: 'Client', className: 'bg-green-100 text-green-800 px-4 py-1.5' },
        ROLE_LEAD: { label: 'Lead', className: 'bg-yellow-100 text-yellow-800 px-4 py-1.5' },
        ROLE_CGP: { label: 'CGP', className: 'bg-purple-100 text-purple-800 px-4 py-1.5' },
        ROLE_ADMIN: { label: 'Admin', className: 'bg-gray-200 text-gray-800 px-4 py-1.5' },
        ROLE_PARTNER: { label: 'Partenaire', className: 'bg-pink-100 text-pink-800 px-4 py-1.5' },
        ROLE_CONSULTANT: {
            label: 'Consultant',
            className: 'bg-indigo-100 text-indigo-800 px-4 py-1.5',
        },
        ROLE_SDR: { label: 'SDR', className: 'bg-orange-100 text-orange-800 px-4 py-1.5' },
    };

    private static readonly VERIFICATION_BADGES = {
        true: { label: 'Vérifié', className: 'bg-green-100 text-green-800 px-4 py-1.5' },
        false: { label: 'Non vérifié', className: 'bg-gray-100 text-gray-800 px-4 py-1.5' },
    } as const;

    // Badges pour les opportunités
    private static readonly OPPORTUNITY_STATUS_BADGES: Record<
        string,
        { text: string; color: string }
    > = {
        NEW: { text: 'NOUVEAU', color: 'bg-green-500' },
        QUALIFIED: { text: 'AUTOFINANCÉ', color: 'bg-blue-500' },
        RELEVANT: { text: 'NON PARSABLE', color: 'bg-orange-500' },
    };

    public static getStatusColor(value: string): string {
        // Vérifie d'abord si c'est un type de bail
        if (this.LEASE_TYPE_COLORS[value]) {
            return this.LEASE_TYPE_COLORS[value];
        }

        // Vérifie ensuite si c'est une taille de ville
        if (this.CITY_SIZE_COLORS[value]) {
            return this.CITY_SIZE_COLORS[value];
        }

        // Retourne une couleur par défaut si aucune correspondance n'est trouvée
        return 'bg-gray-100 text-gray-800';
    }

    public static getRoleBadge(role: string): { label: string; className: string } {
        return (
            this.ROLE_BADGES[role] || {
                label: role.replace('ROLE_', ''),
                className: 'bg-gray-100 text-gray-800 px-4 py-1.5',
            }
        );
    }

    public static getVerificationBadge(isVerified: boolean): { label: string; className: string } {
        return this.VERIFICATION_BADGES[isVerified ? 'true' : 'false'];
    }

    public static getStatusBadge(status: string): { label: string; className: string } {
        if (status === 'ACTIVE') {
            return { label: 'Actif', className: 'bg-green-100 text-green-800 px-4 py-1.5' };
        } else if (status === 'PENDING') {
            return { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 px-4 py-1.5' };
        } else if (status === 'rdv') {
            return { label: 'RDV', className: 'bg-blue-100 text-blue-800 px-4 py-1.5' };
        } else if (status === 'prospect') {
            return { label: 'Prospect', className: 'bg-purple-100 text-purple-800 px-4 py-1.5' };
        }
        return { label: 'Inactif', className: 'bg-gray-100 text-gray-800 px-4 py-1.5' };
    }

    /**
     * Retourne le badge approprié pour le statut d'une opportunité
     * @param status - Le statut de l'opportunité (NEW, QUALIFIED, RELEVANT, etc.)
     * @returns Objet contenant le texte et la couleur du badge
     */
    public static getOpportunityStatusBadge(status: string): { text: string; color: string } {
        return (
            this.OPPORTUNITY_STATUS_BADGES[status] || {
                text: 'Non parsable',
                color: 'bg-orange-500',
            }
        );
    }
}
