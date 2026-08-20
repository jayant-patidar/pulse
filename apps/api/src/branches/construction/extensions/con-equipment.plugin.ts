import { BadRequestException, Injectable } from '@nestjs/common';
import { ConEquipmentExtensions, conEquipmentExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces';

@Injectable()
export class ConEquipmentPlugin implements ExtensionPlugin<ConEquipmentExtensions> {
  readonly industry = 'CONSTRUCTION';

  async validateExtensions(data: unknown): Promise<ConEquipmentExtensions> {
    try {
      return await conEquipmentExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Construction Equipment Extensions',
        errors: error.errors,
      });
    }
  }
}
