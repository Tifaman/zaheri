import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary';

interface NavButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Large, high-contrast touch target shared by every intake screen. */
export function NavButton({ variant = 'primary', className = '', ...props }: NavButtonProps) {
  const base = 'w-full rounded-xl px-6 py-4 text-xl font-bold shadow-sm active:scale-[0.98]';
  const styles =
    variant === 'primary'
      ? 'bg-brand text-white disabled:bg-slate-300'
      : 'bg-slate-100 text-slate-900';
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
