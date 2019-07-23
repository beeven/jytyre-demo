
import {warrantyService} from '../warranty.service';

import * as moment from "moment-mini-ts";

interface AddWarrantyPageData {
    warrantyID: string;
    shopName: string | null;
    shopAddress : string | null;
    shopLocation?: {
        latitude: string,
        longtitude: string
    }
    datePurchased: string;
    plateNumber: string;
    plateImageFileID: string;
}


Page({
    data: {
        shopName: null,
        shopAddress: null,
        datePurchased: moment().format("YYYY-MM-DD"),

    } as AddWarrantyPageData,

    onLoad(options) {
        let warrantyID = options["id"];
        this.setData({
            warrantyID: warrantyID
        });
    },

    async onUnload() {
        await warrantyService.updateWarrantyItem(this.data.warrantyID, {
            plate: this.data.plateNumber
        },  {
            longtitude: parseFloat(this.data.shopLocation!.longtitude),
            latitude: parseFloat(this.data.shopLocation!.latitude)
        });
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

    async onScanPlate() {
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
    
        let ret = await warrantyService.uploadPlateImage(this.data.warrantyID, imgFile.path);
        this.setData({
            plate: ret.plateNumber,
            plateImageFileID: ret.fileID
        });
    }
})
