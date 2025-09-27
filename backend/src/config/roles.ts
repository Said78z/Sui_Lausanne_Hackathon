import { ChatDynamicRule, UserRole } from '@shared/dto';

// Mapping de la hiérarchie : chaque rôle hérite directement des rôles listés
export const roleHierarchy: { [key: string]: UserRole[] } = {
    [UserRole.User]: [],
    [UserRole.Moderator]: [UserRole.User],
    [UserRole.Admin]: [UserRole.User, UserRole.Moderator],
};

// Fonction récursive pour vérifier l'héritage transitif des rôles
export function hasInheritedRole(currentRole: UserRole, requiredRole: UserRole): boolean {
    if (currentRole === requiredRole) return true;
    if (!roleHierarchy[currentRole]) return false; // Ajout d'une vérification de sécurité
    for (const inheritedRole of roleHierarchy[currentRole]) {
        if (hasInheritedRole(inheritedRole, requiredRole)) {
            return true;
        }
    }
    return false;
}

// Configuration des permissions de chat
export type ChatPermissionEntry = {
    static?: UserRole[]
    dynamic?: ChatDynamicRule[]
}

export const chatPermissions: Record<UserRole, ChatPermissionEntry> = {
    [UserRole.Consultant]: {
        static: [UserRole.Employee],
        dynamic: [ChatDynamicRule.OWN_CUSTOMERS],
    },
    [UserRole.Customer]: {
        dynamic: [ChatDynamicRule.OWN_CONSULTANT],
    },
    [UserRole.SourcingManager]: {
        static: [UserRole.Agent],
    },
    [UserRole.Agent]: {
        dynamic: [ChatDynamicRule.OWN_SOURCING_MANAGER],
    },
    [UserRole.SDR]: {
        dynamic: [ChatDynamicRule.CALLED_LEADS],
    },
    [UserRole.Admin]: {
        static: ['*'] as any,
    },
    [UserRole.CGPManager]: {
        static: [UserRole.CGP],
        dynamic: [ChatDynamicRule.CGP_CUSTOMERS],
    },
    [UserRole.CGP]: {
        static: [UserRole.CGPManager],
        dynamic: [ChatDynamicRule.OWN_CUSTOMERS],
    },
    [UserRole.Employee]: {
        static: [UserRole.Employee],
    },
    [UserRole.ConsultantManager]: {
        dynamic: [ChatDynamicRule.TEAM_CUSTOMERS, ChatDynamicRule.MANAGED_CONSULTANTS],
    },
    // Rôles par défaut sans permissions de chat spécifiques
    [UserRole.User]: {},
    [UserRole.Moderator]: {},
    [UserRole.Lead]: {},
    [UserRole.Client]: {},
}
