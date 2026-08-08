import { Injectable, BadRequestException } from '@nestjs/common';
import { ExtensionPlugin } from '../../../common/interfaces';
import { conProjectExtensionsSchema, ConProjectExtensions } from '@pulse/validators';

@Injectable()
export class ConProjectPlugin implements ExtensionPlugin<ConProjectExtensions> {
  readonly industry = 'CONSTRUCTION';

  async validateExtensions(data: unknown): Promise<ConProjectExtensions> {
    try {
      return await conProjectExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Construction Project Extensions',
        errors: error.errors,
      });
    }
  }
}
