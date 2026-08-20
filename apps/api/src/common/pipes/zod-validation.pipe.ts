// ============================================================
// Zod Validation Pipe
// ============================================================
// A NestJS pipe that validates request bodies against Zod schemas.
// Usage: @UsePipes(new ZodValidationPipe(myZodSchema))
// See: Doc 22 §5
// ============================================================
import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata?.type && metadata.type !== 'body') {
      return value;
    }
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      console.error('ZodValidationPipe Error:', JSON.stringify(errors, null, 2));
      throw new BadRequestException({
        message: 'Validation failed',
        errors,
      });
    }
    return result.data;
  }
}
