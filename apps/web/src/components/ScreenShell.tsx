import { ReactNode } from 'react';
import { VoicePromptKey } from '../voice/prompts';
import { VoicePrompt } from '../voice/VoicePrompt';

interface ScreenShellProps {
  promptKey: VoicePromptKey;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared layout for every intake screen: high-contrast, large touch targets,
 * a Swahili caption up top, screen content in the middle, and a footer for
 * step navigation. No avatar, no audio — guidance is this touch UI only.
 *
 * Content is capped at max-w-xl and centred so phones get the full-width,
 * large-touch-target experience this was designed for, while tablets and
 * desktops don't stretch the same layout edge to edge.
 */
export function ScreenShell({ promptKey, children, footer }: ScreenShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="border-b-4 border-brand bg-brand/5 p-4">
        <div className="mx-auto w-full max-w-xl">
          <VoicePrompt promptKey={promptKey} />
        </div>
      </header>
      <main className="flex-1 p-4">
        <div className="mx-auto w-full max-w-xl">{children}</div>
      </main>
      {footer ? (
        <footer className="border-t p-4">
          <div className="mx-auto w-full max-w-xl">{footer}</div>
        </footer>
      ) : null}
    </div>
  );
}
