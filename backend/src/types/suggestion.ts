import { Prisma } from '@/config/client';

import { userInclude } from '@/repositories/userRepository';

export const suggestionInclude = Prisma.validator<Prisma.SuggestionInclude>()({
    dossier: { include: { customers: { include: userInclude } } },
});

export type SuggestionWithDossier = Prisma.SuggestionGetPayload<{
    include: typeof suggestionInclude;
}>;
