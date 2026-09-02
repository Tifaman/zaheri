import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NationalWelcomePage } from './NationalWelcomePage';

describe('NationalWelcomePage', () => {
  it('shows the hero image and the welcome line, and navigates to hospital selection', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<NationalWelcomePage />} />
          <Route path="/hospitals" element={<p>Hospitals page</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByAltText('Daktari na mgonjwa')).toHaveAttribute('src', '/docpat.jpg');
    // "Karibu" appears twice (wave text + button label) — check the
    // unambiguous words plus the button separately.
    expect(screen.getByText('Mfumo')).toBeInTheDocument();
    expect(screen.getByText('Taifa')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Karibu' }));

    expect(screen.getByText('Hospitals page')).toBeInTheDocument();
  });
});
