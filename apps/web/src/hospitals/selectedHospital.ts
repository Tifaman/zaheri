import type { HospitalId } from '@zaheri/types';
import { DEFAULT_HOSPITAL_ID } from './catalog';

const STORAGE_KEY = 'zaheri.selectedHospitalId';

export function saveSelectedHospitalId(id: HospitalId): void {
  localStorage.setItem(STORAGE_KEY, id);
}

export function getSelectedHospitalId(): HospitalId {
  return (localStorage.getItem(STORAGE_KEY) as HospitalId | null) ?? DEFAULT_HOSPITAL_ID;
}

export function hasSelectedHospital(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
