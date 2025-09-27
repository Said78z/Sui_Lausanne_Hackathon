import { ProspectingQueue } from '@/config/client';

export const mockProspectingQueue: ProspectingQueue = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    prospectId: '456e7890-e89b-12d3-a456-426614174000',
    lockedBySdrId: '789e0123-e89b-12d3-a456-426614174000',
    lockExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
    createdAt: new Date('2024-01-01T10:00:00.000Z'),
    updatedAt: new Date('2024-01-01T10:00:00.000Z'),
};

export const mockProspectingQueueList: ProspectingQueue[] = [
    {
        id: '123e4567-e89b-12d3-a456-426614174000',
        prospectId: '456e7890-e89b-12d3-a456-426614174000',
        lockedBySdrId: '789e0123-e89b-12d3-a456-426614174000',
        lockExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
        createdAt: new Date('2024-01-01T10:00:00.000Z'),
        updatedAt: new Date('2024-01-01T10:00:00.000Z'),
    },
    {
        id: '234e5678-e89b-12d3-a456-426614174000',
        prospectId: '567e8901-e89b-12d3-a456-426614174000',
        lockedBySdrId: '890e1234-e89b-12d3-a456-426614174000',
        lockExpiration: new Date(Date.now() + 12 * 60 * 60 * 1000), // +12h
        createdAt: new Date('2024-01-01T11:00:00.000Z'),
        updatedAt: new Date('2024-01-01T11:00:00.000Z'),
    },
    {
        id: '345e6789-e89b-12d3-a456-426614174000',
        prospectId: '678e9012-e89b-12d3-a456-426614174000',
        lockedBySdrId: '901e2345-e89b-12d3-a456-426614174000',
        lockExpiration: new Date(Date.now() + 6 * 60 * 60 * 1000), // +6h
        createdAt: new Date('2024-01-01T12:00:00.000Z'),
        updatedAt: new Date('2024-01-01T12:00:00.000Z'),
    },
];

export const mockExpiredProspectingQueue: ProspectingQueue = {
    id: '456e7890-e89b-12d3-a456-426614174000',
    prospectId: '789e0123-e89b-12d3-a456-426614174000',
    lockedBySdrId: '012e3456-e89b-12d3-a456-426614174000',
    lockExpiration: new Date(Date.now() - 24 * 60 * 60 * 1000), // -24h (expiré)
    createdAt: new Date('2024-01-01T09:00:00.000Z'),
    updatedAt: new Date('2024-01-01T09:00:00.000Z'),
}; 