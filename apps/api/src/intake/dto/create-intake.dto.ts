import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  BODY_REGION_CODES,
  BodyRegionCode,
  CreateIntakeRequest,
  HOSPITAL_IDS,
  HospitalId,
} from '@zaheri/types';

export class CreateIntakeDto implements CreateIntakeRequest {
  @IsIn(HOSPITAL_IDS)
  hospitalId!: HospitalId;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  registrationNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  ward!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  complaint!: string;

  @IsIn(BODY_REGION_CODES)
  bodyRegion!: BodyRegionCode;
}
