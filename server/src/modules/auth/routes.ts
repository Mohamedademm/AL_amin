import { Router, Request, Response } from "express";
import { AuthController } from "./controller";
import { authenticate } from "../../middleware/auth";
import passport from "../../config/passport";
import { ENV } from "../../config/env";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import {
  validate,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../../lib/validation";

const router = Router();

// Tighter rate limiters for credential-based endpoints to slow brute-force.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many login attempts, please try again later.",
  },
});
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many registration attempts, please try again later.",
  },
});

// Public authentication endpoints.
router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  AuthController.register,
);
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  AuthController.login,
);

// Google OAuth — initiate login.
router.get("/google", (req: Request, res: Response) => {
  if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${ENV.CLIENT_URL}/login?error=google_not_configured`);
  }
  try {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(req, res);
  } catch {
    res.redirect(`${ENV.CLIENT_URL}/login?error=google_not_configured`);
  }
});

// Google OAuth — callback.
router.get("/google/callback", (req: Request, res: Response) => {
  if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${ENV.CLIENT_URL}/login?error=google_not_configured`);
  }
  try {
    passport.authenticate(
      "google",
      { session: false, failureRedirect: `${ENV.CLIENT_URL}/login` },
      (err: any, user: any) => {
        if (err || !user) return res.redirect(`${ENV.CLIENT_URL}/login`);

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          ENV.JWT_SECRET,
          { expiresIn: "7d" },
        );
        res.cookie("token", token, {
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.redirect(`${ENV.CLIENT_URL}/auth/google/callback?token=${token}`);
      },
    )(req, res);
  } catch {
    res.redirect(`${ENV.CLIENT_URL}/login?error=google_not_configured`);
  }
});

// Authenticated session endpoints.
router.get("/me", authenticate, AuthController.me);
router.patch(
  "/me",
  authenticate,
  validate(updateProfileSchema),
  AuthController.updateMe,
);
router.post("/logout", authenticate, AuthController.logout);

export default router;
