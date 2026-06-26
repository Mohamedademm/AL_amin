import { Request, Response, NextFunction } from "express";
import { AuthService } from "./service";
import { AppError } from "../../middleware/errorHandler";
import { AuthRequest } from "../../middleware/auth";
import { ENV } from "../../config/env";

// Seven-day cookie config; the token is ALSO returned in the body so the SPA
// can use Bearer auth across the two separate *.vercel.app domains (where
// cross-site cookies are blocked). Cookie is a same-origin convenience.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: ENV.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const AuthController = {
  // POST /api/auth/register — self-service client signup.
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      if (!email || !password || !firstName || !lastName) {
        throw new AppError(
          "email, password, firstName and lastName are required",
          400,
        );
      }
      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });
      res.cookie("token", result.token, COOKIE_OPTIONS);
      res.status(201).json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/login — exchange credentials for a JWT (body + cookie).
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw new AppError("email and password are required", 400);
      const result = await AuthService.login({ email, password });
      res.cookie("token", result.token, COOKIE_OPTIONS);
      res.json({ status: "success", data: result });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me — return the profile of the authenticated user.
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.me(req.user!.id);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/auth/me — update own profile / change password.
  async updateMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);
      res.json({ status: "success", data: user });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout — clear the auth cookie (Bearer clients drop the token client-side).
  async logout(_req: Request, res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.json({ status: "success", data: null });
  },
};
