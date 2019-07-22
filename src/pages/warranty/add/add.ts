
import {warrantyService} from '../warranty.service';

import * as moment from "moment-mini-ts";

interface AddWarrantyPageData {
    shopName: string | null;
    shopAddress : string | null;
    shopLocation?: {
        latitude: string,
        longtitude: string
    }
    datePurchased: string;
    
}


Page({
    data: {
        shopName: null,
        shopAddress: null,
        datePurchased: moment().format("YYYY-MM-DD"),

    } as AddWarrantyPageData,

    onLoad() {

    },

    onDateChanged(e: event.Input) {
        console.log(e.detail.value)
        this.setData({
            datePurchased: e.detail.value
        })
    },

    onGetLocation() {
        wx.chooseLocation({
            success: res => {
                this.setData({
                    shopAddress: res.address,
                    shopLocation: {
                        latitude: res.latitude,
                        longtitude: res.longitude
                    },
                    shopName: res.name
                });
            },
            fail: err => {
                console.log(err);
                wx.showToast({
                    title: '获取定位失败',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },

    onScanPlate() {
        wx.chooseImage({
            
        })
    }
})


async function scanPlate() {
    let imgFile = await new Promise<wx.ImageFile>((resolve,reject)=>{
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                resolve(res.tempFiles[0])
            },
            fail: err => {
                reject(err);
            }
        })
    });

    await new Promise((resolve, reject)=>{

    });
}