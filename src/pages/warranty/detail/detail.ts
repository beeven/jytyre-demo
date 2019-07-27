
import { warrantyService, ApprovalStatus } from '../warranty.service';

import * as moment from "moment-mini-ts";
import { WarrantyPage } from '../warranty';

interface WarrantyDetailPageData {
    warrantyID: string;
    shopName: string;
    shopImageFileID: string;
    shopImageFileUrl: string;
    shopAddress: string;
    shopLocation?: {
        longtitude: number,
        latitude: number
    }
    datePurchased: string;
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

    } as WarrantyDetailPageData,

    async onLoad(options) {
        let warrantyID = options["id"]!;

        let ret = await warrantyService.getWarrantyItemDetail(warrantyID);

        console.log(ret);

        this.setData({
            warrantyID: warrantyID,
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
            shopLocation: ret.shopLocation ? {
                longtitude: ret.shopLocation!.longtitude,
                latitude: ret.shopLocation!.latitude
            } : undefined
        });

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
    },

    async onUnload() {
        console.log("onUnload")

        let pages = getCurrentPages();
        let page = pages[pages.length - 2] as unknown as WarrantyPage;
        await page.UpdateItem(this.data.warrantyID, {
            plateNumber: this.data.plateNumber || '车牌未填写',
            id: this.data.warrantyID,
            approvalStatus: ApprovalStatus.drafting,
            description: '',
            thumbnail: "",
            isDeleting: this.data.isDeleting
        });

        if (!this.data.isDeleting) {
            await warrantyService.updateWarrantyItem(this.data.warrantyID, {
                plateImageFileID: this.data.plateImageFileID,
                plateNumber: this.data.plateNumber,
                datePurchased: moment(this.data.datePurchased).toDate(),
                shopAddress: this.data.shopAddress,
                shopImageFileID: this.data.shopImageFileID,
                shopName: this.data.shopName,
                tyreModelImageFileID: this.data.tyreModelImageFileID,
                tyreInstallationImageFileID: this.data.tyreInstallationImageFileID
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

        let imgFile;

        try {
            imgFile = await new Promise<wx.ImageFile>((resolve, reject) => {
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
            this.setData({
                plateImageFileUrl: imgFile.path
            })
        } catch (err) {
            return;
        }




        try {
            wx.showLoading({ title: "图片上传中", mask: true });
            let fileID = await warrantyService.uploadImage(this.data.warrantyID, imgFile.path, "licensePlate");
            //wx.hideLoading();

            wx.showLoading({ title: "识别车牌中" })
            let ret = await warrantyService.getPlateNumber(fileID);
            wx.hideLoading();
            this.setData({
                plateNumber: ret.plateNumber,
                plateImageFileID: ret.fileID
            })
        } catch (err) {
            wx.hideLoading();
            wx.showModal({
                title: '提示',
                content: '照片识别失败，请按照要求重新上传',
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
        let imageName = e.currentTarget.dataset["name"];
        let imageFile = await new Promise<wx.ImageFile>((resolve, reject) => {
            wx.chooseImage({
                sizeType: ['original'],
                success: res => {
                    resolve(res.tempFiles[0])
                },
                fail: err => {
                    reject(err);
                }
            })
        });

        let fileID = await warrantyService.uploadImage(this.data.warrantyID, imageFile.path, imageName);
        let fileIDProperty = imageName + "ImageFileID";
        let fileUrlProperty = imageName + "ImageFileUrl";
        this.setData({
            [fileIDProperty]: fileID,
            [fileUrlProperty]: imageFile.path
        });
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
    }
})
