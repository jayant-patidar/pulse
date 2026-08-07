// ============================================================
// JWT Auth Guard — Centralized in common/
// ============================================================
// Protects endpoints that require a valid JWT access token.
// Usage: @UseGuards(JwtAuthGuard)
// ============================================================
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
