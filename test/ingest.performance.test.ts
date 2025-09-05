import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import * as xml2js from 'xml2js';
import { CurrencyCodeRecord } from '../src/types';

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

// Extend String prototype for toTitleCase (same as in ingest.ts)
declare global {
  interface String {
    toTitleCase(): string;
  }
}

// Mock the to-title-case module
String.prototype.toTitleCase = function(): string {
  return this.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

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

describe('Ingest Performance Tests', () => {
  let xmlData: Buffer;
  let parser: xml2js.Parser;

  beforeAll(() => {
    const inputPath = path.join(__dirname, '../resources/iso-4217/list-one.xml');
    xmlData = fs.readFileSync(inputPath);
    parser = new xml2js.Parser({
      explicitArray: false,  // turn off array wrappers around content
      explicitCharkey: true, // put all content under a key so its easier to parse when there are attributes
      mergeAttrs: true       // lift attributes up so they're easier to parse
    });
  });

  it('should parse XML within acceptable time limits', async () => {
    const startTime = performance.now();
    
    const result: XmlData = await parser.parseStringPromise(xmlData.toString());
    
    const endTime = performance.now();
    const parseTime = endTime - startTime;
    
    expect(parseTime).toBeLessThan(100); // Should parse in less than 100ms
    expect(result.ISO_4217).toBeDefined();
    expect(result.ISO_4217.CcyTbl.CcyNtry.length).toBeGreaterThan(0);
  });

  it('should process all entries within acceptable time limits', async () => {
    const result: XmlData = await parser.parseStringPromise(xmlData.toString());
    
    const startTime = performance.now();
    
    const currencies = ingestEntries(result);
    
    const endTime = performance.now();
    const processTime = endTime - startTime;
    
    expect(processTime).toBeLessThan(50); // Should process in less than 50ms
    expect(currencies.length).toBeGreaterThan(170); // Should have many currencies
  });

  it('should complete full ingest pipeline within acceptable time limits', async () => {
    const startTime = performance.now();
    
    const result: XmlData = await parser.parseStringPromise(xmlData.toString());
    const publishDate = ingestPublishDate(result);
    const currencies = ingestEntries(result);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(150); // Full pipeline should complete in less than 150ms
    expect(publishDate).toBeDefined();
    expect(currencies.length).toBeGreaterThan(170);
  });

  it('should handle large datasets efficiently', async () => {
    // Test with multiple iterations to simulate larger datasets
    const iterations = 10;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const result: XmlData = await parser.parseStringPromise(xmlData.toString());
      const currencies = ingestEntries(result);
      expect(currencies.length).toBeGreaterThan(170);
    }
    
    const endTime = performance.now();
    const avgTimePerIteration = (endTime - startTime) / iterations;
    
    expect(avgTimePerIteration).toBeLessThan(100); // Average time per iteration should be reasonable
  });

  it('should maintain data integrity under performance load', async () => {
    const iterations = 5;
    const results: CurrencyCodeRecord[][] = [];
    
    for (let i = 0; i < iterations; i++) {
      const result: XmlData = await parser.parseStringPromise(xmlData.toString());
      const currencies = ingestEntries(result);
      results.push(currencies);
    }
    
    // All iterations should produce identical results
    for (let i = 1; i < results.length; i++) {
      expect(results[i].length).toBe(results[0].length);
      expect(results[i][0]?.code).toBe(results[0][0]?.code);
      expect(results[i][results[i].length - 1]?.code).toBe(results[0][results[0].length - 1]?.code);
    }
  });
});
