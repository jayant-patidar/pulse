import { BadRequestException, Injectable } from '@nestjs/common';
import { AgrTaskExtensions, agrTaskExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces';

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
