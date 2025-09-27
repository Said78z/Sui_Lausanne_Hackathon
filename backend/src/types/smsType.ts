import { Prisma } from "@/config/client";
import { smsWithRelationsInclude } from "@/repositories/smsRepository";

// Type pour SMS avec relations (utilise les types Prisma natifs)
export type SmsWithRelations = Prisma.SmsGetPayload<{
    include: typeof smsWithRelationsInclude;
}>;
