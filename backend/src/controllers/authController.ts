import { tokenRepository, userRepository } from '@/repositories';
import { authService, mailerService, userService } from '@/services';
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
import { PasswordResetEmail } from '@template-emails/emails/account/password-reset';
import { FailedLoginAttempt } from '@template-emails/emails/security/failedLoginAttempt';
import { NewDeviceLogin } from '@template-emails/emails/security/newDeviceLogin';
import bcrypt from 'bcryptjs';
import { verify } from 'jsonwebtoken';

import { Role } from '@/types/userTypes';

class AuthController {
    private logger = logger.child({
        module: '[CFR][AUTH][CONTROLLER]',
    });

    constructor() { }

    public createUser = asyncHandler<RegisterDto, unknown, unknown, UserDto>({
        bodySchema: registerSchema,
        logger: this.logger,
        handler: async (request, reply) => {
            const existingUser = await userRepository.findByEmail(request.body.email);

            if (existingUser) {
                return jsonResponse(reply, 'Utilisateur déjà existant', {}, 400);
            }

            const hashedPassword = await bcrypt.hash(request.body.password, 10);

            // Extract data from request body, omitting confirmPassword
            const { confirmPassword, terms, privacy, rememberMe, ...userData } = request.body;

            const createdUser = await userRepository.create({
                ...userData,
                password: hashedPassword,
                acceptNewsletter: userData.acceptNewsletter ?? false,
                roles: ['ROLE_USER'] as Role[],
                phone: userData.phone || '',
                civility: userData.civility || '',
                birthDate: typeof userData.birthDate === 'string' ? userData.birthDate : new Date().toISOString(),
            });

            const tokens = await authService.generateTokens(createdUser, request);

            if (!tokens?.accessToken?.token || !tokens?.refreshToken?.token) {
                return jsonResponse(reply, 'Erreur lors de la génération des tokens', {}, 500);
            }

            return authResponse(reply, tokens?.accessToken?.token, tokens?.refreshToken?.token);
        },
    });

