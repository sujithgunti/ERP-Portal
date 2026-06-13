import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import type { UserRow, CredentialResult } from '@erp/types';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map((u) => this.toRow(u));
  }

  /** Create a login user with a generated password; returns the password ONCE. */
  async create(dto: CreateUserDto): Promise<CredentialResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const password = generatePassword();
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        role: dto.role,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    return { user: this.toRow(user), password };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserRow> {
    await this.ensure(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { name: dto.name, role: dto.role },
    });
    return this.toRow(user);
  }

  /** Set a chosen password for a user; returns it ONCE (for display/sharing). */
  async resetPassword(id: string, password: string): Promise<CredentialResult> {
    await this.ensure(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(password, 10) },
    });
    return { user: this.toRow(user), password };
  }

  async remove(id: string, requesterId: string): Promise<{ id: string }> {
    if (id === requesterId) throw new BadRequestException('You cannot delete your own account.');
    await this.ensure(id);
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (e) {
      // User has linked records (e.g. recorded daily updates) — block hard delete.
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException('User has linked records and cannot be deleted.');
      }
      throw e;
    }
    return { id };
  }

  private async ensure(id: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('User not found');
  }

  private toRow(u: User): UserRow {
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    };
  }
}
