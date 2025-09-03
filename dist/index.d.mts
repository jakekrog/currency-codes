interface CurrencyCodeRecord {
    code: string;
    number: string;
    digits: number;
    currency: string;
    countries: string[];
}

declare const data: CurrencyCodeRecord[];
declare const publishDate: string;
declare const code: (code: string) => CurrencyCodeRecord | undefined;
declare const country: (country: string) => CurrencyCodeRecord[];
declare const number: (number: string | number) => CurrencyCodeRecord | undefined;
declare const codes: () => string[];
declare const numbers: () => string[];
declare const countries: () => string[];

export { type CurrencyCodeRecord, code, codes, countries, country, data, number, numbers, publishDate };
