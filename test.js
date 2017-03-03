import test from "ava";
import recognize from "./dist/index";

test((t) => {
    return recognize("https://scontent.xx.fbcdn.net/v/t35.0-12/17036550_1884997368448574_1878528253_o.jpg?_nc_ad=z-m&oh=c12bf09f39cd44fb7fb2e7c4a64594a4&oe=58BB981E")
        .then((result) => {
            t.deepEqual(result, [{
                rawText: "856238006006",
                rawBytes: "(Not applicable)",
                barcodeFormat: "UPC_A",
                parsedResultType: "PRODUCT",
                parsedResult: "856238006006",
            },
            {
                rawText: "15934109",
                rawBytes: "(Not applicable)",
                barcodeFormat: "UPC_E",
                parsedResultType: "PRODUCT",
                parsedResult: "15934109",
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
