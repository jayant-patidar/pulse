import { PartialType } from '@nestjs/mapped-types';
import { CreateCoiDto } from './create-coi.dto';

export class UpdateCoiDto extends PartialType(CreateCoiDto) {}
