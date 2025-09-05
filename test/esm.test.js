// ESM test file
import('../dist/index.mjs').then(cc => {
  console.log('ESM import successful:', typeof cc.code);
  console.log('USD test:', cc.code('USD').currency);
  console.log('EUR test:', cc.code('EUR').currency);
  console.log('Number of currencies:', cc.codes().length);
}).catch(err => {
  console.error('ESM import failed:', err);
  process.exit(1);
});
