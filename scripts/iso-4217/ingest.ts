import * as fs from 'node:fs';
import * as xml2js from 'xml2js';
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

interface XmlEntry {
  Ccy?: { _: string };
  CcyNbr?: { _: string };
  CcyMnrUnts?: { _: string };
  CcyNm?: { _: string };
  CtryNm?: { _: string };
}

interface XmlData {
  ISO_4217: {
    Pblshd: string;
    CcyTbl: {
      CcyNtry: XmlEntry[];
    };
  };
}

interface CombinedData {
  publishDate: string;
  currencies: CurrencyCodeRecord[];
}

function ingestEntry(entry: XmlEntry): CurrencyCodeRecord {
  return {
    code: entry.Ccy && entry.Ccy._ || '',
    number: entry.CcyNbr && entry.CcyNbr._ || '',
    digits: (entry.CcyMnrUnts && parseInt(entry.CcyMnrUnts._)) || 0,
    currency: entry.CcyNm && entry.CcyNm._ || '',
    countries: (entry.CtryNm && entry.CtryNm._ && [entry.CtryNm._.toLowerCase().toTitleCase()]) || []
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

function ingestEntries(data: XmlData): CurrencyCodeRecord[] {
  const currenciesByCode = data.ISO_4217.CcyTbl.CcyNtry
    .map(ingestEntry)
    .reduce(indexByCode, {});

  const currencies = Object.values(currenciesByCode).filter((c: CurrencyCodeRecord) => !!c.code);
  currencies.sort(compareCurrencyCode);

  return currencies;
}

function ingestPublishDate(data: XmlData): string {
  return data.ISO_4217.Pblshd;
}

function failOnError(err: Error | null): void {
  if (err) {
    console.error(err);
    process.exit(1);
  }
}

fs.readFile(input, (err: NodeJS.ErrnoException | null, data: Buffer) => {
  failOnError(err);

  xml2js.parseString(
    data,
    {
      explicitArray: false,  // turn off array wrappers around content
      explicitCharkey: true, // put all content under a key so its easier to parse when there are attributes
      mergeAttrs: true       // lift attributes up so they're easier to parse
    },
    (err: Error | null, result: XmlData) => {
      failOnError(err);

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
    }
  );
});
