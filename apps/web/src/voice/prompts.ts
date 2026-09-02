/** Swahili guidance captions shown at the top of every intake screen. */
export type VoicePromptKey =
  | 'welcome'
  | 'consent'
  | 'registrationNumber'
  | 'wardSelection'
  | 'complaint'
  | 'bodyRegion'
  | 'confirmation';

export const VOICE_PROMPTS: Record<VoicePromptKey, string> = {
  welcome: 'Karibu ZaHeri. Tutakusaidia hatua kwa hatua.',
  consent: 'Tunahitaji ruhusa yako kutumia taarifa zako na mahali ulipo.',
  registrationNumber: 'Tafadhali weka namba yako ya usajili wa hospitali.',
  wardSelection: 'Chagua wodi uliyopo.',
  complaint: 'Una shida gani?',
  bodyRegion: 'Gusa sehemu ya mwili inayokusumbua.',
  confirmation: 'Asante. Taarifa zako zimetumwa kwa daktari.',
};
