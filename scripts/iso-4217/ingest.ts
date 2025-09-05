import * as fs from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import {CurrencyCodeRecord} from '../../src/types';

// Extend String prototype for toTitleCase
declare global {
  interface String {
    toTitleCase(): string;
  }
}

require('@gouch/to-title-case');

const input = 'resources/iso-4217/list-one.xml';
const outputDataFile = 'data/iso-4217/list-one.json';

export interface XmlEntry {
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

export function ingestEntry(entry: XmlEntry): CurrencyCodeRecord {
  // Handle complex currency name objects (with attributes like @_IsFund)
  const currencyName = typeof entry.CcyNm === 'string' 
    ? entry.CcyNm 
    : entry.CcyNm?.['#text'] || '';

  return {
    code: entry.Ccy || '',
    number: entry.CcyNbr || '',
    digits: (entry.CcyMnrUnts && parseInt(entry.CcyMnrUnts)) || 0,
    currency: currencyName,
    countries: (entry.CtryNm && [entry.CtryNm.toLowerCase().toTitleCase()]) || []
  };
}

export function indexByCode(index: Record<string, CurrencyCodeRecord>, c: CurrencyCodeRecord): Record<string, CurrencyCodeRecord> {
  if (!index[c.code]) {
    index[c.code] = c;
  } else {
    index[c.code].countries = index[c.code].countries.concat(c.countries);
  }
  return index;
}

export function compareCurrencyCode(a: CurrencyCodeRecord, b: CurrencyCodeRecord): number {
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

function failOnError(err: Error | null): void {
  if (err) {
    console.error(err);
    process.exit(1);
  }
}

fs.readFile(input, (err: NodeJS.ErrnoException | null, data: Buffer) => {
  failOnError(err);

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false,
      parseTagValue: false,
      trimValues: false,
    });

    const result: XmlData = parser.parse(data.toString());

    const publishDate = ingestPublishDate(result);
    const currencies = ingestEntries(result);

    // Combine publish date and currencies into a single data structure
    const combinedData: CombinedData = {
      publishDate: publishDate,
      currencies: currencies
    };

    const dataContent = JSON.stringify(combinedData, null, 2);

    fs.writeFile(outputDataFile, dataContent, (err: NodeJS.ErrnoException | null) => {
      failOnError(err);

      console.log(`Ingested ${input} into ${outputDataFile}`);
      console.log(`Included publish date: ${publishDate}`);
    });
  } catch (parseError) {
    console.error('Error parsing XML:', parseError);
    process.exit(1);
  }
});
