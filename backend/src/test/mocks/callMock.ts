import { CallWithRelations } from '@/repositories';
import { CallResult, CallStatus } from '@shared/enums';

export const mockCall: CallWithRelations = {
    id: 'mock-call-id-1',
    status: CallStatus.ANSWERED,
    calledAt: new Date('2024-03-15T14:30:00Z'),
    callResult: CallResult.CALLBACK_TODAY,
    notes: 'Prospect intéressé par un investissement locatif',
    duration: 180, // 3 minutes
    prospectId: 'mock-prospect-id-1',
    calledById: 'mock-user-id-1',
    createdAt: new Date('2024-03-15T14:30:00Z'),
    updatedAt: new Date('2024-03-15T14:30:00Z'),
    prospect: {
        id: 'mock-prospect-id-1',
        email: 'prospect@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        civility: 'M',
    },
    calledBy: {
        id: 'mock-user-id-1',
    },
};

export const mockCallList: CallWithRelations[] = [
    mockCall,
    {
        id: 'mock-call-id-2',
        status: CallStatus.ABSENT,
        calledAt: new Date('2024-03-15T15:00:00Z'),
        callResult: CallResult.NO_ANSWER,
        notes: 'Pas de réponse',
        duration: null,
        prospectId: 'mock-prospect-id-2',
        calledById: 'mock-user-id-1',
        createdAt: new Date('2024-03-15T15:00:00Z'),
        updatedAt: new Date('2024-03-15T15:00:00Z'),
        prospect: {
            id: 'mock-prospect-id-2',
            email: 'prospect2@example.com',
            firstName: 'Pierre',
            lastName: 'Dubois',
            civility: 'M',
        },
        calledBy: {
            id: 'mock-user-id-1',
        },
    },
];

export const mockCallStats = {
    totalCalls: 10,
    answeredCalls: 6,
    absentCalls: 4,
    averageDuration: 120,
    callsByResult: {
        [CallResult.CALLBACK_TODAY]: 3,
        [CallResult.CALLBACK_FUTURE]: 2,
        [CallResult.NO_ANSWER]: 3,
        [CallResult.ABANDON]: 1,
        [CallResult.FORWARDED_TO_WALLY]: 1,
    },
    answerRate: 60,
}; 