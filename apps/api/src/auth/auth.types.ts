import { UserRole } from '@zaheri/types';

/** Shape attached to `request.user` after JwtAuthGuard runs. */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}
