import { faker } from '@faker-js/faker';
import { UserRole } from '@shared/dto';

import { Prisma } from '@/config/client';

export const users: Prisma.UserCreateManyInput[] = [
    {
        id: 'd2c89e50-1b27-4b6a-b8a6-8a3b5f85df50',
        email: 'kilian@cashflowpositif.fr',
        password: 'adminPassword',
        firstName: 'Kilian',
        lastName: 'Garnier',
        roles: [UserRole.Admin],
        phone: faker.phone.number(),
        civility: faker.helpers.arrayElement(['M', 'Mme']),
        birthDate: faker.date.past().toISOString(),
        acceptNewsletter: faker.datatype.boolean(),
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
    },
    {
        id: 'bf0596a2-149e-42b7-94de-0a10774280eb',
        email: 'sdr@app.com',
        password: 'adminPassword',
        firstName: 'SDR',
        lastName: 'App',
        roles: [UserRole.SDR],
        phone: faker.phone.number(),
        civility: faker.helpers.arrayElement(['M', 'Mme']),
        birthDate: faker.date.past().toISOString(), 
        createdAt: new Date('2023-01-02T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z'),
    },
    {
        id: 'bf0596a2-149e-42b7-94de-0a10774280ec',
        email: 'contact@app.com',
        password: 'adminPassword',
        firstName: 'Contact',
        lastName: 'App',
        roles: [UserRole.Admin],
        phone: faker.phone.number(),
        civility: faker.helpers.arrayElement(['M', 'Mme']),
        birthDate: faker.date.past().toISOString(),
        acceptNewsletter: faker.datatype.boolean(),
        createdAt: new Date('2023-01-02T10:00:00Z'),
        updatedAt: new Date('2023-01-02T10:00:00Z'),
    }
];

export const fakerUser = (): Prisma.UserCreateManyInput => {
    return {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        password: 'userPassword',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phone: faker.phone.number(),
        civility: faker.helpers.arrayElement(['M', 'Mme']),
        birthDate: faker.date.past().toISOString(),
        acceptNewsletter: faker.datatype.boolean(),
        roles: [UserRole.Admin],
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
    };
};
