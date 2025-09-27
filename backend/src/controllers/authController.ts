import { tokenRepository, userRepository } from '@/repositories';
import { authService, userService } from '@/services';
import { getLocationFromIp, parseUserAgent } from '@/utils';
import { asyncHandler } from '@/utils/asyncHandler';
import { authResponse, jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import { render } from '@react-email/components';
import {
    LoginDto,
    QuerySessionsDto,
    RegisterDto,
    RequestPasswordResetDto,
    ResetPasswordDto,
    TokenDto,
    UpdatePasswordDto,
    UserDto,
    UserRole,
    UserSchema,
    loginSchema,
    querySessionsSchema,
    registerSchema,
    requestPasswordResetSchema,
    resetPasswordSchema,
    tokenSchema,
    updatePasswordSchema
} from '@shared/dto';
import bcrypt from 'bcryptjs';
import { verify } from 'jsonwebtoken';

import { Role } from '@/types/userTypes';

class AuthController {
    private logger = logger.child({
        module: '[CFR][AUTH][CONTROLLER]',
    });

    constructor() { }
}

export const authController = new AuthController();
