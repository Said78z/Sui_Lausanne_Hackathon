import { Prisma } from '@/config/client';

export const messageInclude = Prisma.validator<Prisma.MessageInclude>()({
    author: true,
    readBy: {
        include: {
            user: true,
        },
    }
});

export type MessageWithRelations = Prisma.MessageGetPayload<{
    include: typeof messageInclude;
}>;
