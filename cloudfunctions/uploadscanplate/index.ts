// 云函数入口文件
//const cloud = require('wx-server-sdk');
import * as cloud from 'wx-server-sdk';
import {scanPlate, scanPlateFromFile } from "./licensePlate";

cloud.init()
let db = cloud.database();



// 云函数入口函数
export async function main(event, context) {
    //const wxContext = cloud.getWXContext();

    const fileData = event.fileData;
    const fileExt = event.fileExt;
    const warrantyID = event.warrantyID;

    let scanTask = scanPlate(fileData);

    let uploadTask = cloud.uploadFile({
        cloudPath: `warranty/${warrantyID}/licensePlate${fileExt}`,
        fileContent: Buffer.from(fileData,"base64")
    }).then((res)=>{
        return Promise.all([Promise.resolve(res.fileID),
        db.collection("warranty").doc(warrantyID).update({
            data: {
                plateImageFileID: res.fileID
            }
        })]);
    });

    let p = await Promise.all([scanTask, uploadTask]);
    let scanTaskResult = p[0];
    let uploadTaskResult = p[1];

    if(scanTaskResult.words_result) {
        return {
            fileID: uploadTaskResult[0],
            number: scanTaskResult.words_result.number,
            probability: scanTaskResult.words_result.probability[0],
            error_code: null,
            error_msg: null
        }
    } else {
        return {
            error_msg: scanTaskResult.error_msg,
            error_code: scanTaskResult.error_code
        }
    }

    

    // return {
    //     event,
    //     openid: wxContext.OPENID,
    //     appid: wxContext.APPID,
    //     unionid: wxContext.UNIONID,
    // }
}