    public login = asyncHandler<LoginDto, unknown, unknown, TokenDto[]>({
        bodySchema: loginSchema,
        logger: this.logger,
        handler: async (request, reply) => {
            const user = await userRepository.findByEmail(request.body.email);

            if (!user) {
                return jsonResponse(reply, 'Identifiants invalides', {}, 401);
            }

            const isPasswordValid = await bcrypt.compare(request.body.password, user.password);

            const isNewDevice = await authService.isNewDevice(user, request);

            const parsedUserAgent = parseUserAgent(request.headers['user-agent'] as string);
            const location = await getLocationFromIp(request.ip);

            if (!isPasswordValid) {
                if (isNewDevice) {
                    mailerService.sendEmail(
                        user.email,
                        'Failed Login Attempt',
                        await render(
                            FailedLoginAttempt({
                                name: user.firstName,
                                attemptDate: new Date().toLocaleString(),
                                ipAddress: request.ip,
                                location:
                                    location?.city || location?.country
                                        ? `${location?.city || ''}, ${location?.region || ''}, ${location?.country || ''}`
                                        : 'Non disponible',
                                deviceInfo: `${parsedUserAgent.device.model || 'Unknown device'}, ${parsedUserAgent.os.name} ${parsedUserAgent.os.version}, ${parsedUserAgent.browser.name} ${parsedUserAgent.browser.version}, ${request.ip}`,
                            })
                        )
                    );
                }
                return jsonResponse(reply, 'Identifiants invalides', {}, 401);
            }

            await userRepository.update(user.id, { lastLoginAt: new Date() });

            const tokens = await authService.generateTokens(user, request);

            if (!tokens?.accessToken?.token || !tokens?.refreshToken?.token) {
                return jsonResponse(reply, 'Erreur lors de la génération des tokens', {}, 500);
            }
            //check if is a new device
            if (isNewDevice) {
                try {
                    mailerService.sendEmail(
                        user.email,
                        'New Device Login',
                        await render(
                            NewDeviceLogin({
                                name: user.firstName,
                                deviceName: `${parsedUserAgent.device.model || 'Unknown device'}, ${parsedUserAgent.os.name} ${parsedUserAgent.os.version}, ${parsedUserAgent.browser.name} ${parsedUserAgent.browser.version}`,
                                loginDate: new Date().toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                }),
                                location:
                                    location?.city || location?.country
                                        ? `${location?.city || ''}, ${location?.region || ''}, ${location?.country || ''}`
                                        : 'Non disponible',
                                deviceId: parsedUserAgent.raw.slice(0, 20),
                            })
                        )
                    );
                } catch (error) {
                    console.log('\n\n error', error);
                    this.logger.error({
                        msg: "Erreur lors de l'envoi de l'email de nouveau appareil",
                        error: error,
                    });
                }
            }

            this.logger.info({
                msg: 'Utilisateur connecté',
                action: 'login',
                status: 'success',
                timestamp: Date.now(),
                deviceInfo: request.headers['user-agent']
                    ? {
                        browser: parsedUserAgent.browser.name,
                        os: parsedUserAgent.os.name,
                        isMobile: parsedUserAgent.device.type === 'mobile',
                    }
                    : 'Unknown device',
            });

            return authResponse(reply, tokens?.accessToken?.token, tokens?.refreshToken?.token);
        },
    });

    public updatePassword = asyncHandler<UpdatePasswordDto, unknown, unknown, UserDto>({
        bodySchema: updatePasswordSchema,
        logger: this.logger,
        handler: async (request, reply) => {
            const { currentPassword, newPassword } = request.body;

            console.log('\n\n currentPassword', currentPassword);
            console.log('\n\n newPassword', newPassword);

            const existingUser = await userRepository.findById(request.user.id);

            if (!existingUser || !existingUser.id) {
                return jsonResponse(reply, 'Utilisateur non trouvé', {}, 404);
            }

            if (existingUser.id !== request.user.id) {
                return jsonResponse(reply, 'Utilisateur non autorisé', {}, 403);
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);

            console.log('\n\n isPasswordValid', isPasswordValid);

            if (!isPasswordValid) {
                return jsonResponse(reply, 'Mot de passe incorrect', {}, 401);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await userRepository.update(existingUser.id, { password: hashedPassword });

            return jsonResponse(reply, 'Mot de passe mis à jour avec succès', {}, 200);
        },
    });

    public refreshToken = asyncHandler<TokenDto, unknown, unknown, TokenDto[]>({
        bodySchema: tokenSchema,
        logger: this.logger,
        handler: async (request, reply) => {
            const body = request.body as { token: string };
            const token = body.token;
            const decoded = verify(token, process.env.JWT_SECRET as string) as UserSchema;

            const foundToken = await tokenRepository.findByToken(token);

            if (!foundToken || foundToken.unvailableAt) {
                return jsonResponse(reply, 'Token invalide', null, 401);
            }

            const user = await userRepository.findById(decoded.id);

            if (!user) {
                return jsonResponse(reply, 'Utilisateur non trouvé', null, 404);
            }

            const newTokens = await authService.generateTokens(user, request);

            if (!newTokens?.accessToken?.token || !newTokens?.refreshToken?.token) {
                return jsonResponse(reply, 'Erreur lors de la génération des tokens', {}, 500);
            }

            return authResponse(
                reply,
                newTokens?.accessToken?.token,
                newTokens?.refreshToken?.token
            );
        },
    });

    public requestPasswordReset = asyncHandler<RequestPasswordResetDto, unknown, unknown, UserDto>({
        bodySchema: requestPasswordResetSchema,
        logger: this.logger,
        handler: async (request, reply) => {
            const user = await userRepository.findByEmail(request.body.email);

            if (!user || !user.id) {
                return jsonResponse(reply, 'Identifiants invalides', {}, 401);
            }

            const token = await authService.generatePasswordResetToken(user.id, request.ip);

            const email = await render(
                PasswordResetEmail({
                    name: user.firstName,
                    resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
                })
            );

            await mailerService.sendEmail(user.email, 'Mot de passe oublié', email);

            return jsonResponse(reply, 'Mot de passe oublié', {}, 200);
        },
    });

    public resetPassword = asyncHandler<ResetPasswordDto, unknown, unknown, UserDto>({
        bodySchema: resetPasswordSchema,
        logger: this.logger,
        handler: async (request, reply) => {
            const { token, currentPassword, newPassword } = request.body;
            console.log('\n\n token', token);

            const resetToken = await authService.findByToken(token);

            if (
                !resetToken ||
                resetToken.type !== 'reset_password' ||
                new Date() > resetToken.expiresAt
            ) {
                return jsonResponse(reply, 'Token invalide ou expiré', {}, 400);
            }

            const user = await userRepository.findById(resetToken.ownedById as string);
            if (!user) {
                return jsonResponse(reply, 'Utilisateur non trouvé', {}, 404);
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return jsonResponse(reply, 'Mot de passe actuel incorrect', {}, 400);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await userService.updatePassword(resetToken.ownedById as string, hashedPassword);

            await authService.deleteToken(resetToken.id);

            return jsonResponse(reply, 'Mot de passe réinitialisé avec succès', {}, 200);
        },
    });

    public getCurrentUser = asyncHandler<unknown, unknown, unknown, UserDto>({
        logger: this.logger,
        handler: async (request, reply) => {
            if (!request.user?.id) {
                return jsonResponse(reply, 'Utilisateur non authentifié', null, 401);
            }

            const user = await userRepository.findById(request.user.id);
            if (!user) {
                return jsonResponse(reply, 'Utilisateur non trouvé', null, 404);
            }

            const token = request.headers.authorization?.split(' ')[1];
            const foundedToken = await tokenRepository.findByToken(token as string);

            if (!token || foundedToken?.unvailableAt) {
                return jsonResponse(reply, 'Token invalide', null, 401);
            }

            return jsonResponse(reply, 'Utilisateur récupéré avec succès', user, 200);
        },
    });

    public getMySessions = asyncHandler<unknown, QuerySessionsDto, unknown, TokenDto[]>({
        querySchema: querySessionsSchema,
        logger: this.logger,
        handler: async (request, reply) => {
            if (!request.user?.id) {
                return jsonResponse(reply, 'Utilisateur non authentifié', null, 401);
            }

            if (
                request.query.userId !== request.user.id &&
                !request.user.roles?.includes(UserRole.Admin)
            ) {
                return jsonResponse(reply, 'Utilisateur non autorisé', null, 403);
            }

            const tokens = await tokenRepository.findAllByUserIdAndBrowser(request.query.userId);
            return jsonResponse(reply, 'Sessions récupérées avec succès', tokens, 200);
        },
    });
}

export const authController = new AuthController();
