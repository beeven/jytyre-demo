// 云函数入口文件
//const cloud = require('wx-server-sdk');
import * as cloud from 'wx-server-sdk';
import {scanPlate, scanPlateFromFile } from "./licensePlate";

cloud.init()



// 云函数入口函数
export async function main(event, context) {
    //const wxContext = cloud.getWXContext()
    const fileID = event.fileID;
    const res = await cloud.downloadFile({
        fileID: fileID
    });
    const buffer = res.fileContent;
    let imgData = buffer.toString("base64");
    let ret = await scanPlate(imgData);
    if(ret.words_result) {
        return {
            number: ret.words_result.number,
            probability: ret.words_result.probability[0],
            error_code: null,
            error_msg: null
        }
    } else {
        return {
            error_msg: ret.error_msg,
            error_code: ret.error_code
        }
    }

    

    // return {
    //     event,
    //     openid: wxContext.OPENID,
    //     appid: wxContext.APPID,
    //     unionid: wxContext.UNIONID,
    // }
}