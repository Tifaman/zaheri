export const USER_ROLES = ['PATIENT', 'CLINICIAN', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Roles allowed into the clinician-only doctor console. */
export const CONSOLE_ROLES = ['CLINICIAN', 'ADMIN'] as const satisfies readonly UserRole[];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  email: string;
  role: UserRole;
}
