import bcrypt from "bcryptjs";
import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { RoleName, Prisma } from "@prisma/client";
import { assertEmail, assertPasswordStrength } from "../../lib/validation";

// Fields safe to expose for any user record (never the password hash).
const SAFE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

interface StaffInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: RoleName;
}

export const UserService = {
  // List users, optionally filtered by role (e.g. only staff, only clients).
  async listAll(role?: RoleName) {
    return prisma.user.findMany({
      ...(role ? { where: { role } } : {}),
      select: SAFE_SELECT,
      orderBy: { createdAt: "desc" },
    });
  },

  // Create a staff member (MANAGER/WORKER) or admin with a hashed password.
  async createStaff(data: StaffInput) {
    if (
      !data.email ||
      !data.password ||
      !data.firstName ||
      !data.lastName ||
      !data.role
    ) {
      throw new AppError(
        "email, password, firstName, lastName and role are required",
        400,
      );
    }
    assertEmail(data.email);
    assertPasswordStrength(data.password);
    const exists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (exists)
      throw new AppError("An account with this email already exists", 409);

    const password = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        email: data.email,
        password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        role: data.role,
      },
      select: SAFE_SELECT,
    });
  },

  // Update a user's role, status, or profile fields — only whitelisted fields accepted.
  async update(
    id: string,
    data: Partial<Omit<StaffInput, "password">> & { status?: string },
  ) {
    const allowed: Record<string, unknown> = {};
    if (data.firstName !== undefined) allowed.firstName = data.firstName;
    if (data.lastName !== undefined) allowed.lastName = data.lastName;
    if (data.phone !== undefined) allowed.phone = data.phone;
    if (data.email !== undefined) allowed.email = data.email;
    if (data.role !== undefined) allowed.role = data.role;
    if (data.status !== undefined) allowed.status = data.status;
    return prisma.user.update({
      where: { id },
      data: allowed,
      select: SAFE_SELECT,
    });
  },

  // Permanently delete a user.
  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};
