import { useNavigate } from 'react-router-dom';

const WELCOME_WORDS = ['Karibu', 'Mfumo', 'wa', 'ZaHeri', 'wa', 'Taifa'];

/**
 * The very first screen: a zoom-out hero image, the national welcome line
 * animating in word-by-word (a "wave") before settling static, and a
 * button through to hospital selection. No avatar — same rule as the rest
 * of the patient UI, just a photo and text.
 */
export function NationalWelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white p-6 text-center">
      <img
        src="/docpat.jpg"
        alt="Daktari na mgonjwa"
        className="h-56 w-56 animate-zoom-out rounded-full object-cover shadow-lg sm:h-72 sm:w-72"
      />

      <h1 className="max-w-md text-3xl font-extrabold text-brand-dark sm:text-4xl">
        {WELCOME_WORDS.map((word, i) => (
          <span
            key={i}
            className="inline-block animate-wave-in opacity-0"
            style={{ animationDelay: `${900 + i * 140}ms` }}
          >
            {word}
            {i < WELCOME_WORDS.length - 1 ? ' ' : ''}
          </span>
        ))}
      </h1>

      <button
        type="button"
        onClick={() => navigate('/hospitals')}
        className="w-full max-w-xs rounded-xl bg-brand px-8 py-4 text-xl font-bold text-white shadow-md active:scale-[0.98]"
      >
        Karibu
      </button>
    </div>
  );
}
