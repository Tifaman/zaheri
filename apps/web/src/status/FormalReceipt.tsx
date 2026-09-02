import { PharmacyReceiptDto } from '@zaheri/types';

interface FormalReceiptProps {
  hospitalName: string;
  registrationNumber: string;
  receipt: PharmacyReceiptDto;
}

/**
 * One official-looking document per visit — emblem watermark, hospital
 * header, patient/date details, every medication from this visit, and the
 * single QR code the pharmacy scans. Replaces the old one-QR-per-medication
 * design: a doctor issuing three medications now produces one receipt like
 * this, not three separate codes.
 */
export function FormalReceipt({ hospitalName, registrationNumber, receipt }: FormalReceiptProps) {
  const issuedDate = new Date(receipt.issuedAt).toLocaleDateString('sw-TZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-slate-300 bg-white p-6 print:border-black">
      <img
        src="/emblem.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto h-56 w-56 select-none object-contain opacity-10"
      />

      <div className="relative space-y-4">
        <div className="space-y-0.5 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Jamhuri ya Muungano wa Tanzania
          </p>
          <p className="text-lg font-bold text-slate-900">{hospitalName}</p>
          <p className="text-sm font-semibold text-brand-dark">Risiti Rasmi ya Dawa</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 border-y border-slate-200 py-3 text-sm">
          <div>
            <dt className="text-slate-500">Namba ya Usajili</dt>
            <dd className="font-semibold text-slate-900">{registrationNumber}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Tarehe</dt>
            <dd className="font-semibold text-slate-900">{issuedDate}</dd>
          </div>
        </dl>

        <div>
          <p className="text-sm font-semibold text-slate-700">Dawa Zilizotolewa</p>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-900">
            {receipt.medicationNames.map((med) => (
              <li key={med}>{med}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center gap-2 pt-2">
          <img
            src={receipt.qrCodeDataUrl}
            alt="Msimbo wa QR wa risiti — onyesha kwa mfamasia"
            className="h-40 w-40"
          />
          <p
            className={`text-sm font-bold ${
              receipt.status === 'REDEEMED' ? 'text-slate-500' : 'text-green-700'
            }`}
          >
            {receipt.status === 'REDEEMED' ? 'Risiti hii imeshatumika' : 'Onyesha hii kwa mfamasia'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="mx-auto block text-sm font-semibold text-brand print:hidden"
        >
          Chapisha Risiti
        </button>
      </div>
    </div>
  );
}
