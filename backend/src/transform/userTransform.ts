import { BasicUserDto, RestrictedUserDto, UserDto, UserRole } from '@shared/dto';

import { User } from '@/config/client';
import { BasicUser } from '@/types';

class UserTransform {
    public toUserDto(user: User): UserDto {
        return {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            roles: user.roles as UserRole[],
        };
    }

    public toRestrictedUserDto(user: User): RestrictedUserDto {
        return {
            ...user,
            roles: user.roles as UserRole[],
        };
    }

    public toBasicUserDto(user: BasicUser): BasicUserDto {
        return {
            ...user,
        };
    }
}

export const userTransform = new UserTransform();
