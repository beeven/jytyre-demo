import { IMyApp } from "../../app";
import { formatTime } from '../../utils/util';

const app = getApp<IMyApp>();

export interface InsuranceListItem {
    insuranceID: string;
    plate: string;
    dateCreated: string
}

interface InsurancePageData {
    items: InsuranceListItem[]
}

Page({
    data: {
        items: [
            {"insuranceID": "11111", plate:"粤A DE077", dateCreated:"2019-07-03"},
            {"insuranceID": "2222", plate:"粤A DE078", dateCreated:"2019-07-03"}
        ]
    } as InsurancePageData,
    async onLoad() {
        let items = await loadInsuranceList();
        console.log(items);
        console.log(formatTime(new Date()).substr(0,10));
        this.setData({
            items: items
        })

    },


})



async function loadInsuranceList(){
    const db = wx.cloud.database();
    let items = await db.collection("insurance").where({
        _openid: app.globalData.openid
    }).get();
    let ret: InsuranceListItem[] = [];
    items.data.forEach(item => {
        ret.push({
            insuranceID: item._id!.toString(),
            plate: item["plate"],
            dateCreated: formatTime(new Date()).substr(0,10)
        })
    });
    return ret;
}

async function saveSampleInsurance(){
    const db = wx.cloud.database();
    let ret = await db.collection("insurance").add({
        data: {
            plate: "粤A DE"+ Math.round((Math.random() * 1000)).toString().padStart(3,'0'),
            dateCreated: new Date()
        } 
    });
    return ret._id;
}