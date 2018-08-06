import test from "ava";
import recognize from "./dist/index";

test((t) => {
    return recognize("https://developer.xamarin.com/samples/monotouch/QRchestra/Screenshots/xamarin-barcode.png")
        .then((result) => {
            t.deepEqual(result, [{
                rawText: 'www.xamarin.com',
                rawBytes:
                    '40 f7 77 77 72 e7 86 16   d6 17 26 96 e2 e6 36 f6\nd0 ec 11 ',
                barcodeFormat: 'QR_CODE',
                parsedResultType: 'URI',
                parsedResult: 'http://www.xamarin.com'
            }]);
        })
        .catch((err) => t.fail(err));
});

test((t) => {
    return recognize("https://s.gravatar.com/avatar/1406b07c2e1e64ca84b9fa4404f7e7ac?size=100&default=retro")
        .then((result) => {
            t.deepEqual(result, []);
        })
        .catch((err) => t.fail(err));
});

test((t) => {
    return recognize("123")
        .then((result) => {
            t.fail();
        })
        .catch((err) => t.pass(err));
});
