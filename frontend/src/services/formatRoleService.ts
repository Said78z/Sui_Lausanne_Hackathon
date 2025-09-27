import { UserRole } from '@shared/dto/userDto';

/**
 * Formate un rôle utilisateur en retirant le préfixe ROLE_ et en mettant la première lettre en majuscule
 * @param role - Le rôle à formater (ex: ROLE_ADMIN)
 * @returns Le rôle formaté (ex: Admin)
 */
export const formatRole = (role: UserRole): string => {
    // Retire le préfixe ROLE_ et met la première lettre en majuscule
    return (
        role.replace('ROLE_', '').charAt(0).toUpperCase() +
        role.replace('ROLE_', '').slice(1).toLowerCase()
    );
};

/**
 * Formate un tableau de rôles utilisateur
 * @param roles - Le tableau de rôles à formater
 * @returns Le tableau de rôles formatés
 */
export const formatRoles = (roles: UserRole[]): string[] => {
    return roles.map(formatRole);
};
