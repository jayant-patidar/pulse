// ============================================================
// Zod Validation Pipe
// ============================================================
// A NestJS pipe that validates request bodies against Zod schemas.
// Usage: @UsePipes(new ZodValidationPipe(myZodSchema))
// See: Doc 22 §5
// ============================================================
import { PipeTransform, BadRequestException } from '@nestjs/common';
import type { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }
    return result.data;
  }
}
