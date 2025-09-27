import { Prisma } from "@/config/client";
import { emailWithRelationsInclude } from "@/repositories/emailRepository";

// Type pour Email avec relations (utilise les types Prisma natifs)
export type EmailWithRelations = Prisma.EmailGetPayload<{
    include: typeof emailWithRelationsInclude;
}>;
