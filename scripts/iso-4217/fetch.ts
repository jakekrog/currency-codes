import * as fs from 'node:fs';
import axios from 'axios';

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
  const url = 'https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml';
  const filePath = 'resources/iso-4217/list-one.xml';

  try {
    await download(url, filePath);
    console.log(`Downloaded ${url} to ${filePath}`);
  } catch (e) {
    console.error(`Error downloading ${url}`);
    console.error(e);
    process.exit(1);
  }
}

downloadIso();
