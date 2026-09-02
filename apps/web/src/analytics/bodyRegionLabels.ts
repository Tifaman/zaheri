// `import type` only, for the same reason as hospitals/catalog.ts: importing
// @zaheri/types' BODY_REGION_CODES as a runtime value breaks Rollup's CJS
// interop in production builds. Hand-maintained label map instead.
import type { BodyRegionCode } from '@zaheri/types';

export const BODY_REGION_LABELS: Record<BodyRegionCode, string> = {
  HEAD: 'Kichwa',
  CHEST: 'Kifua',
  ABDOMEN: 'Tumbo',
  BACK: 'Mgongo',
  LEFT_ARM: 'Mkono wa kushoto',
  RIGHT_ARM: 'Mkono wa kulia',
  LEFT_LEG: 'Mguu wa kushoto',
  RIGHT_LEG: 'Mguu wa kulia',
  OTHER: 'Sehemu nyingine',
};
