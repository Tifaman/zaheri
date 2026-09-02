import { useState } from 'react';
import { INITIAL_INTAKE_STATE, IntakeStep } from './intakeState';
import { useSubmitIntake } from './useSubmitIntake';
import { ApiError } from '../lib/api';
import { saveLastIntakeId } from '../status/lastIntake';
import { getSelectedHospitalId } from '../hospitals/selectedHospital';
import { getHospitalName } from '../hospitals/catalog';
import { WelcomeConsentStep } from './steps/WelcomeConsentStep';
import { RegistrationNumberStep } from './steps/RegistrationNumberStep';
import { WardSelectionStep } from './steps/WardSelectionStep';
import { ComplaintStep } from './steps/ComplaintStep';
import { BodyRegionStep } from './steps/BodyRegionStep';
import { ConfirmationStep } from './steps/ConfirmationStep';

const STEP_ORDER: IntakeStep[] = [
  'WELCOME',
  'REGISTRATION',
  'WARD',
  'COMPLAINT',
  'BODY_REGION',
  'CONFIRM',
];

export function IntakeFlow() {
  const [step, setStep] = useState<IntakeStep>('WELCOME');
  const [form, setForm] = useState(INITIAL_INTAKE_STATE);
  const [hospitalId] = useState(() => getSelectedHospitalId());
  const hospitalName = getHospitalName(hospitalId);
  const submitIntake = useSubmitIntake();

  const goNext = () => {
    const idx = STEP_ORDER.indexOf(step);
    setStep(STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)] ?? step);
  };
  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    setStep(STEP_ORDER[Math.max(idx - 1, 0)] ?? step);
  };
  const restart = () => {
    submitIntake.reset();
    setForm(INITIAL_INTAKE_STATE);
    setStep('WELCOME');
  };

  switch (step) {
    case 'WELCOME':
      return (
        <WelcomeConsentStep
          consentGiven={form.consentGiven}
          hospitalName={hospitalName}
          onChangeConsent={(consentGiven) => setForm((f) => ({ ...f, consentGiven }))}
          onNext={goNext}
        />
      );
    case 'REGISTRATION':
      return (
        <RegistrationNumberStep
          value={form.registrationNumber}
          hospitalName={hospitalName}
          onChange={(registrationNumber) => setForm((f) => ({ ...f, registrationNumber }))}
          onNext={goNext}
          onBack={goBack}
        />
      );
    case 'WARD':
      return (
        <WardSelectionStep
          value={form.ward}
          onChange={(ward) => setForm((f) => ({ ...f, ward }))}
          onNext={goNext}
          onBack={goBack}
        />
      );
    case 'COMPLAINT':
      return (
        <ComplaintStep
          value={form.complaint}
          onChange={(complaint) => setForm((f) => ({ ...f, complaint }))}
          onNext={goNext}
          onBack={goBack}
        />
      );
    case 'BODY_REGION':
      return (
        <BodyRegionStep
          value={form.bodyRegion}
          onChange={(bodyRegion) => setForm((f) => ({ ...f, bodyRegion }))}
          onNext={goNext}
          onBack={goBack}
        />
      );
    case 'CONFIRM':
      return (
        <ConfirmationStep
          form={form}
          isPending={submitIntake.isPending}
          isError={submitIntake.isError}
          errorMessage={
            submitIntake.error instanceof ApiError ? submitIntake.error.message : undefined
          }
          result={submitIntake.data}
          onSubmit={() => {
            if (!form.bodyRegion) return;
            submitIntake.mutate(
              {
                hospitalId,
                registrationNumber: form.registrationNumber,
                ward: form.ward,
                complaint: form.complaint,
                bodyRegion: form.bodyRegion,
              },
              { onSuccess: (data) => saveLastIntakeId(data.id) },
            );
          }}
          onBack={goBack}
          onRestart={restart}
        />
      );
  }
}
