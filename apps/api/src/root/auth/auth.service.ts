import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { MembershipsService } from '../memberships/memberships.service';
import type { AuthTokens } from '@pulse/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly membershipsService: MembershipsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    industry: string;
  }): Promise<AuthTokens> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });

    const user = await this.usersService.create({
      email: dto.email.toLowerCase().trim(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
    });

    const membership = await this.membershipsService.createOrgWithOwner(
      user._id.toString(),
      dto.organizationName,
      dto.industry,
    );

    this.eventEmitter.emit('audit.log', {
      organizationId: membership.organizationId.toString(),
      userId: user._id.toString(),
      action: 'auth.register',
      resource: 'user',
      resourceId: user._id.toString(),
    });

    return this.generateTokens(
      user._id.toString(),
      membership.organizationId.toString(),
      'OWNER',
    );
  }

  async login(
    email: string,
    password: string,
  ): Promise<AuthTokens | { requiresOrgSelection: true; organizations: unknown[] }> {
    const user = await this.usersService.findByEmail(email.toLowerCase().trim());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const memberships = await this.membershipsService.findByUserId(user._id.toString());
    if (memberships.length === 0) {
      throw new UnauthorizedException('No active organization memberships');
    }

    if (memberships.length === 1) {
      const m = memberships[0]!;

      this.eventEmitter.emit('audit.log', {
        organizationId: m.organizationId.toString(),
        userId: user._id.toString(),
        action: 'auth.login',
        resource: 'user',
        resourceId: user._id.toString(),
      });

      return this.generateTokens(user._id.toString(), m.organizationId.toString(), m.role);
    }

    return {
      requiresOrgSelection: true,
      organizations: memberships.map((m) => ({
        id: m.organizationId.toString(),
        role: m.role,
      })),
    };
  }

  private generateTokens(userId: string, orgId: string, role: string): AuthTokens {
    const payload = { sub: userId, org: orgId, role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRY', '7d'),
    });

    return { accessToken, refreshToken };
  }
}
