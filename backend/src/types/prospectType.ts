import { Prisma } from "@/config/client";
import { prospectWithRelationsInclude } from "@/repositories/prospectRepository";

// Type pour Prospect avec relations (utilise les types Prisma natifs)
export type ProspectWithRelations = Prisma.ProspectGetPayload<{
    include: typeof prospectWithRelationsInclude;
}>;