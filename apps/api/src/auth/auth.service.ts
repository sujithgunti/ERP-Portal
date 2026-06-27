import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import type { AuthUser, Role as RoleCode } from '@erp/types';
import { Role } from '@erp/types';
import { PrismaService } from '../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface AuthResult {
  accessToken: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /** Self-service signup. New users always get the PARTNER role (no privilege escalation). */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const partner = await this.prisma.roleDefinition.findUniqueOrThrow({
      where: { code: Role.PARTNER },
    });
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash: await bcrypt.hash(dto.password, 10),
        roleAssignment: {
          create: { roleDefinitionId: partner.id, permissions: partner.permissions },
        },
      },
    });

    return this.issue(user.id);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issue(user.id);
  }

  /** Sign a JWT carrying the user's role code (from their assignment). */
  private async issue(userId: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { roleAssignment: { include: { roleDefinition: true } } },
    });
    const role = (user.roleAssignment?.roleDefinition.code ?? Role.PARTNER) as RoleCode;

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
    };

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      name: user.name,
      role,
    });

    return { accessToken, user: authUser };
  }
}
