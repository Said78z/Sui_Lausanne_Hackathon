import { User } from './userType';

export interface Token {
    id?: string;
    ownedById: string;
    token: string;
    type: string;
    scopes: string;
    deviceName: string;
    deviceIp: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
    owner: User;
}
