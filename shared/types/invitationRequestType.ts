import { InvitationRequest, Token, User } from "../../backend/src/config/client";

export type InvitationRequestWithRelations = InvitationRequest & {
    invitedBy: User;
    user: User | null;
    token: Token | null;
};