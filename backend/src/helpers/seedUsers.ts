import { fakerUser, users } from '@/fixtures';

import bcrypt from 'bcryptjs';

import { Address, Autopilot, User } from '@/config/client';
import prisma from '@/config/prisma';

export async function seedUsers(
    adresses: Address[],
    autopilots: Autopilot[],
    countFakerUsers = 10
): Promise<User[]> {
    console.log('🌱 Seeding users...');
    const createdUsers: User[] = [];

    try {
        for (let i = 0; i < users.length; i++) {
            const adress = adresses[i % adresses.length];
            const { addressId, ...userData } = users[i];
            const user = await prisma.user.create({
                data: {
                    ...userData,
                    password: await bcrypt.hash(users[i].password, 10),
                    address: { connect: { id: adress.id } },
                },
            });
            createdUsers.push(user);
        }

        for (let i = 0; i < countFakerUsers; i++) {
            const adress = adresses[i % adresses.length];
            const fakerUserData = fakerUser();
            const { addressId, ...fakerUserDataWithoutAddress } = fakerUserData;
            const user = await prisma.user.create({
                data: {
                    ...fakerUserDataWithoutAddress,
                    password: await bcrypt.hash(fakerUserData.password, 10),
                    address: { connect: { id: adress.id } },
                },
            });
            createdUsers.push(user);
        }

        console.log(`✅ Created ${createdUsers.length} users`);
        return createdUsers;
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}
