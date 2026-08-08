import { Controller, Get, Patch, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards';
import * as argon2 from 'argon2';

@Controller('root/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as any).sub;
    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');
    
    // Don't send the password hash to the client
    const { passwordHash, ...safeUser } = user.toObject();
    return safeUser;
  }

  @Patch('me')
  async updateProfile(
    @Req() req: Request,
    @Body() updateDto: { firstName?: string; lastName?: string; phone?: string }
  ) {
    const userId = (req.user as any).sub;
    const updatedUser = await this.usersService.update(userId, updateDto);
    if (!updatedUser) throw new BadRequestException('User not found');
    
    const { passwordHash, ...safeUser } = updatedUser.toObject();
    return safeUser;
  }

  @Patch('me/password')
  async updatePassword(
    @Req() req: Request,
    @Body() dto: { currentPassword?: string; newPassword?: string }
  ) {
    const userId = (req.user as any).sub;
    
    if (!dto.currentPassword || !dto.newPassword) {
      throw new BadRequestException('Both current and new passwords are required');
    }

    if (dto.newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    const user = await this.usersService.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    const isMatch = await argon2.verify(user.passwordHash, dto.currentPassword);
    if (!isMatch) {
      throw new BadRequestException('Incorrect current password');
    }

    const newHash = await argon2.hash(dto.newPassword, { type: argon2.argon2id });
    await this.usersService.updatePassword(userId, newHash);

    return { success: true };
  }
}
