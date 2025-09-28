/// <reference path="../types/fastify-rewrite.d.ts" />
import { FastifyInstance } from "fastify";
import { applicationParameterRoutes } from "./applicationParameterRoutes";
import { authRoutes } from "./authRoutes";
import { checkInRoutes } from "./checkInRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { enokiRoutes } from "./enokiRoutes";
import { grantPoolRoutes } from "./grantPoolRoutes";
import { passportRoutes } from "./passportRoutes";
import { userRoutes } from "./userRoutes";

export async function registerRoutes(app: FastifyInstance): Promise<void> {
    app.register(authRoutes, { prefix: '/api/auth' });
    app.register(userRoutes, { prefix: '/api/users' });
    app.register(applicationParameterRoutes, { prefix: '/api/application-parameters' });
    app.register(dashboardRoutes, { prefix: '/api/dashboard' });
    app.register(enokiRoutes, { prefix: '/api/enoki' });

    // Smart Contract Routes
    app.register(passportRoutes, { prefix: '/api/passport' });
    app.register(checkInRoutes, { prefix: '/api/checkin' });
    app.register(grantPoolRoutes, { prefix: '/api/grants' });

}
