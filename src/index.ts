import { CurrencyCodeRecord } from './types';
import iso4217Data from '../data/iso-4217/list-one.json';

const data: CurrencyCodeRecord[] = iso4217Data.currencies;
const publishDate: string = iso4217Data.publishDate;

export const code = (code: string): CurrencyCodeRecord | undefined => {
  code = code.toUpperCase();

  return data.find((c: CurrencyCodeRecord) => {
    return c.code === code;
  });
};

export const country = (country: string): CurrencyCodeRecord[] => {
  country = country.toLowerCase();

  return data.filter((c: CurrencyCodeRecord) => {
    return (c.countries.map(c => c.toLowerCase()) || []).indexOf(country) > -1;
  });
};

export const number = (number: string | number): CurrencyCodeRecord | undefined => {
  return data.find((c: CurrencyCodeRecord) => {
    return c.number === String(number);
  });
};

export const codes = (): string[] => {
  return data.map((c: CurrencyCodeRecord) => {
    return c.code;
  });
};

export const numbers = (): string[] => {
  const items = data.map((c: CurrencyCodeRecord) => {
    return c.number;
  });

  // handle cases where number is undefined (e.g. XFU and XBT)
  return items.filter((n: string) => {
    if (n) {
      return n;
    }
  });
};

export const countries = (): string[] => {
  const m = data
    .filter((c: CurrencyCodeRecord) => {
      return c.countries;
    })
    .map((c: CurrencyCodeRecord) => {
      return c.countries;
    });
  
  // Flatten the array and remove duplicates using Set
  const flattened = Array.prototype.concat.apply([], m);
  return [...new Set(flattened)];
};

export { publishDate, data };

// Re-export types
export type { CurrencyCodeRecord };