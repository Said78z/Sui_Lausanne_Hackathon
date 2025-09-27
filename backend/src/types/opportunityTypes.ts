import { Prisma } from '@/config/client';

import { opportunityInclude } from '@/repositories/opportunityRepository';


export type OpportunityWithRelations = Prisma.OpportunityGetPayload<{
    include: typeof opportunityInclude;
}>;