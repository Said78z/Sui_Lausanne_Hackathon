import { CreateApplicationParameter, GetAllApplicationParametersDto, UpdateApplicationParameter } from '@shared/dto';

import { ApplicationParameter, Prisma } from '@/config/client';
import prisma from '@/config/prisma';

class ApplicationParameterRepository {
    async findById(id: ApplicationParameter['id']): Promise<ApplicationParameter | null> {
        return prisma.applicationParameter.findUnique({
            where: { id },
        });
    }

    async findByName(name: ApplicationParameter['name']): Promise<ApplicationParameter | null> {
        return prisma.applicationParameter.findUnique({
            where: { name },
        });
    }

    async delete(id: ApplicationParameter['id']): Promise<ApplicationParameter> {
        return prisma.applicationParameter.delete({
            where: { id },
        });
    }

    async update(id: ApplicationParameter['id'], data: UpdateApplicationParameter): Promise<ApplicationParameter> {
        return prisma.applicationParameter.update({
            where: { id },
            data,
        });
    }

    async create(data: CreateApplicationParameter): Promise<ApplicationParameter> {
        return prisma.applicationParameter.create({
            data: {
                name: data.name,
                value: data.value,
                createdAt: new Date(),
            },
        });
    }

    async findAll(
        query: GetAllApplicationParametersDto = {}
    ): Promise<{
        data: ApplicationParameter[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            nextPage: number;
            previousPage: number;
            perPage: number;
        };
    }> {
        // Convert string parameters to appropriate types
        const page = query.page ? parseInt(query.page, 10) : 1;
        const limit = query.limit ? parseInt(query.limit, 10) : 100;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.ApplicationParameterWhereInput = {};

        if (query.name) {
            where.name = { contains: query.name };
        }

        const [data, total] = await Promise.all([
            prisma.applicationParameter.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.applicationParameter.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: total,
                nextPage: page < totalPages ? page + 1 : 0,
                previousPage: page > 1 ? page - 1 : 0,
                perPage: limit,
            },
        };
    }

    async findAllWithoutPagination(filters: Prisma.ApplicationParameterWhereInput = {}): Promise<ApplicationParameter[]> {
        return prisma.applicationParameter.findMany({
            where: filters,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(filters: Prisma.ApplicationParameterWhereInput): Promise<ApplicationParameter | null> {
        return prisma.applicationParameter.findFirst({
            where: filters,
        });
    }
}

export const applicationParameterRepository = new ApplicationParameterRepository();
