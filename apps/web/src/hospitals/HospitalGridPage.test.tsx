import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';
import { HospitalGridPage } from './HospitalGridPage';
import { getSelectedHospitalId } from './selectedHospital';

describe('HospitalGridPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows all six hospitals and saves the selection before navigating to intake', () => {
    render(
      <MemoryRouter initialEntries={['/hospitals']}>
        <Routes>
          <Route path="/hospitals" element={<HospitalGridPage />} />
          <Route path="/intake" element={<p>Intake page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Muhimbili National Hospital')).toBeInTheDocument();
    expect(screen.getByText('Jakaya Kikwete Cardiac Institute')).toBeInTheDocument();
    expect(screen.getByText('Benjamin Mkapa Hospital')).toBeInTheDocument();
    expect(screen.getByText('Mwananyamala Referral Hospital')).toBeInTheDocument();
    expect(screen.getByText('Dodoma Referral Hospital')).toBeInTheDocument();
    expect(screen.getByText('Mbeya Referral Hospital')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Mbeya Referral Hospital'));

    expect(getSelectedHospitalId()).toBe('mbeya_referral');
    expect(screen.getByText('Intake page')).toBeInTheDocument();
  });
});
