import { authService } from '@/services';
import { logger } from '@/utils/logger';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const passportLogger = logger.child({
    module: '[App][Passport]',
});

// Google OAuth Strategy
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                passportLogger.info('Google OAuth callback received', {
                    profileId: profile.id,
                    email: profile.emails?.[0]?.value
                });

                // Transform Google profile to our format
                const googleProfile = {
                    id: profile.id,
                    emails: profile.emails || [],
                    name: {
                        givenName: profile.name?.givenName || '',
                        familyName: profile.name?.familyName || '',
                    },
                    photos: profile.photos || [],
                };

                // Authenticate or create user
                const user = await authService.authenticateGoogleUser(googleProfile);

                passportLogger.info('Google authentication successful', { userId: user.id });
                return done(null, user);
            } catch (error) {
                passportLogger.error('Google authentication error:', error);
                return done(error, undefined);
            }
        }
    )
);

// Serialize user for session (if using sessions)
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

// Deserialize user from session (if using sessions)
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await authService.getUserById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
