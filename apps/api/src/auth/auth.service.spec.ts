import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('argon2');

describe('AuthService', () => {
  const mockUser = {
    id: 'user-1',
    email: 'doc@example.com',
    passwordHash: 'hashed',
    role: 'CLINICIAN' as const,
  };

  function makeService(userFound = true) {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(userFound ? mockUser : null) },
    } as unknown as PrismaService;
    const jwtService = {
      signAsync: jest.fn().mockResolvedValue('signed-jwt'),
    } as unknown as JwtService;
    return { service: new AuthService(prisma, jwtService), jwtService };
  }

  afterEach(() => jest.clearAllMocks());

  it('returns an access token for valid credentials', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    const { service, jwtService } = makeService();

    const result = await service.login('doc@example.com', 'correct-password');

    expect(result).toEqual({
      accessToken: 'signed-jwt',
      email: mockUser.email,
      role: mockUser.role,
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
    });
  });

  it('rejects an unknown email', async () => {
    const { service } = makeService(false);
    await expect(service.login('nobody@example.com', 'x')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a wrong password', async () => {
    (argon2.verify as jest.Mock).mockResolvedValue(false);
    const { service } = makeService();
    await expect(service.login('doc@example.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
