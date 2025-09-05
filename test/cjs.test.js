// CommonJS test file
const cc = require('../dist/index.js');

console.log('CommonJS require works:', typeof cc.code);
console.log('USD test:', cc.code('USD').currency);
console.log('EUR test:', cc.code('EUR').currency);
console.log('Number of currencies:', cc.codes().length);
