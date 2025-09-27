import { User } from '@/config/client';
import { Prisma } from '@/config/client';

// import { RentalPost } from './rentalPost';

export interface RentalAccount {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
    lastConnectedAt: Date;
    sex: string;
    job: string;
    isEnabled: boolean;
    owner: User;
    // rentalPosts: RentalPost[];
}

export const RealEstateAgencyWithRelations = Prisma.validator<Prisma.RealEstateAgencyInclude>()({
    address: true,
});

export type RealEstateAgencyWithRelations = Prisma.RealEstateAgencyGetPayload<{
    include: typeof RealEstateAgencyWithRelations;
}>;
