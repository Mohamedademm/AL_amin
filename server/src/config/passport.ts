import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "./database";
import { ENV } from "./env";
import { RoleName } from "../generated/prisma";

// Serialize user id into the session (not used with JWT, but passport needs it).
passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Google OAuth strategy — always register so passport.authenticate('google')
// never throws "unknown strategy". The route handlers check for credentials.
if (ENV.GOOGLE_CLIENT_ID && ENV.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: ENV.GOOGLE_CLIENT_ID,
        clientSecret: ENV.GOOGLE_CLIENT_SECRET,
        callbackURL: ENV.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email)
            return done(new Error("No email returned from Google"), undefined);

          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            // Auto-create a CLIENT account with a random password.
            user = await prisma.user.create({
              data: {
                email,
                password: await bcrypt.hash(crypto.randomUUID(), 10),
                firstName:
                  profile.name?.givenName ||
                  profile.displayName.split(" ")[0] ||
                  "Google",
                lastName:
                  profile.name?.familyName ||
                  profile.displayName.split(" ").slice(1).join(" ") ||
                  "User",
                role: RoleName.CLIENT,
              },
            });
          }

          if (user.status !== "ACTIVE")
            return done(new Error("This account is disabled"), undefined);

          return done(null, user);
        } catch (err) {
          return done(err, undefined);
        }
      },
    ),
  );
}

export default passport;
