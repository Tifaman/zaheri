import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequest } from '@zaheri/types';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
