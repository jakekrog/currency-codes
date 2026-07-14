import * as fs from 'node:fs';
import { XMLParser } from 'fast-xml-parser';
import { ISO_4217_CONFIG } from '../../config';
import {
  CombinedData,
  XmlData,
  ingestEntries,
  ingestPublishDate,
} from './ingest-lib';

function failOnError(err: Error | null): void {
  if (err) {
    console.error(err);
    process.exit(1);
  }
}

export function runIngest({
  xmlPath,
  jsonPath,
}: typeof ISO_4217_CONFIG = ISO_4217_CONFIG): void {
  fs.readFile(xmlPath, (err: NodeJS.ErrnoException | null, data: Buffer) => {
    failOnError(err);

    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        parseAttributeValue: false,
        parseTagValue: false,
        trimValues: true,
      });

      const result: XmlData = parser.parse(data.toString());

      const publishDate = ingestPublishDate(result);
      const currencies = ingestEntries(result);

      const combinedData: CombinedData = {
        publishDate: publishDate,
        currencies: currencies,
      };

      const dataContent = JSON.stringify(combinedData, null, 2);

      fs.writeFile(jsonPath, dataContent, (err: NodeJS.ErrnoException | null) => {
        failOnError(err);

        console.log(`Ingested ${xmlPath} into ${jsonPath}`);
        console.log(`Included publish date: ${publishDate}`);
      });
    } catch (parseError) {
      console.error('Error parsing XML:', parseError);
      process.exit(1);
    }
  });
}

if (require.main === module) {
  runIngest();
}
