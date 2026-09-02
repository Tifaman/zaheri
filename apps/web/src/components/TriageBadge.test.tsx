import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TriageBadge } from './TriageBadge';

describe('TriageBadge', () => {
  it('renders the RED tag with its bilingual label and a non-colour icon', () => {
    render(<TriageBadge tag="RED" />);
    expect(screen.getByText('Dharura / Urgent')).toBeInTheDocument();
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('renders the GREEN tag with its bilingual label and a distinct icon', () => {
    render(<TriageBadge tag="GREEN" />);
    expect(screen.getByText('Kawaida / Routine')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });
});
