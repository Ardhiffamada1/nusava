import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterDto,
  LoginDto,
  AuthUserResponse,
  AuthSessionResponse,
  UserRole,
} from '@commerceos/contracts';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getCookieOptions(maxAge: number) {
    const isProd = this.configService.get('NODE_ENV') === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge,
    };
  }

  private setAuthCookies(res: Response, userId: string, email: string, role: UserRole) {
    const accessSecret = this.configService.get('JWT_SECRET') || 'commerceos-super-secret-jwt-key-for-local-development-must-be-min-32-chars';
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET') || 'commerceos-super-secret-refresh-key-for-local-development-must-be-min-32-chars';

    const accessToken = this.jwtService.sign(
      { sub: userId, email, role },
      { secret: accessSecret, expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, email, role },
      { secret: refreshSecret, expiresIn: '7d' },
    );

    // Set 15m access cookie and 7d refresh cookie
    res.cookie('access_token', accessToken, this.getCookieOptions(15 * 60 * 1000));
    res.cookie('refresh_token', refreshToken, this.getCookieOptions(7 * 24 * 60 * 60 * 1000));

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto, res: Response): Promise<AuthSessionResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email address already exists');
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: UserRole.CUSTOMER,
        },
      });

      // Automatically initialize an active cart for the customer
      await tx.cart.create({
        data: {
          userId: newUser.id,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: newUser.id,
        },
      });

      return newUser;
    });

    this.setAuthCookies(res, user.id, user.email, user.role);

    const userResponse: AuthUserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };

    return {
      user: userResponse,
      message: 'Account registered successfully',
    };
  }

  async login(dto: LoginDto, res: Response): Promise<AuthSessionResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.setAuthCookies(res, user.id, user.email, user.role);

    const userResponse: AuthUserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };

    return {
      user: userResponse,
      message: 'Logged in successfully',
    };
  }

  async logout(res: Response): Promise<{ success: boolean; message: string }> {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async refreshTokens(refreshToken: string | undefined, res: Response): Promise<AuthSessionResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET') || 'commerceos-super-secret-refresh-key-for-local-development-must-be-min-32-chars';

    let payload: { sub: string; email: string; role: UserRole };
    try {
      payload = this.jwtService.verify(refreshToken, { secret: refreshSecret });
    } catch {
      res.clearCookie('access_token', { path: '/' });
      res.clearCookie('refresh_token', { path: '/' });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account no longer active');
    }

    this.setAuthCookies(res, user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      message: 'Tokens refreshed successfully',
    };
  }

  async getMe(userId: string): Promise<AuthUserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
