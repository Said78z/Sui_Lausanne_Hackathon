export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    createdAt: Date;
    updatedAt: Date;
    linkedinProfile: string;
    onboardingCompleted: boolean;
    isVerified?: boolean;
}
