import { useMutation } from '@tanstack/react-query';
import { CreateIntakeRequest } from '@zaheri/types';
import { submitIntake } from '../lib/api';

export function useSubmitIntake() {
  return useMutation({
    mutationFn: (payload: CreateIntakeRequest) => submitIntake(payload),
  });
}
