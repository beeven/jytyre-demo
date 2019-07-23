"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const baidu_aip_sdk_1 = require("baidu-aip-sdk");
const fs = __importStar(require("fs"));
const app_id = "16802498";
const api_key = "Gy3snWWGXxAYn7AToT1GkkUt";
const secret_key = "idG3M6LjlgYG3822lCfehh7Gxv6DmlQc";
// HttpClient.setRequestOptions({ timeout: 5000 });
// HttpClient.setRequestInterceptor((requestOptions) => {
//     console.log(requestOptions);
//     requestOptions.timeout = 5000;
//     return requestOptions;
// });
const aipClient = new baidu_aip_sdk_1.ocr(app_id, api_key, secret_key);
function scanPlate(imageData, multiple = false) {
    console.log("calling scanPlate:", imageData);
    return aipClient.licensePlate(imageData, multiple.toString());
}
exports.scanPlate = scanPlate;
function scanPlateFromFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                return reject(err);
            }
            aipClient.licensePlate(data.toString('base64'))
                .then(ret => {
                resolve(ret);
            })
                .catch(ex => {
                reject(ex);
            });
        });
    });
}
exports.scanPlateFromFile = scanPlateFromFile;
