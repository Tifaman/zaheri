import { IsIn } from 'class-validator';
import { Disposition, DISPOSITIONS, RouteCaseRequest } from '@zaheri/types';

export class RouteCaseDto implements RouteCaseRequest {
  @IsIn(DISPOSITIONS)
  disposition!: Disposition;
}
