import * as fs from 'node:fs';
import axios from 'axios';
import { ISO_4217_CONFIG } from '../../config';

async function download(url: string, filePath: string): Promise<void> {
  const writer = fs.createWriteStream(filePath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function downloadIso(): Promise<void> {
  const { url, xmlPath } = ISO_4217_CONFIG;

  try {
    await download(url, xmlPath);
    console.log(`Downloaded ${url} to ${xmlPath}`);
  } catch (e) {
    console.error(`Error downloading ${url}`);
    console.error(e);
    process.exit(1);
  }
}

downloadIso();
