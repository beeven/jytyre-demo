"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// 云函数入口文件
//const cloud = require('wx-server-sdk');
const cloud = __importStar(require("wx-server-sdk"));
const licensePlate_1 = require("./licensePlate");
cloud.init();
// 云函数入口函数
function main(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        //const wxContext = cloud.getWXContext()
        console.log(event);
        const fileID = event.fileID;
        const res = yield cloud.downloadFile({
            fileID: fileID
        });
        console.log(res);
        const buffer = res.fileContent;
        let imgData = buffer.toString("base64");
        console.log(imgData);
        let ret = yield licensePlate_1.scanPlate(imgData);
        if (ret.words_result) {
            return {
                number: ret.words_result.number,
                probability: ret.words_result.probability[0],
                error_code: null,
                error_msg: null
            };
        }
        else {
            return {
                error_msg: ret.error_msg,
                error_code: ret.error_code
            };
        }
        // return {
        //     event,
        //     openid: wxContext.OPENID,
        //     appid: wxContext.APPID,
        //     unionid: wxContext.UNIONID,
        // }
    });
}
exports.main = main;
