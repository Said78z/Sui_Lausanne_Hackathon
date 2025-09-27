// Import des données mockées pour les conversations
import usersData from '@/mocks/usersMock.json';

// Cache simple pour éviter les appels répétés
const entityCache = new Map<string, string>();

export const breadcrumbService = {
    // Récupérer le nom d'un dossier
    async getFolderName(id: string): Promise<string> {
        const cacheKey = `folder-${id}`;
        if (entityCache.has(cacheKey)) {
            return entityCache.get(cacheKey)!;
        }

        // TODO: Remplacer par un vrai appel API
        // const response = await api.get(`/folders/${id}`);
        // const name = response.data.name;

        // Pour l'instant, on retourne un nom générique
        const name = `Dossier ${id}`;
        entityCache.set(cacheKey, name);
        return name;
    },

    // Récupérer le nom d'un client
    async getClientName(id: string): Promise<string> {
        const cacheKey = `client-${id}`;
        if (entityCache.has(cacheKey)) {
            return entityCache.get(cacheKey)!;
        }

        // TODO: Remplacer par un vrai appel API
        const name = `Client ${id}`;
        entityCache.set(cacheKey, name);
        return name;
    },

    // Récupérer le nom d'un agent
    async getAgentName(id: string): Promise<string> {
        const cacheKey = `agent-${id}`;
        if (entityCache.has(cacheKey)) {
            return entityCache.get(cacheKey)!;
        }

        // TODO: Remplacer par un vrai appel API
        const name = `Agent ${id}`;
        entityCache.set(cacheKey, name);
        return name;
    },

    // Récupérer le nom d'un lead (prospect)
    async getLeadName(id: string): Promise<string> {
        const cacheKey = `lead-${id}`;
        if (entityCache.has(cacheKey)) {
            return entityCache.get(cacheKey)!;
        }

        try {
            // Appel API pour récupérer le prospect
            const response = await fetch(`/api/prospects/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const prospect = await response.json();
                const name = `${prospect.firstName} ${prospect.lastName}`;
                entityCache.set(cacheKey, name);
                return name;
            }
        } catch (error) {
            console.error('Error fetching prospect name:', error);
        }

        // Fallback si l'API échoue
        const name = `Prospect ${id}`;
        entityCache.set(cacheKey, name);
        return name;
    },

    // Récupérer le nom d'un CGP
    async getCgpName(id: string): Promise<string> {
        const cacheKey = `cgp-${id}`;
        if (entityCache.has(cacheKey)) {
            return entityCache.get(cacheKey)!;
        }

        // TODO: Remplacer par un vrai appel API
        const name = `CGP ${id}`;
        entityCache.set(cacheKey, name);
        return name;
    },

    // Récupérer le nom d'une opportunité
    async getOpportunityName(id: string): Promise<string> {
        const cacheKey = `opportunity-${id}`;
        if (entityCache.has(cacheKey)) {
            return entityCache.get(cacheKey)!;
        }

        // TODO: Remplacer par un vrai appel API
        const name = `Opportunité ${id}`;
        entityCache.set(cacheKey, name);
        return name;
    },

    // Récupérer le nom d'une ville
    async getCityName(id: string): Promise<string> {
        const cacheKey = `city-${id}`;
        if (entityCache.has(cacheKey)) {
            return entityCache.get(cacheKey)!;
        }

        // TODO: Remplacer par un vrai appel API
        const name = `Ville ${id}`;
        entityCache.set(cacheKey, name);
        return name;
    },

    async getConversationName(id: string): Promise<string> {
        const cacheKey = `conversation-${id}`;
        if (entityCache.has(cacheKey)) {
            return entityCache.get(cacheKey)!;
        }

        let name = `Conversation ${id}`;

        try {
            // Vérifier si c'est un groupe (préfixe "group-")
            if (id.startsWith('group-')) {
                // Groupes mockés
                const mockGroups = [
                    { id: 'group-1', name: 'Équipe commerciale' },
                    { id: 'group-2', name: 'Projet Immo92' },
                ];

                const group = mockGroups.find((g) => g.id === id);
                if (group) {
                    name = group.name;
                } else {
                    name = 'Groupe de discussion';
                }
            } else {
                // Conversation privée - chercher l'utilisateur par ID
                const user = usersData.users.find((u) => u.id === id);
                if (user) {
                    name = `${user.firstName} ${user.lastName}`;
                } else {
                    name = 'Conversation privée';
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du nom de conversation:', error);
            // Fallback vers le nom générique
        }

        entityCache.set(cacheKey, name);
        return name;
    },

    // Nettoyer le cache
    clearCache(): void {
        entityCache.clear();
    },
};
