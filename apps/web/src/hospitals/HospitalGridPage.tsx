import { Link, useNavigate } from 'react-router-dom';
import { HOSPITALS } from './catalog';
import { saveSelectedHospitalId } from './selectedHospital';

/**
 * Hospital picker: everything from here on (registration step wording,
 * pharmacy receipt title, lab results) is scoped to whichever hospital the
 * patient taps here — see selectedHospital.ts.
 */
export function HospitalGridPage() {
  const navigate = useNavigate();

  const selectHospital = (id: (typeof HOSPITALS)[number]['id']) => {
    saveSelectedHospitalId(id);
    navigate('/intake');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <Link to="/" className="mb-4 inline-block text-sm font-semibold text-brand">
        ← Rudi
      </Link>
      <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">
        Chagua Hospitali Yako
      </h1>

      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
        {HOSPITALS.map((hospital, i) => (
          <button
            key={hospital.id}
            type="button"
            onClick={() => selectHospital(hospital.id)}
            className="flex animate-wave-in flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-white p-4 opacity-0 shadow-sm active:scale-[0.97]"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <img
              src={hospital.image}
              alt=""
              aria-hidden="true"
              className="h-20 w-20 rounded-full object-cover"
            />
            <span className="text-center text-sm font-semibold text-slate-900">
              {hospital.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
