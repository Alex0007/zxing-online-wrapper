"use strict";
const cheerio = require("cheerio");
const fs = require("fs");
const lodash_1 = require("lodash");
const request_observable_1 = require("request-observable");
const url = require("url");
const commonRequestParams = {
    method: 'POST',
    url: 'https://zxing.org/w/decode'
};
const parseHtml = (body) => {
    const result = [];
    const $ = cheerio.load(body);
    $('#result').each((_, table) => {
        const tdList = [];
        $(table).find('td').each((index, elem) => {
            let text = $(elem).text();
            if (index % 2 === 0) {
                text = lodash_1.camelCase(text);
            }
            tdList.push(text);
        });
        const parsedResult = lodash_1.fromPairs(lodash_1.chunk(tdList.length ? tdList : ['parsedResult', null], 2));
        result.push(parsedResult);
    });
    return lodash_1.sortBy(result, (parsedResult) => -parsedResult.rawText.length);
};
/**
 * Tries to recognize barcode from the image.
 * Image can be buffer, path or url
 */
const recognizeBarcode = (input) => {
    let params;
    if (Buffer.isBuffer(input)) {
        params = Object.assign(commonRequestParams, {
            formData: { f: input }
        });
    }
    else {
        if (typeof input === 'string') {
            if (url.parse(input).host) {
                params = Object.assign(commonRequestParams, {
                    method: 'GET',
                    qs: {
                        u: input
                    }
                });
            }
            else {
                params = Object.assign(commonRequestParams, {
                    formData: { f: fs.createReadStream(input) }
                });
            }
        }
    }
    if (!params) {
        throw (new Error('Unsupported argument type provided'));
    }
    return request_observable_1.createRequestObservable(params)
        .pluck('body')
        .map(parseHtml)
        .toPromise();
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = recognizeBarcode;
