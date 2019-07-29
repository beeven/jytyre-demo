
import { warrantyService, ApprovalStatus } from '../warranty.service';

import * as moment from "moment-mini-ts";
import { WarrantyPage } from '../warranty';
import { WarrantyListItem } from '../warrantListItem';

interface WarrantyDetailPageData {
    warrantyID: string;
    thumbnail: string;
    shopName: string;
    shopImageFileID: string;
    shopImageFileUrl: string;
    shopAddress: string;
    shopLocation?: {
        longtitude: number,
        latitude: number
    }
    datePurchased: string;
    endDate: string;
    approvalStatus: ApprovalStatus;
    plateNumber: string;
    plateImageFileID: string;
    plateImageFileUrl: string;
    tyreModelImageFileID: string;
    tyreModelImageFileUrl: string;
    tyreInstallationImageFileID: string;
    tyreInstallationImageFileUrl: string;
    viewMode: boolean;
    canDelete: boolean;
    isDeleting: boolean;
}


Page({
    data: {
        viewMode: true,
        canDelete: false
    } as WarrantyDetailPageData,

    async onLoad(options) {
        let warrantyID = options["id"]!;

        let ret = await warrantyService.getWarrantyItemDetail(warrantyID);

        let viewData = {
            warrantyID: warrantyID,
            thumbnail: ret.thumbnail || "",
            plateNumber: ret.plateNumber || "",
            plateImageFileID: ret.plateImageFileID || "",
            shopName: ret.shopName || "",
            shopImageFileID: ret.shopImageFileID || "",
            shopAddress: ret.shopAddress || "",
            tyreModelImageFileID: ret.tyreModelImageFileID || "",
            tyreInstallationImageFileID: ret.tyreInstallationImageFileID || "",
            datePurchased: moment(ret.datePurchased).format("YYYY-MM-DD"),
            endDate: moment(ret.endDate).format("YYYY-MM-DD"),
            approvalStatus: ret.approvalStatus || ApprovalStatus.drafting,
            viewMode: ret.approvalStatus == ApprovalStatus.pending || ret.approvalStatus == ApprovalStatus.approved,
            canDelete: ret.approvalStatus == ApprovalStatus.drafting,
        }

        if (ret.shopLocation) {
            viewData["shopLocation"] = {
                longtitude: ret.shopLocation!.longtitude,
                latitude: ret.shopLocation!.latitude
            }
        }

        this.setData(viewData);

        let fileIDs = [{ name: "plateImageFileID", value: this.data.plateImageFileID },
        { name: "shopImageFileID", value: this.data.shopImageFileID },
        { name: "tyreModelImageFileID", value: this.data.tyreModelImageFileID },
        { name: "tyreInstallationImageFileID", value: this.data.tyreInstallationImageFileID }].filter(x => !!x.value);


        if (fileIDs.length > 0) {
            let urls = await wx.cloud.getTempFileURL({
                fileList: fileIDs.map(x => x.value),
            });

            let updates: { [x: string]: string } = {};
            urls.fileList.forEach(f => {
                let x = fileIDs.find(i => i.value == f.fileID);
                if (x && f.status == 0) {
                    updates[x.name.replace("ImageFileID", "ImageFileUrl")] = f.tempFileURL;
                }
            });
            this.setData({ ...updates });
        }

        if(this.data.thumbnail) {
            console.log("drawing thumbnail")
            const ctx = wx.createCanvasContext("cropCanvas");
            ctx.drawImage(this.data.thumbnail, 0,0,50,50);
            ctx.draw();
            // this.data["cropCanvasContext"] = ctx;
        }
        
    },
    onReady(){
    },
    onShow() {
        //console.log("onShow");
    },

    async onUnload() {
        //console.log("onUnload")

        let pages = getCurrentPages();
        let page = pages[pages.length - 2] as unknown as WarrantyPage;


        let item = new WarrantyListItem(this.data.warrantyID, this.data.plateNumber || '车牌未填写', '', this.data.thumbnail, this.data.approvalStatus, this.data.isDeleting);
        await page.UpdateItem(this.data.warrantyID, item);

        if (!this.data.isDeleting) {
            await warrantyService.updateWarrantyItem(this.data.warrantyID, {
                plateImageFileID: this.data.plateImageFileID,
                plateNumber: this.data.plateNumber,
                datePurchased: moment(this.data.datePurchased).toDate(),
                shopAddress: this.data.shopAddress,
                shopImageFileID: this.data.shopImageFileID,
                shopName: this.data.shopName,
                tyreModelImageFileID: this.data.tyreModelImageFileID,
                tyreInstallationImageFileID: this.data.tyreInstallationImageFileID,
                approvalStatus: this.data.approvalStatus,
                thumbnail: this.data.thumbnail
            }, this.data.shopLocation ? {
                longtitude: this.data.shopLocation!.longtitude,
                latitude: this.data.shopLocation!.latitude
            } : undefined);
        }
    },

    onDateChanged(e: event.Input) {
        this.setData({
            datePurchased: e.detail.value
        })
    },

    onGetLocation() {
        wx.chooseLocation({
            success: res => {
                //console.log(res);
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
                //console.log(err);
                wx.showToast({
                    title: '获取定位失败',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
    },

    async onScanPlate() {
        if (this.data.viewMode) {
            wx.previewImage({
                urls: [this.data.plateImageFileUrl]
            });
            return;
        }

        let imgFileUrl: string;

        try {
            let imgFile = await new Promise<wx.ImageFile>((resolve, reject) => {
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
            imgFileUrl = imgFile.path;
            this.setData({
                plateImageFileUrl: imgFileUrl
            })
        } catch (err) {
            //console.log(err);
            return;
        }

        try {
            let thumbnailData = await this.getThumbnail(imgFileUrl);
            wx.showLoading({
                title:'图片上传中'
            });
            let ret = await warrantyService.uploadPlateImage(this.data.warrantyID, imgFileUrl);
            wx.hideLoading();
            this.setData({
                thumbnail: thumbnailData,
                plateNumber: ret.plateNumber,
                plateImageFileID: ret.fileID
            });
        } catch (err) {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: '照片识别失败，请重新上传，或手动填入车牌',
                showCancel: false
            });
        }


    },

    async onPlateInput(e: event.InputBlur) {
        this.setData({
            plateNumber: e.detail.value
        })
    },


    async chooseImage(e: event.Touch) {
        if (this.data.viewMode) {
            let name = e.currentTarget.dataset["name"];
            wx.previewImage({
                urls: [this.data[name + "ImageFileUrl"]],
            })
            return;
        }

        let imageName = e.currentTarget.dataset["name"];
        let imageFilePath: string;
        try {
            let imageFile = await new Promise<wx.ImageFile>((resolve, reject) => {
                wx.chooseImage({
                    sizeType: ['original'],
                    success: res => {
                        resolve(res.tempFiles[0])
                    },
                    fail: err => {
                        reject(err);
                    }
                });
            });
            imageFilePath = imageFile.path;
        } catch (err) {
            return;
        }

        wx.showLoading({ "mask": true, "title": "图片上传中" })

        let fileID = await warrantyService.uploadImage(this.data.warrantyID, imageFilePath, imageName);
        let fileIDProperty = imageName + "ImageFileID";
        let fileUrlProperty = imageName + "ImageFileUrl";
        this.setData({
            [fileIDProperty]: fileID,
            [fileUrlProperty]: imageFilePath
        });
        wx.hideLoading();
    },

    async onRemoveWarranty() {
        wx.showLoading({
            title: '提交中'
        });
        this.setData({
            isDeleting: true
        })
        await warrantyService.removeWarrantyItem(this.data.warrantyID);
        let pages = getCurrentPages();
        console.log(pages);
        let page = pages[pages.length - 2] as unknown as WarrantyPage;
        //await page.onItemRemoved(this.data.warrantyID);
        wx.hideLoading();
        wx.navigateBack({
            delta: 1,
        })
    },

    async previewImage(e: event.Touch) {
        let name = e.currentTarget.dataset["name"];
        wx.previewImage({
            urls: [this.data[name + "ImageFileUrl"]]
        })
    },

    onSubmit(e: event.Touch) {
        if (!this.data.shopAddress) {
            wx.showModal({ title: "提示", content: "门店地址还没有填写哦！", showCancel: false });
            return;
        }

        if (!this.data.shopName) {
            wx.showModal({ title: "提示", content: "门店名称还没有填写哦！", showCancel: false });
            return;
        }

        if (!this.data.shopImageFileID) {
            wx.showModal({ title: "提示", content: "门店照片还没有上传哦！", showCancel: false });
            return;
        }

        if (!this.data.plateNumber) {
            wx.showModal({ title: "提示", content: "车牌号码还没有填写哦！", showCancel: false });
            return;
        }

        if (!this.data.tyreModelImageFileID) {
            wx.showModal({ title: "提示", content: "轮胎型号照片还没有上传哦！", showCancel: false });
            return;
        }

        if (!this.data.tyreInstallationImageFileID) {
            wx.showModal({ title: "提示", content: "轮胎安装照片还没有上传哦！", showCancel: false });
            return;
        }

        wx.showModal({
            title: '提示',
            content: '提交后将进入审核环节，无法修改，请确认资料是否填写无误',
            confirmText: '提交',
            cancelText: '返回',
            success: res => {
                if (res.confirm) {
                    this.setData({
                        approvalStatus: ApprovalStatus.pending,
                        canDelete: false,
                        viewMode: true,
                    });
                    wx.navigateBack({
                        delta: 1
                    });
                }
            }
        })
    },

    async getThumbnail(imageUrl: string):Promise<string> {
        const ctx = wx.createCanvasContext('cropCanvas');
        ctx.drawImage(imageUrl, 0, 0, 50, 50);
        await new Promise((resolve,reject)=> ctx.draw(false, resolve));

        let path: string = await new Promise((resolve, reject) => {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                canvasId: 'cropCanvas',
                fileType: "jpg",
                quality: 1,
                success: res => {
                    resolve(res.tempFilePath);
                },
                fail: err => {
                    console.error(err);
                    reject(err);
                }
            })
        });
        let manager = wx.getFileSystemManager();
        let data:string = await new Promise((resolve,reject)=>{ manager.readFile({
            filePath: path,
            encoding: 'base64',
            success: res => {
                resolve(res.data as string);
            },
            fail: err => {
                reject(err);
            }
        })});
        return "data:image/jpeg;base64,"+data;
    }
})
