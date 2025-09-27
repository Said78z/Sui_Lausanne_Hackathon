export interface InvitationType {
    id: string;
    email: string;
    type: string;
    status: string;
    invitedBy: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    invitedAt: string;
    registeredAt: string | null;
    expiresAt: string;
    token?: string; // Le token associé à l'invitation, peut être null ou undefined
    tokenId?: string; // L'ID du token associé à l'invitation, peut être null ou undefined
}
