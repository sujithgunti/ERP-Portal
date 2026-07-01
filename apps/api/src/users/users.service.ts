import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { UserRow, CredentialResult, Role as RoleCode } from '@erp/types';
import { ALL_TABS } from '@erp/types';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Load each user with their role assignment so we can flatten role code + tabs.
const userInclude = { roleAssignment: { include: { roleDefinition: true } } } as const;
type UserWithRole = Prisma.UserGetPayload<{ include: typeof userInclude }>;

/** Generate a readable random password, e.g. "Kf7p-Qm2x-9Tab" (12 chars). */
function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = randomBytes(12);
  let out = '';
  for (let i = 0; i < 12; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if (i === 3 || i === 7) out += '-';
  }
  return out;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserRow[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: userInclude,
    });
    return users.map((u) => this.toRow(u));
  }

  /** Create a login user with a generated password; returns the password ONCE. */
  async create(dto: CreateUserDto): Promise<CredentialResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const roleDef = await this.prisma.roleDefinition.findUniqueOrThrow({
      where: { code: dto.role },
    });
    const password = generatePassword();
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: await bcrypt.hash(password, 10),
        // Start from the role's default permission bitmask; admin tunes per user.
        roleAssignment: {
          create: { roleDefinitionId: roleDef.id, permissions: roleDef.permissions },
        },
      },
      include: userInclude,
    });
    return { user: this.toRow(user), password };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserRow> {
    await this.ensure(id);
    if (dto.name !== undefined) {
      await this.prisma.user.update({ where: { id }, data: { name: dto.name } });
    }
    if (dto.role !== undefined) {
      // Switching role re-points the assignment and resets tabs to that role's default.
      const roleDef = await this.prisma.roleDefinition.findUniqueOrThrow({
        where: { code: dto.role },
      });
      await this.prisma.userRoleAssignment.update({
        where: { userId: id },
        data: { roleDefinitionId: roleDef.id, permissions: roleDef.permissions },
      });
    }
    return this.findRow(id);
  }

  /** Set a chosen password for a user; returns it ONCE (for display/sharing). */
  async resetPassword(id: string, password: string): Promise<CredentialResult> {
    await this.ensure(id);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(password, 10) },
    });
    return { user: await this.findRow(id), password };
  }

  async remove(id: string, requesterId: string): Promise<{ id: string }> {
    if (id === requesterId) throw new BadRequestException('You cannot delete your own account.');
    await this.ensure(id);
    try {
      await this.prisma.user.delete({ where: { id } }); // assignment cascades
    } catch (e) {
      // User has linked records (e.g. recorded daily updates) — block hard delete.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException('User has linked records and cannot be deleted.');
      }
      throw e;
    }
    return { id };
  }

  /** Set a user's per-user tab permission mask (admin only). Rejects unknown bits. */
  async updateTabs(id: string, tabs: number): Promise<UserRow> {
    if (!Number.isInteger(tabs) || tabs < 0 || (tabs & ~ALL_TABS) !== 0) {
      throw new BadRequestException('Invalid tab mask.');
    }
    await this.ensure(id);
    await this.prisma.userRoleAssignment.update({
      where: { userId: id },
      data: { permissions: BigInt(tabs) },
    });
    return this.findRow(id);
  }

  private async ensure(id: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('User not found');
  }

  private async findRow(id: string): Promise<UserRow> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id }, include: userInclude });
    return this.toRow(user);
  }

  private toRow(u: UserWithRole): UserRow {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: (u.roleAssignment?.roleDefinition.code ?? 'PARTNER') as RoleCode,
      tabs: Number(u.roleAssignment?.permissions ?? 0n), // BigInt -> number (safe ≤ 53 bits)
      createdAt: u.createdAt.toISOString(),
    };
  }
}
