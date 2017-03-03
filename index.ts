import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { camelCase, chunk, fromPairs, sortBy } from 'lodash';
import { createRequestObservable, RequestOptions, Response } from 'request-observable';
import * as url from 'url';

export interface ParseResult {
    rawText?: string;
    rawBytes?: string;
    barcodeFormat?: string;
    parsedResultType?: string;
    parsedResult: string | null;
}

const commonRequestParams: RequestOptions = {
    method: 'POST',
    url: 'https://zxing.org/w/decode'
};

const parseHtml = (body: string) => {
    const result: ParseResult[] = [];

    const $ = cheerio.load(body);

    $('#result').each((_, table) => {
        const tdList: string[] = [];

        $(table).find('td').each((index, elem) => {
            let text = $(elem).text();
            if (index % 2 === 0) {
                text = camelCase(text);
            }
            tdList.push(text);
        });

        const parsedResult = fromPairs(chunk(tdList.length ? tdList : ['parsedResult', null], 2)) as ParseResult;

        result.push(parsedResult);
    });

    return sortBy(result, (parsedResult) => -parsedResult.rawText.length);
};

/**
 * Tries to recognize barcode from the image.
 * Image can be buffer, path or url
 */
const recognizeBarcode = (input: string | Buffer) => {
    let params;

    if (Buffer.isBuffer(input)) {
        params = Object.assign(commonRequestParams, {
            formData: { f: input }
        });
    } else {
        if (typeof input === 'string') {
            if (url.parse(input).host) {
                params = Object.assign(commonRequestParams, {
                    method: 'GET',
                    qs: {
                        u: input
                    }
                });
            } else {
                params = Object.assign(commonRequestParams, {
                    formData: { f: fs.createReadStream(input) }
                });
            }
        }
    }

    if (!params) {
        throw (new Error('Unsupported argument type provided'));
    }

    return createRequestObservable(params)
        .pluck('body')
        .map(parseHtml)
        .toPromise();
};

export default recognizeBarcode;
