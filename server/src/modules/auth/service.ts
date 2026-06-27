import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { ENV } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";
import { RegisterInput, LoginInput, JwtPayload } from "./types";
import { RoleName, User } from "../../generated/prisma";
import { assertEmail, assertPasswordStrength } from "../../lib/validation";

// Number of bcrypt salt rounds — 10 is the standard cost/perf trade-off.
const SALT_ROUNDS = 10;

// Strip the password hash before returning a user over the network.
const sanitize = (user: User) => {
  const { password, ...safe } = user;
  return safe;
};

// Build a signed JWT carrying the user's identity and role.
const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: "7d" });

// Maximum failed attempts before the account is locked for 30 minutes.
const MAX_FAILED_ATTEMPTS = 10;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

export const AuthService = {
  // Create a new CLIENT account, hashing the password and issuing a token.
  async register(data: RegisterInput) {
    assertEmail(data.email);
    assertPasswordStrength(data.password);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing)
      throw new AppError("An account with this email already exists", 409);

    const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        role: RoleName.CLIENT,
      },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return { user: sanitize(user), token };
  },

  // Verify credentials and return a fresh token on success.
  // Tracks failed attempts and locks the account after MAX_FAILED_ATTEMPTS.
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError("Invalid email or password", 401);

    if (user.status !== "ACTIVE")
      throw new AppError("This account is disabled", 403);

    // Check if the account is temporarily locked.
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000 / 60,
      );
      throw new AppError(
        `Account temporarily locked. Try again in ${remaining} minute(s).`,
        429,
      );
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      // Increment failed attempts and lock if threshold reached.
      const attempts = user.failedAttempts + 1;
      const updates: { failedAttempts: number; lockedUntil?: Date } = {
        failedAttempts: attempts,
      };
      if (attempts >= MAX_FAILED_ATTEMPTS) {
        updates.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }
      await prisma.user.update({ where: { id: user.id }, data: updates });
      throw new AppError("Invalid email or password", 401);
    }

    // Successful login — reset failed attempts and unlock.
    await prisma.user.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return { user: sanitize(user), token };
  },

  // Resolve the currently authenticated user from their id.
  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    return sanitize(user);
  },

  // Self-service profile update; changing the password requires the current one.
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);

    const update: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      password?: string;
    } = {};
    if (data.firstName !== undefined) update.firstName = data.firstName;
    if (data.lastName !== undefined) update.lastName = data.lastName;
    if (data.phone !== undefined) update.phone = data.phone || null;

    if (data.newPassword) {
      if (!data.currentPassword)
        throw new AppError("Your current password is required", 400);
      const valid = await bcrypt.compare(data.currentPassword, user.password);
      if (!valid) throw new AppError("Your current password is incorrect", 401);
      assertPasswordStrength(data.newPassword);
      update.password = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: update,
    });
    return sanitize(updated);
  },
};
