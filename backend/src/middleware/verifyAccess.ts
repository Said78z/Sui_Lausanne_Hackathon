import { UserSchema, UserRole } from '@shared/dto';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';

interface AuthenticatedRequest extends FastifyRequest {
    user: UserSchema;
}

/**
 * Middleware to check if the user has the required access rights, considering the role hierarchy.
 * @param requiredRole - The required role to access the resource.
 */
export const verifyAccess = (requiredRole: UserRole) => {
    return (req: AuthenticatedRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
        const user = req.user;

        if (!user) {
            return reply.status(401).send({ message: 'Unauthorized: User not authenticated.' });
        }

        console.log('User roles:', user.roles);
        console.log('Required role:', requiredRole);
        const hasAccess = user.roles?.includes(requiredRole);

        if (hasAccess) {
            done();
            return;
        } else {
            return reply
                .status(403)
                .send({ message: "Forbidden: You don't have the required permissions." });
        }
    };
};
