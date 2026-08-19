import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtensionPlugin } from '../../../common/interfaces';
import { agrTaskExtensionsSchema, AgrTaskExtensions } from '@pulse/validators';

@Injectable()
export class AgrTaskPlugin implements ExtensionPlugin<AgrTaskExtensions> {
  readonly industry = 'AGRICULTURE';

  async validateExtensions(data: unknown): Promise<AgrTaskExtensions> {
    try {
      return await agrTaskExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Agriculture Task Extensions',
        errors: error.errors,
      });
    }
  }
}
