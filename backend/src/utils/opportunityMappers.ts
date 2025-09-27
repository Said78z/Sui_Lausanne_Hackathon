import {
    OpportunityStatus as PrismaOpportunityStatus,
    OpportunityType as PrismaOpportunityType,
} from '@/config/client';
import { OpportunityStatus, OpportunityType } from '@shared/enums/opportunityEnums';

/**
 * Maps shared OpportunityType to Prisma OpportunityType
 */
export function mapToPrismaOpportunityType(sharedType: OpportunityType): PrismaOpportunityType {
    switch (sharedType) {
        case OpportunityType.APARTMENT:
            return PrismaOpportunityType.APARTMENT;
        case OpportunityType.BUILDING:
            return PrismaOpportunityType.BUILDING;
        case OpportunityType.HOUSE:
            return PrismaOpportunityType.HOUSE;
        case OpportunityType.STUDIO:
            return PrismaOpportunityType.STUDIO;
        case OpportunityType.OFFICE:
            return PrismaOpportunityType.OFFICE;
        case OpportunityType.COMMERCIAL:
            return PrismaOpportunityType.COMMERCIAL;
        case OpportunityType.PARKING:
            return PrismaOpportunityType.PARKING;
        default:
            return PrismaOpportunityType.BUILDING;
    }
}

/**
 * Maps Prisma OpportunityType to shared OpportunityType
 */
export function mapFromPrismaOpportunityType(prismaType: PrismaOpportunityType | null): OpportunityType {
    switch (prismaType) {
        case PrismaOpportunityType.APARTMENT:
            return OpportunityType.APARTMENT;
        case PrismaOpportunityType.BUILDING:
            return OpportunityType.BUILDING;
        case PrismaOpportunityType.HOUSE:
            return OpportunityType.HOUSE;
        case PrismaOpportunityType.STUDIO:
            return OpportunityType.STUDIO;
        case PrismaOpportunityType.OFFICE:
            return OpportunityType.OFFICE;
        case PrismaOpportunityType.COMMERCIAL:
            return OpportunityType.COMMERCIAL;
        case PrismaOpportunityType.PARKING:
            return OpportunityType.PARKING;
        default:
            return OpportunityType.BUILDING;
    }
}

/**
 * Maps shared OpportunityStatus to Prisma OpportunityStatus
 */
export function mapToPrismaOpportunityStatus(sharedStatus: OpportunityStatus): PrismaOpportunityStatus {
    switch (sharedStatus) {
        case OpportunityStatus.NEW:
            return PrismaOpportunityStatus.NEW;
        case OpportunityStatus.QUALIFIED:
            return PrismaOpportunityStatus.QUALIFIED;
        case OpportunityStatus.PREQUALIFIED:
            return PrismaOpportunityStatus.PREQUALIFIED;
        case OpportunityStatus.RELEVANT:
            return PrismaOpportunityStatus.RELEVANT;
        default:
            return PrismaOpportunityStatus.NEW;
    }
}

/**
 * Maps Prisma OpportunityStatus to shared OpportunityStatus
 */
export function mapFromPrismaOpportunityStatus(prismaStatus: PrismaOpportunityStatus): OpportunityStatus {
    switch (prismaStatus) {
        case PrismaOpportunityStatus.NEW:
            return OpportunityStatus.NEW;
        case PrismaOpportunityStatus.QUALIFIED:
            return OpportunityStatus.QUALIFIED;
        case PrismaOpportunityStatus.PREQUALIFIED:
            return OpportunityStatus.PREQUALIFIED;
        case PrismaOpportunityStatus.RELEVANT:
            return OpportunityStatus.RELEVANT;
        default:
            return OpportunityStatus.NEW;
    }
} 