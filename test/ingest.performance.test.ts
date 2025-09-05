import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { performance } from 'node:perf_hooks';
import { XMLParser } from 'fast-xml-parser';
import { CurrencyCodeRecord } from '../src/types';
import { 
  XmlEntry, 
  XmlData, 
  ingestEntry, 
  indexByCode, 
  compareCurrencyCode, 
  ingestEntries, 
  ingestPublishDate 
} from '../scripts/iso-4217/ingest';

// Extend String prototype for toTitleCase (same as in ingest.ts)
declare global {
  interface String {
    toTitleCase(): string;
  }
}

// Import and use the actual to-title-case package
require('@gouch/to-title-case');

describe('Ingest Performance Tests', () => {
  let xmlData: Buffer;
  let parser: XMLParser;

  beforeAll(() => {
    const inputPath = path.join(__dirname, '../resources/iso-4217/list-one.xml');
    xmlData = fs.readFileSync(inputPath);
    parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false,
      parseTagValue: false,
      trimValues: true,
    });
  });

  it('should parse XML within acceptable time limits', () => {
    const startTime = performance.now();
    
    const result: XmlData = parser.parse(xmlData.toString());
    
    const endTime = performance.now();
    const parseTime = endTime - startTime;
    
    expect(parseTime).toBeLessThan(100); // Should parse in less than 100ms
    expect(result.ISO_4217).toBeDefined();
    expect(result.ISO_4217.CcyTbl.CcyNtry.length).toBeGreaterThan(0);
  });

  it('should process all entries within acceptable time limits', () => {
    const result: XmlData = parser.parse(xmlData.toString());
    
    const startTime = performance.now();
    
    const currencies = ingestEntries(result);
    
    const endTime = performance.now();
    const processTime = endTime - startTime;
    
    expect(processTime).toBeLessThan(50); // Should process in less than 50ms
    expect(currencies.length).toBeGreaterThan(170); // Should have many currencies
  });

  it('should complete full ingest pipeline within acceptable time limits', () => {
    const startTime = performance.now();
    
    const result: XmlData = parser.parse(xmlData.toString());
    const publishDate = ingestPublishDate(result);
    const currencies = ingestEntries(result);
    
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    expect(totalTime).toBeLessThan(150); // Full pipeline should complete in less than 150ms
    expect(publishDate).toBeDefined();
    expect(currencies.length).toBeGreaterThan(170);
  });

  it('should handle large datasets efficiently', () => {
    // Test with multiple iterations to simulate larger datasets
    const iterations = 10;
    const startTime = performance.now();
    
    for (let i = 0; i < iterations; i++) {
      const result: XmlData = parser.parse(xmlData.toString());
      const currencies = ingestEntries(result);
      expect(currencies.length).toBeGreaterThan(170);
    }
    
    const endTime = performance.now();
    const avgTimePerIteration = (endTime - startTime) / iterations;
    
    expect(avgTimePerIteration).toBeLessThan(100); // Average time per iteration should be reasonable
  });

  it('should maintain data integrity under performance load', () => {
    const iterations = 5;
    const results: CurrencyCodeRecord[][] = [];
    
    for (let i = 0; i < iterations; i++) {
      const result: XmlData = parser.parse(xmlData.toString());
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
