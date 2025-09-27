import { Prisma } from '@/config/client';

import { chatInclude } from '@/repositories/chatRepository';


export type ChatWithRelations = Prisma.ChatGetPayload<{
    include: typeof chatInclude;
}>;