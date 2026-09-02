import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@zaheri/types';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles; read by RolesGuard. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
