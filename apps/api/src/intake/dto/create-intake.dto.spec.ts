import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateIntakeDto } from './create-intake.dto';

async function validateDto(payload: Record<string, unknown>) {
  const dto = plainToInstance(CreateIntakeDto, payload);
  return validate(dto);
}

describe('CreateIntakeDto', () => {
  it('accepts a complete, valid intake submission', async () => {
    const errors = await validateDto({
      hospitalId: 'muhimbili',
      registrationNumber: 'MNH-0001',
      ward: 'OPD',
      complaint: 'Maumivu ya kichwa',
      bodyRegion: 'HEAD',
    });
    expect(errors).toHaveLength(0);
  });

  it('rejects a body region outside the known set', async () => {
    const errors = await validateDto({
      hospitalId: 'muhimbili',
      registrationNumber: 'MNH-0001',
      ward: 'OPD',
      complaint: 'Maumivu ya kichwa',
      bodyRegion: 'NOT_A_REGION',
    });
    expect(errors.some((e) => e.property === 'bodyRegion')).toBe(true);
  });

  it('rejects a missing complaint', async () => {
    const errors = await validateDto({
      hospitalId: 'muhimbili',
      registrationNumber: 'MNH-0001',
      ward: 'OPD',
      bodyRegion: 'HEAD',
    });
    expect(errors.some((e) => e.property === 'complaint')).toBe(true);
  });

  it('rejects a hospital id outside the known set', async () => {
    const errors = await validateDto({
      hospitalId: 'some-other-hospital',
      registrationNumber: 'MNH-0001',
      ward: 'OPD',
      complaint: 'Maumivu ya kichwa',
      bodyRegion: 'HEAD',
    });
    expect(errors.some((e) => e.property === 'hospitalId')).toBe(true);
  });
});
