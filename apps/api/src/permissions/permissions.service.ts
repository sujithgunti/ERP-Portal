import { Injectable } from '@nestjs/common';
import { hasTab } from '@erp/types';
import { PrismaService } from '../database/prisma.service';

/**
 * Per-user tab permissions (Discord-style bitfield). Each user's effective tab
 * mask is their UserRoleAssignment.permissions. Fully data-driven — ADMIN simply
 * has all bits set in its assignment (no code override), so two users of the same
 * role can differ.
 *
 * ponytail: one indexed lookup per guarded request — fine at this scale; add a
 * short-TTL cache keyed by userId if it ever shows up hot.
 */
@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Effective tab mask for a user (their assignment's permission bitmask). */
  async tabsFor(user: { id: string }): Promise<number> {
    const assignment = await this.prisma.userRoleAssignment.findUnique({
      where: { userId: user.id },
      select: { permissions: true },
    });
    return Number(assignment?.permissions ?? 0n); // BigInt -> number (safe ≤ 53 bits)
  }

  /** Whether the user may access the tab identified by `bit`. */
  async can(user: { id: string }, bit: number): Promise<boolean> {
    return hasTab(await this.tabsFor(user), bit);
  }
}
