import { describe, it, expect } from 'vitest';
import { formatPrice, formatDate, initials, effectivePrice } from './format';

describe('formatPrice', () => {
  it('formats a number as TND with 2 decimals', () => {
    expect(formatPrice(5)).toBe('5.00 TND');
  });
  it('parses numeric strings', () => {
    expect(formatPrice('6.5')).toBe('6.50 TND');
  });
  it('treats non-numeric input as zero', () => {
    expect(formatPrice('abc')).toBe('0.00 TND');
  });
});

describe('initials', () => {
  it('builds uppercase initials from first + last name', () => {
    expect(initials('Sami', 'Client')).toBe('SC');
  });
  it('falls back to "?" when empty', () => {
    expect(initials()).toBe('?');
  });
});

describe('effectivePrice', () => {
  it('uses the discounted price when present', () => {
    expect(effectivePrice({ price: '6.5', discountedPrice: 5.2 })).toBe(5.2);
  });
  it('falls back to the base price (string)', () => {
    expect(effectivePrice({ price: '6.5' })).toBe(6.5);
  });
  it('falls back to the base price (number)', () => {
    expect(effectivePrice({ price: 4 })).toBe(4);
  });
});

describe('formatDate', () => {
  it('renders the year', () => {
    expect(formatDate('2026-06-19')).toMatch(/2026/);
  });
});
