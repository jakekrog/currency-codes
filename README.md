# currency-codes

A node.js module to list and work on currency codes based on the [ISO 4217](http://en.wikipedia.org/wiki/ISO_4217) standard.

	npm install currency-codes

## code('EUR')

``` js
var cc = require('currency-codes');
console.log(cc.code('EUR'));

/*
{
	code: 'EUR',
	number: 978,
	digits: 2,
	currency: 'Euro',
	countries: [
		'andorra', 'austria', 'belgium', 'cyprus', 'estonia', 'finland',
		'france', 'germany', 'greece', 'ireland', 'italy', 'kosovo',
		'luxembourg', 'malta', 'monaco', 'montenegro', 'netherlands',
		'portugal', 'san marino', 'slovakia', 'slovenia', 'spain',
		'vatican city' ]
}
*/
```

## number(967)

``` js
var cc = require('currency-codes');
console.log(cc.number(967));

/*
{
	code: 'ZMW',
	number: 967,
	digits: 2,
	currency: 'Zambian kwacha',
	countries: [ 'zambia' ] }
*/
```

## country('colombia')

``` js
var cc = require('currency-codes');
console.log(cc.country('colombia'));

/*
[
	{
		code: 'COP',
		number: 170,
		digits: 2,
		currency: 'Colombian peso',
		countries: [ 'colombia' ]
	}, {
		code: 'COU',
		number: 970,
		digits: 2,
		currency: 'Unidad de Valor Real',
		countries: [ 'colombia' ]
	}
]
*/
```

## codes()

``` js
var cc = require('currency-codes');
console.log(cc.codes());

/*
[
	'AED',
	'AFN',
	...
	'ZAR',
	'ZMW'
]
*/
```

## numbers()

``` js
var cc = require('currency-codes');
console.log(cc.numbers());

/*
[
	'784',
	'971',
	...
	'710',
	'967'
]
*/
```

## countries()

``` js
var cc = require('currency-codes');
console.log(cc.countries());

/*
[
	'united arab emirates',
	'afghanistan',
	...
]
*/
```

## data

``` js
var data = require('currency-codes/data');
console.log(data);

/*
[{
	code: 'AED',
	number: '784',
	digits: 2,
	currency: 'United Arab Emirates dirham',
	countries: ['united arab emirates']
}, {
	code: 'AFN',
	number: '971',
	digits: 2,
	currency: 'Afghan afghani',
	countries: ['afghanistan']
}, {
	...
*/
```

## publishDate

```js
var cc = require('currency-codes');

console.log(cc.publishDate);

/*
2024-06-25
*/
```

## Updating the data

Fetch the latest copy of ISO-4217 from the [maintainer](https://www.iso.org/iso-4217-currency-codes.html) and update this library's currency data file.

```bash
$ npm run iso

> currency-codes@2.1.0 iso
> npm run iso:fetch-xml && npm run iso:ingest-xml


> currency-codes@2.1.0 iso:fetch-xml
> node scripts/fetch-iso-4217-xml.js

Downloaded https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml to iso-4217-list-one.xml

> currency-codes@2.1.0 iso:ingest-xml
> node scripts/ingest-iso-4217-xml.js

Ingested iso-4217-list-one.xml into data.js
Wrote publish date to iso-4217-publish-date.js
```

Note: You may have to manually tweak the capitalization of some country's names.

## Development

### Configuration

The project uses environment variables for configuration. Copy `env.example` to `.env` and adjust the values as needed:

```bash
cp env.example .env
```

Available configuration options:
- `ISO_4217_URL`: URL to download the ISO 4217 XML data
- `ISO_4217_XML_PATH`: Local path to store the downloaded XML file
- `ISO_4217_JSON_PATH`: Local path to store the processed JSON file

### Updating Currency Data

To update the currency data from the official ISO 4217 source:

```bash
npm run iso
```

This will download the latest XML data and process it into the JSON format used by the library.

# License

MIT
