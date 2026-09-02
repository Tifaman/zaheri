import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function makeContext(user?: { role: string }): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

function makeGuard(requiredRoles: string[] | undefined) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('allows the request when the route requires no roles', () => {
    expect(makeGuard(undefined).canActivate(makeContext())).toBe(true);
  });

  it('allows a user whose role is in the required list', () => {
    const guard = makeGuard(['CLINICIAN', 'ADMIN']);
    expect(guard.canActivate(makeContext({ role: 'CLINICIAN' }))).toBe(true);
  });

  it('denies a user whose role is not in the required list', () => {
    const guard = makeGuard(['CLINICIAN', 'ADMIN']);
    expect(guard.canActivate(makeContext({ role: 'PATIENT' }))).toBe(false);
  });

  it('denies when there is no authenticated user', () => {
    const guard = makeGuard(['CLINICIAN']);
    expect(guard.canActivate(makeContext(undefined))).toBe(false);
  });
});
