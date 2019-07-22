// 云函数入口文件
//const cloud = require('wx-server-sdk');
import * as cloud from 'wx-server-sdk';
import { ocr } from "baidu-aip-sdk";

cloud.init()

const app_id = "16802498";
const api_key = "Gy3snWWGXxAYn7AToT1GkkUt";
const secret_key = "idG3M6LjlgYG3822lCfehh7Gxv6DmlQc";

const AipOcrClient = ocr;


// 云函数入口函数
exports.main = async (event, context) => {
    const wxContext = cloud.getWXContext()

    console.log(event);




    return {
        event,
        openid: wxContext.OPENID,
        appid: wxContext.APPID,
        unionid: wxContext.UNIONID,
    }
}