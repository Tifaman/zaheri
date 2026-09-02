import { IsISO8601, IsOptional } from 'class-validator';
import { AnalyticsRangeRequest } from '@zaheri/types';

export class AnalyticsRangeDto implements AnalyticsRangeRequest {
  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
