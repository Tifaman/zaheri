import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateLabOrderRequest } from '@zaheri/types';

export class CreateLabOrderDto implements CreateLabOrderRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  testName!: string;
}
