import { BadRequestException, Injectable } from '@nestjs/common';
import { AgrEquipmentExtensions, agrEquipmentExtensionsSchema } from '@pulse/validators';
import { ExtensionPlugin } from '../../../common/interfaces';

@Injectable()
export class AgrEquipmentPlugin implements ExtensionPlugin<AgrEquipmentExtensions> {
  readonly industry = 'AGRICULTURE';

  async validateExtensions(data: unknown): Promise<AgrEquipmentExtensions> {
    try {
      return await agrEquipmentExtensionsSchema.parseAsync(data);
    } catch (error: any) {
      throw new BadRequestException({
        message: 'Invalid Agriculture Equipment Extensions',
        errors: error.errors,
      });
    }
  }
}
