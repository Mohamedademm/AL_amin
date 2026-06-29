import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { RoleName, Prisma } from '../../generated/prisma';
import { assertEmail, assertPasswordStrength } from '../../lib/validation';

const SAFE_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  assignedSpotId: true,
} satisfies Prisma.UserSelect;

interface StaffInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: RoleName;
  assignedSpotId?: string;
}

export const UserService = {
  // List all users, optionally filtered by role.
  async listAll(role?: RoleName) {
    return prisma.user.findMany({
      ...(role ? { where: { role } } : {}),
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  },

  // List users assigned to the spot that a MANAGER manages.
  async listByManagedSpot(managerId: string, role?: RoleName) {
    const spot = await prisma.vendingSpot.findUnique({
      where: { managerId },
      select: { id: true },
    });
    if (!spot) return [];

    return prisma.user.findMany({
      where: {
        assignedSpotId: spot.id,
        ...(role ? { role } : {}),
      },
      select: SAFE_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  },

  // Create a staff account. ADMIN can create any role; MANAGER can only create WORKER.
  async createStaff(data: StaffInput, requester: { id: string; role: string }) {
    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.role) {
      throw new AppError('email, password, firstName, lastName and role are required', 400);
    }

    // MANAGER can only create WORKER accounts for their own spot.
    if (requester.role === 'MANAGER') {
      if (data.role !== 'WORKER') {
        throw new AppError('Managers can only create WORKER accounts', 403);
      }
      const spot = await prisma.vendingSpot.findUnique({
        where: { managerId: requester.id },
        select: { id: true },
      });
      if (!spot) throw new AppError('You do not manage any vending spot', 400);
      data.assignedSpotId = spot.id; // force-assign to their spot
    }

    assertEmail(data.email);
    assertPasswordStrength(data.password);

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new AppError('An account with this email already exists', 409);

    const password = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        email: data.email,
        password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone ?? null,
        role: data.role,
        assignedSpotId: data.assignedSpotId ?? null,
      },
      select: SAFE_SELECT,
    });
  },

  // Update a user's role, status, profile fields, or assigned spot.
  async update(id: string, data: Partial<StaffInput> & { status?: string }) {
    const allowed: Record<string, unknown> = {};
    if (data.firstName !== undefined) allowed.firstName = data.firstName;
    if (data.lastName !== undefined) allowed.lastName = data.lastName;
    if (data.phone !== undefined) allowed.phone = data.phone;
    if (data.email !== undefined) allowed.email = data.email;
    if (data.role !== undefined) allowed.role = data.role;
    if (data.status !== undefined) allowed.status = data.status;
    if (data.assignedSpotId !== undefined) allowed.assignedSpotId = data.assignedSpotId;
    if (data.password) allowed.password = await bcrypt.hash(data.password, 10);
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
