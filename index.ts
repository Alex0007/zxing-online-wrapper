import * as fs from 'fs'
import * as url from 'url'
import * as cheerio from 'cheerio'
import { createRequestObservable, RequestOptions, Response } from 'request-observable'
import { chunk, fromPairs, camelCase } from 'lodash'

export interface ParseResult {
  rawText?: string
  rawBytes?: string
  barcodeFormat?: string
  parsedResultType?: string
  parsedResult: string | null
}

const commonRequestParams: RequestOptions = {
  url: 'https://zxing.org/w/decode',
  method: 'POST'
}

const parseHtml = (body: string) => {
  const $ = cheerio.load(body)
  const tdList = []

  $('#result td').each(function (index, elem) {
    let text = $(elem).text()
    if (index % 2 === 0) {
      text = camelCase(text)
    }
    tdList.push(text)
  })

  return fromPairs(chunk(tdList.length ? tdList : ['parsedResult', null], 2)) as ParseResult
}

/** 
 * Tries to recognize barcode from the image.
 * Image can be buffer, path or url
 */
const recognizeBarcode = (input: string | Buffer) => {
  console.log('input', input)

  let params

  if (Buffer.isBuffer(input)) {
    params = Object.assign(commonRequestParams, {
      formData: { f: input }
    })
  } else {
    if (typeof input === 'string') {
      if (url.parse(input).host) {
        params = Object.assign(commonRequestParams, {
          method: 'GET',
          qs: {
            u: input
          }
        })
      } else {
        params = Object.assign(commonRequestParams, {
          formData: { f: fs.createReadStream(input) }
        })
      }
    }
  }

  if (!params) {
    throw (new Error('Unsupported argument type provided'))
  }

  return createRequestObservable(params)
    .pluck('body')
    .map(parseHtml)
    .toPromise()
}

export default recognizeBarcode