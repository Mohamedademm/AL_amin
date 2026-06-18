import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { ENV } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { RegisterInput, LoginInput, JwtPayload } from './types';
import { RoleName, User } from '@prisma/client';
import { assertEmail, assertPasswordStrength } from '../../lib/validation';

// Number of bcrypt salt rounds — 10 is the standard cost/perf trade-off.
const SALT_ROUNDS = 10;

// Strip the password hash before returning a user over the network.
const sanitize = (user: User) => {
  const { password, ...safe } = user;
  return safe;
};

// Build a signed JWT carrying the user's identity and role.
const signToken = (payload: JwtPayload) =>
  jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '7d' });

export const AuthService = {
  // Create a new CLIENT account, hashing the password and issuing a token.
  async register(data: RegisterInput) {
    assertEmail(data.email);
    assertPasswordStrength(data.password);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('An account with this email already exists', 409);

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

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return { user: sanitize(user), token };
  },

  // Verify credentials and return a fresh token on success.
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('Invalid email or password', 401);

    if (user.status !== 'ACTIVE') throw new AppError('This account is disabled', 403);

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) throw new AppError('Invalid email or password', 401);

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return { user: sanitize(user), token };
  },

  // Resolve the currently authenticated user from their id.
  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    return sanitize(user);
  },
};
