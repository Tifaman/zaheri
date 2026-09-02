import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateLabReportRequest } from '@zaheri/types';

export class CreateLabReportDto implements CreateLabReportRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  resultSummary!: string;
}
