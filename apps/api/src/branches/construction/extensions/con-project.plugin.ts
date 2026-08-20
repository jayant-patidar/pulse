import { BadRequestException, Injectable } from '@nestjs/common';
import { ConProjectExtensions, conProjectExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces';

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
