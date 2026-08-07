import { PartialType } from '@nestjs/mapped-types';
import { CreateSafetyIncidentDto } from './create-safety-incident.dto';

export class UpdateSafetyIncidentDto extends PartialType(CreateSafetyIncidentDto) {}
