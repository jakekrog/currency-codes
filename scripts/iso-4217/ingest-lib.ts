import { CurrencyCodeRecord } from '../../src/types';

declare global {
  interface String {
    toTitleCase(): string;
  }
}

require('@gouch/to-title-case');

interface XmlEntry {
  Ccy?: string;
  CcyNbr?: string;
  CcyMnrUnts?: string;
  CcyNm?: string | { '#text': string; '@_IsFund'?: string };
  CtryNm?: string;
}

export interface XmlData {
  ISO_4217: {
    '@_Pblshd': string;
    CcyTbl: {
      CcyNtry: XmlEntry[];
    };
  };
}

export interface CombinedData {
  publishDate: string;
  currencies: CurrencyCodeRecord[];
}

function ingestEntry(entry: XmlEntry): CurrencyCodeRecord {
  const currencyName = typeof entry.CcyNm === 'string'
    ? entry.CcyNm
    : entry.CcyNm?.['#text'] || '';

  return {
    code: entry.Ccy || '',
    number: entry.CcyNbr || '',
    digits: (entry.CcyMnrUnts && parseInt(entry.CcyMnrUnts)) || 0,
    currency: currencyName,
    countries: (entry.CtryNm && [entry.CtryNm.toLowerCase().toTitleCase()]) || [],
  };
}

function indexByCode(index: Record<string, CurrencyCodeRecord>, c: CurrencyCodeRecord): Record<string, CurrencyCodeRecord> {
  if (!index[c.code]) {
    index[c.code] = c;
  } else {
    index[c.code].countries = index[c.code].countries.concat(c.countries);
  }
  return index;
}

function compareCurrencyCode(a: CurrencyCodeRecord, b: CurrencyCodeRecord): number {
  return a.code.localeCompare(b.code);
}

export function ingestEntries(data: XmlData): CurrencyCodeRecord[] {
  const currenciesByCode = data.ISO_4217.CcyTbl.CcyNtry
    .map(ingestEntry)
    .reduce(indexByCode, {});

  const currencies = Object.values(currenciesByCode).filter((c: CurrencyCodeRecord) => !!c.code);
  currencies.sort(compareCurrencyCode);

  return currencies;
}

export function ingestPublishDate(data: XmlData): string {
  return data.ISO_4217['@_Pblshd'];
}
