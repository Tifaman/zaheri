import { VOICE_PROMPTS, VoicePromptKey } from './prompts';

interface VoicePromptProps {
  promptKey: VoicePromptKey;
}

/** On-screen Swahili caption for the current step. No avatar, no audio. */
export function VoicePrompt({ promptKey }: VoicePromptProps) {
  return <p className="text-xl font-semibold leading-snug text-slate-900">{VOICE_PROMPTS[promptKey]}</p>;
}
