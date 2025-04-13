const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function configurePassport() {
    passport.use(
        'google',
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                scope: ['email', 'profile'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const { name, emails, photos } = profile;
                    const user = {
                        email: emails[0].value,
                        firstName: name.givenName,
                        lastName: name.familyName,
                        picture: photos[0].value,
                        accessToken,
                        refreshToken,
                    };
                    
                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );

    // Configure authorization parameters
    passport.use(
        'google', 
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                scope: ['email', 'profile'],
                authorizationParams: {
                access_type: 'offline',
                prompt: 'consent'
                }
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const { name, emails, photos } = profile;
                    const user = {
                        email: emails[0].value,
                        firstName: name.givenName,
                        lastName: name.familyName,
                        picture: photos[0].value,
                        accessToken,
                        refreshToken,
                    };
                    
                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
};