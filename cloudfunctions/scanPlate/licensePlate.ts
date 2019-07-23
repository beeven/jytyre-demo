import { ocr, HttpClient } from "baidu-aip-sdk";
import * as fs from "fs";

const app_id = "16802498";
const api_key = "Gy3snWWGXxAYn7AToT1GkkUt";
const secret_key = "idG3M6LjlgYG3822lCfehh7Gxv6DmlQc";



// HttpClient.setRequestOptions({ timeout: 5000 });
// HttpClient.setRequestInterceptor((requestOptions) => {
//     console.log(requestOptions);
//     requestOptions.timeout = 5000;
//     return requestOptions;
// });

const aipClient = new ocr(app_id, api_key, secret_key);

interface LicensePlateResult {
    log_id: number;
    error_code?: number;
    error_msg?: string;
    words_result?: {
        color: string;
        number: string;
        probability: number[],
        vertexes_location: any[];
    }
}

export function scanPlate(imageData: string, multiple: boolean = false): Promise<LicensePlateResult> {
    return aipClient.licensePlate({
        image: imageData,
        multi_detect: multiple.toString()
    })
}

export function scanPlateFromFile(path) {
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
    })
}