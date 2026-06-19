import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { Badge, StatusBadge } from './Badge';

afterEach(cleanup);

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>Hello</Badge>);
    expect(screen.getByText('Hello').textContent).toBe('Hello');
  });
});

describe('StatusBadge', () => {
  it('renders the order status label', () => {
    render(<StatusBadge status="ACCEPTED" />);
    expect(screen.getByText('ACCEPTED')).toBeTruthy();
  });
});
