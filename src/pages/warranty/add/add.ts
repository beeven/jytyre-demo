
import {warrantyService, ApprovalStatus} from '../warranty.service';

import * as moment from "moment-mini-ts";
import { WarrantyPage } from '../warranty';

interface AddWarrantyPageData {
    warrantyID: string;
    shopName: string | null;
    shopAddress : string | null;
    shopLocation?: {
        longtitude: number,
        latitude: number
    }
    datePurchased: string;
    plateNumber: string;
    plateImageFileID: string;
    plateImageFilePath: string;
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
        
        let pages = getCurrentPages();
        console.log(pages);
        let page = pages[pages.length-2] as unknown as WarrantyPage;
        await page.onItemAdded(this.data.warrantyID, {
            plateNumber: this.data.plateNumber || '车牌未填写',
            id: this.data.warrantyID,
            approvalStatus: ApprovalStatus.drafting,
            description: '',
            thumbnail: ""
        });


        console.log(this.data);
        await warrantyService.updateWarrantyItem(this.data.warrantyID, {
            plateNumber: this.data.plateNumber
        }, this.data.shopLocation ?  {
            longtitude:+this.data.shopLocation!.longtitude,
            latitude:+this.data.shopLocation!.latitude
        }: undefined);
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
                        latitude: +res.latitude,
                        longtitude: +res.longitude
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

        console.log(imgFile.size);

        this.setData({
            plateImageFileID: "123",
            plateImageFilePath: imgFile.path
        })

    
        try {
            wx.showLoading({
                title: '数据上传中',
                mask: true
            });
            let ret = await warrantyService.uploadPlateImage(this.data.warrantyID, imgFile.path);
            wx.hideLoading();
            this.setData({
                plateNumber: ret.plateNumber,
                plateImageFileID: ret.fileID
            });
        } catch(err) {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: '照片识别失败，请按照要求重新上传',
                showCancel: false
            });   
        } 


    },

    previewImage(e: event.Touch) {
        console.log(e);
        let name = e.currentTarget.dataset["name"];
        console.log(e.currentTarget);
        let url;
        switch(name) {
            case "shop":
                url = "../../../assets/shopFront.jpg";
                break;
            case "tyre-model":
                url = "../../../assets/tyre-model.jpg";
                break;
            case "tyre-installation":
                url = "../../../assets/tyre-installation.jpg"
                break;
        }
        wx.previewImage({
            urls:[url],
            current: url
        });

    },

    chooseImage(e:event.Touch) {
        console.log(e);
    }
})
