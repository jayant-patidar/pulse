import { Controller, Post, Body, HttpCode, HttpStatus, Res, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards';

@Controller('root/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  @Post('register')
  async register(
    @Body() dto: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      organizationName: string;
      industry: string;
    },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.register(dto);
    this.setCookies(res, tokens);
    return { success: true };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto.email, dto.password);
    if ('requiresOrgSelection' in result) {
      return result;
    }
    this.setCookies(res, result);
    return { success: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { success: true };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }
    const result = await this.authService.refresh(refreshToken);
    this.setCookies(res, result);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    // We should ideally inject OrganizationsService, but for now we can just return
    // what we have, or let's add OrganizationsService to AuthModule.
    // Wait, injecting OrganizationsService here requires modifying AuthModule.
    // Let's just do it properly.
    return user;
  }
}
