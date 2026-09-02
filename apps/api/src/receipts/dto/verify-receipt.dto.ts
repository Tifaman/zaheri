import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { VerifyReceiptRequest } from '@zaheri/types';

export class VerifyReceiptDto implements VerifyReceiptRequest {
  @IsUUID()
  id!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;
}
