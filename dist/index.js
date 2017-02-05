"use strict";
const fs = require("fs");
const url = require("url");
const cheerio = require("cheerio");
const request_observable_1 = require("request-observable");
const lodash_1 = require("lodash");
const commonRequestParams = {
    url: 'https://zxing.org/w/decode',
    method: 'POST'
};
const parseHtml = (body) => {
    const $ = cheerio.load(body);
    const tdList = [];
    $('#result td').each(function (index, elem) {
        let text = $(elem).text();
        if (index % 2 === 0) {
            text = lodash_1.camelCase(text);
        }
        tdList.push(text);
    });
    return lodash_1.fromPairs(lodash_1.chunk(tdList.length ? tdList : ['parsedResult', null], 2));
};
/**
 * Tries to recognize barcode from the image.
 * Image can be buffer, path or url
 */
const recognizeBarcode = (input) => {
    console.log('input', input);
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
