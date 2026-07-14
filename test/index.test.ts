import { describe, it, expect } from 'vitest';
import * as cc from '../dist/index.js';

describe('Currency Codes', () => {
  it('should find EUR currency with correct number of countries', () => {
    const eur = cc.code('EUR');
    expect(eur).toBeDefined();
    expect(eur?.countries.length).toBe(36);
  });

  it('should find IDR currency with correct digits', () => {
    const idr = cc.code('IDR');
    expect(idr).toBeDefined();
    expect(idr?.digits).toBe(2);
  });

  it('should find currency by number as string', () => {
    const currency = cc.number('967');
    expect(currency).toBeDefined();
    expect(currency?.currency).toBe('Zambian Kwacha');
  });

  it('should find currency by number as number', () => {
    const currency = cc.number(967);
    expect(currency).toBeDefined();
    expect(currency?.currency).toBe('Zambian Kwacha');
  });

  it('should find currencies by country name (case sensitive)', () => {
    const currencies = cc.country('Colombia');
    expect(currencies.length).toBe(2);
  });

  it('should find currencies by country name (case insensitive)', () => {
    const currencies = cc.country('colombia');
    expect(currencies.length).toBe(2);
  });

  it('should return all currency codes', () => {
    const codes = cc.codes();
    expect(codes.length).toBe(179);
  });

  it('should return all countries', () => {
    const countries = cc.countries();
    expect(countries.length).toBe(261);
  });

  it('should return all currency numbers', () => {
    const numbers = cc.numbers();
    expect(numbers.length).toBe(179);
  });

  it('should return numbers in correct order', () => {
    const numbers = cc.numbers();
    expect(numbers[0]).toBe('784');
  });

  it('should have correct data length', () => {
    expect(cc.data.length).toBe(179);
  });
});
