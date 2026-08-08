import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtensionPlugin } from '../../../common/interfaces';
import { conTaskExtensionsSchema, ConTaskExtensions } from '@pulse/validators';

@Injectable()
export class ConTaskPlugin implements ExtensionPlugin<ConTaskExtensions> {
  readonly industry = 'CONSTRUCTION';

  async validateExtensions(data: unknown): Promise<ConTaskExtensions> {
    try {
      return await conTaskExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Construction Task Extensions',
        errors: error.errors,
      });
    }
  }
}
