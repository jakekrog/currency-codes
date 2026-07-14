import { config } from 'dotenv';

// Load local overrides without adding dotenv tips to script output.
config({ quiet: true });

export const ISO_4217_CONFIG = {
  url: process.env.ISO_4217_URL || 'https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml',
  xmlPath: process.env.ISO_4217_XML_PATH || 'resources/iso-4217/list-one.xml',
  jsonPath: process.env.ISO_4217_JSON_PATH || 'data/iso-4217/list-one.json',
} as const;
