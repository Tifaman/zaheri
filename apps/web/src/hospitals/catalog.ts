// `import type` only — never import @zaheri/types' HOSPITAL_IDS/DEFAULT_HOSPITAL_ID
// as a runtime value here. A previous const-array export from that package
// (CONSOLE_ROLES) broke Rollup's CJS interop in production builds; type-only
// imports are erased at compile time and can't hit that problem, so this
// catalog is hand-maintained in the frontend instead (see AuthContext.tsx
// for the same workaround).
import type { HospitalId } from '@zaheri/types';

export interface HospitalInfo {
  id: HospitalId;
  name: string;
  /** Public asset path, served from apps/web/public/hospitals. */
  image: string;
}

export const HOSPITALS: HospitalInfo[] = [
  { id: 'muhimbili', name: 'Muhimbili National Hospital', image: '/hospitals/muhas.png' },
  { id: 'jkci', name: 'Jakaya Kikwete Cardiac Institute', image: '/hospitals/jkci.jpg' },
  { id: 'benjamin_mkapa', name: 'Benjamin Mkapa Hospital', image: '/hospitals/benja.jpg' },
  {
    id: 'mwananyamala',
    name: 'Mwananyamala Referral Hospital',
    image: '/hospitals/mwananya.jpg',
  },
  { id: 'dodoma_referral', name: 'Dodoma Referral Hospital', image: '/hospitals/domru.jpg' },
  { id: 'mbeya_referral', name: 'Mbeya Referral Hospital', image: '/hospitals/rufaa.jpg' },
];

export const DEFAULT_HOSPITAL_ID: HospitalId = 'muhimbili';

export function getHospitalName(id: HospitalId): string {
  return HOSPITALS.find((h) => h.id === id)?.name ?? HOSPITALS[0]!.name;
}
