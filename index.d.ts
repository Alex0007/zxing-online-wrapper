/// <reference types="node" />
export interface ParseResult {
    rawText?: string;
    rawBytes?: string;
    barcodeFormat?: string;
    parsedResultType?: string;
    parsedResult: string | null;
}
/**
 * Tries to recognize barcode from the image.
 * Image can be buffer, path or url
 */
declare const recognizeBarcode: (input: string | Buffer) => any;
export default recognizeBarcode;
