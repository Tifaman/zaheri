import { ArrayNotEmpty, IsArray, IsString, MaxLength } from 'class-validator';
import { CreateReceiptRequest } from '@zaheri/types';

export class CreateReceiptDto implements CreateReceiptRequest {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  medicationNames!: string[];
}
