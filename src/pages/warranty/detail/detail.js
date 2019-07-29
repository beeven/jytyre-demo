"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const warranty_service_1 = require("../warranty.service");
const moment = require("moment-mini-ts");
const warrantListItem_1 = require("../warrantListItem");
Page({
    data: {
        viewMode: true,
        canDelete: false
    },
    onLoad(options) {
        return __awaiter(this, void 0, void 0, function* () {
            let warrantyID = options["id"];
            let ret = yield warranty_service_1.warrantyService.getWarrantyItemDetail(warrantyID);
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
                approvalStatus: ret.approvalStatus || warranty_service_1.ApprovalStatus.drafting,
                viewMode: ret.approvalStatus == warranty_service_1.ApprovalStatus.pending || ret.approvalStatus == warranty_service_1.ApprovalStatus.approved,
                canDelete: ret.approvalStatus == warranty_service_1.ApprovalStatus.drafting,
            };
            if (ret.shopLocation) {
                viewData["shopLocation"] = {
                    longtitude: ret.shopLocation.longtitude,
                    latitude: ret.shopLocation.latitude
                };
            }
            this.setData(viewData);
            let fileIDs = [{ name: "plateImageFileID", value: this.data.plateImageFileID },
                { name: "shopImageFileID", value: this.data.shopImageFileID },
                { name: "tyreModelImageFileID", value: this.data.tyreModelImageFileID },
                { name: "tyreInstallationImageFileID", value: this.data.tyreInstallationImageFileID }].filter(x => !!x.value);
            if (fileIDs.length > 0) {
                let urls = yield wx.cloud.getTempFileURL({
                    fileList: fileIDs.map(x => x.value),
                });
                let updates = {};
                urls.fileList.forEach(f => {
                    let x = fileIDs.find(i => i.value == f.fileID);
                    if (x && f.status == 0) {
                        updates[x.name.replace("ImageFileID", "ImageFileUrl")] = f.tempFileURL;
                    }
                });
                this.setData(Object.assign({}, updates));
            }
            if (this.data.thumbnail) {
                console.log("drawing thumbnail");
                const ctx = wx.createCanvasContext("cropCanvas");
                ctx.drawImage(this.data.thumbnail, 0, 0, 50, 50);
                ctx.draw();
            }
        });
    },
    onReady() {
    },
    onShow() {
        console.log("onShow");
    },
    onUnload() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("onUnload");
            let pages = getCurrentPages();
            let page = pages[pages.length - 2];
            let item = new warrantListItem_1.WarrantyListItem(this.data.warrantyID, this.data.plateNumber || '车牌未填写', '', this.data.thumbnail, this.data.approvalStatus, this.data.isDeleting);
            yield page.UpdateItem(this.data.warrantyID, item);
            if (!this.data.isDeleting) {
                yield warranty_service_1.warrantyService.updateWarrantyItem(this.data.warrantyID, {
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
                    longtitude: this.data.shopLocation.longtitude,
                    latitude: this.data.shopLocation.latitude
                } : undefined);
            }
        });
    },
    onDateChanged(e) {
        this.setData({
            datePurchased: e.detail.value
        });
    },
    onGetLocation() {
        wx.chooseLocation({
            success: res => {
                console.log(res);
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
                });
            }
        });
    },
    onScanPlate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data.viewMode) {
                wx.previewImage({
                    urls: [this.data.plateImageFileUrl]
                });
                return;
            }
            let imgFileUrl;
            try {
                let imgFile = yield new Promise((resolve, reject) => {
                    wx.chooseImage({
                        count: 1,
                        sizeType: ['compressed'],
                        sourceType: ['album', 'camera'],
                        success: (res) => {
                            resolve(res.tempFiles[0]);
                        },
                        fail: err => {
                            reject(err);
                        }
                    });
                });
                imgFileUrl = imgFile.path;
                this.setData({
                    plateImageFileUrl: imgFileUrl
                });
            }
            catch (err) {
                console.log(err);
                return;
            }
            try {
                let thumbnailData = yield this.getThumbnail(imgFileUrl);
                wx.showLoading({
                    title: '图片上传中'
                });
                let ret = yield warranty_service_1.warrantyService.uploadPlateImage(this.data.warrantyID, imgFileUrl);
                wx.hideLoading();
                this.setData({
                    thumbnail: thumbnailData,
                    plateNumber: ret.plateNumber,
                    plateImageFileID: ret.fileID
                });
            }
            catch (err) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '照片识别失败，请重新上传，或手动填入车牌',
                    showCancel: false
                });
            }
        });
    },
    onPlateInput(e) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setData({
                plateNumber: e.detail.value
            });
        });
    },
    chooseImage(e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.data.viewMode) {
                let name = e.currentTarget.dataset["name"];
                wx.previewImage({
                    urls: [this.data[name + "ImageFileUrl"]],
                });
                return;
            }
            let imageName = e.currentTarget.dataset["name"];
            let imageFilePath;
            try {
                let imageFile = yield new Promise((resolve, reject) => {
                    wx.chooseImage({
                        sizeType: ['original'],
                        success: res => {
                            resolve(res.tempFiles[0]);
                        },
                        fail: err => {
                            reject(err);
                        }
                    });
                });
                imageFilePath = imageFile.path;
            }
            catch (err) {
                return;
            }
            wx.showLoading({ "mask": true, "title": "图片上传中" });
            let fileID = yield warranty_service_1.warrantyService.uploadImage(this.data.warrantyID, imageFilePath, imageName);
            let fileIDProperty = imageName + "ImageFileID";
            let fileUrlProperty = imageName + "ImageFileUrl";
            this.setData({
                [fileIDProperty]: fileID,
                [fileUrlProperty]: imageFilePath
            });
            wx.hideLoading();
        });
    },
    onRemoveWarranty() {
        return __awaiter(this, void 0, void 0, function* () {
            wx.showLoading({
                title: '提交中'
            });
            this.setData({
                isDeleting: true
            });
            yield warranty_service_1.warrantyService.removeWarrantyItem(this.data.warrantyID);
            let pages = getCurrentPages();
            console.log(pages);
            let page = pages[pages.length - 2];
            wx.hideLoading();
            wx.navigateBack({
                delta: 1,
            });
        });
    },
    previewImage(e) {
        return __awaiter(this, void 0, void 0, function* () {
            let name = e.currentTarget.dataset["name"];
            wx.previewImage({
                urls: [this.data[name + "ImageFileUrl"]]
            });
        });
    },
    onSubmit(e) {
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
                        approvalStatus: warranty_service_1.ApprovalStatus.pending,
                        canDelete: false,
                        viewMode: true,
                    });
                    wx.navigateBack({
                        delta: 1
                    });
                }
            }
        });
    },
    getThumbnail(imageUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx = wx.createCanvasContext('cropCanvas');
            ctx.drawImage(imageUrl, 0, 0, 50, 50);
            yield new Promise((resolve, reject) => ctx.draw(false, resolve));
            let path = yield new Promise((resolve, reject) => {
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
                });
            });
            let manager = wx.getFileSystemManager();
            let data = yield new Promise((resolve, reject) => {
                manager.readFile({
                    filePath: path,
                    encoding: 'base64',
                    success: res => {
                        resolve(res.data);
                    },
                    fail: err => {
                        reject(err);
                    }
                });
            });
            return "data:image/jpeg;base64," + data;
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGV0YWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSwwREFBc0U7QUFFdEUseUNBQXlDO0FBRXpDLHdEQUFzRDtBQTZCdEQsSUFBSSxDQUFDO0lBQ0QsSUFBSSxFQUFFO1FBQ0YsUUFBUSxFQUFFLElBQUk7UUFDZCxTQUFTLEVBQUUsS0FBSztLQUNPO0lBRXJCLE1BQU0sQ0FBQyxPQUFPOztZQUNoQixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFFLENBQUM7WUFFaEMsSUFBSSxHQUFHLEdBQUcsTUFBTSxrQ0FBZSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRWxFLElBQUksUUFBUSxHQUFHO2dCQUNYLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsSUFBSSxFQUFFO2dCQUM5QixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVcsSUFBSSxFQUFFO2dCQUNsQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLElBQUksRUFBRTtnQkFDNUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLElBQUksRUFBRTtnQkFDNUIsZUFBZSxFQUFFLEdBQUcsQ0FBQyxlQUFlLElBQUksRUFBRTtnQkFDMUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRTtnQkFDbEMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLG9CQUFvQixJQUFJLEVBQUU7Z0JBQ3BELDJCQUEyQixFQUFFLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxFQUFFO2dCQUNsRSxhQUFhLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO2dCQUM3RCxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO2dCQUNqRCxjQUFjLEVB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R0FBRyxDQUFDLEVBQUU7d0JBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQixDQUFDO2lCQUNKLENBQUMsQ0FBQTtZQUNOLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDeEMsSUFBSSxJQUFJLEdBQVUsTUFBTSxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsUUFBUSxDQUFDO29CQUNyRSxRQUFRLEVBQUUsSUFBSTtvQkFDZCxRQUFRLEVBQUUsUUFBUTtvQkFDbEIsT0FBTyxFQUFFLEdBQUcsQ0FBQyxFQUFFO3dCQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBYyxDQUFDLENBQUM7b0JBQ2hDLENBQUM7b0JBQ0QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO3dCQUNSLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDaEIsQ0FBQztpQkFDSixDQUFDLENBQUE7WUFBQSxDQUFDLENBQUMsQ0FBQztZQUNMLE9BQU8seUJBQXlCLEdBQUMsSUFBSSxDQUFDO1FBQzFDLENBQUM7S0FBQTtDQUNKLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5pbXBvcnQgeyB3YXJyYW50eVNlcnZpY2UsIEFwcHJvdmFsU3RhdHVzIH0gZnJvbSAnLi4vd2FycmFudHkuc2VydmljZSc7XHJcblxyXG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSBcIm1vbWVudC1taW5pLXRzXCI7XHJcbmltcG9ydCB7IFdhcnJhbnR5UGFnZSB9IGZyb20gJy4uL3dhcnJhbnR5JztcclxuaW1wb3J0IHsgV2FycmFudHlMaXN0SXRlbSB9IGZyb20gJy4uL3dhcnJhbnRMaXN0SXRlbSc7XHJcblxyXG5pbnRlcmZhY2UgV2FycmFudHlEZXRhaWxQYWdlRGF0YSB7XHJcbiAgICB3YXJyYW50eUlEOiBzdHJpbmc7XHJcbiAgICB0aHVtYm5haWw6IHN0cmluZztcclxuICAgIHNob3BOYW1lOiBzdHJpbmc7XHJcbiAgICBzaG9wSW1hZ2VGaWxlSUQ6IHN0cmluZztcclxuICAgIHNob3BJbWFnZUZpbGVVcmw6IHN0cmluZztcclxuICAgIHNob3BBZGRyZXNzOiBzdHJpbmc7XHJcbiAgICBzaG9wTG9jYXRpb24/OiB7XHJcbiAgICAgICAgbG9uZ3RpdHVkZTogbnVtYmVyLFxyXG4gICAgICAgIGxhdGl0dWRlOiBudW1iZXJcclxuICAgIH1cclxuICAgIGRhdGVQdXJjaGFzZWQ6IHN0cmluZztcclxuICAgIGVuZERhdGU6IHN0cmluZztcclxuICAgIGFwcHJvdmFsU3RhdHVzOiBBcHByb3ZhbFN0YXR1cztcclxuICAgIHBsYXRlTnVtYmVyOiBzdHJpbmc7XHJcbiAgICBwbGF0ZUltYWdlRmlsZUlEOiBzdHJpbmc7XHJcbiAgICBwbGF0ZUltYWdlRmlsZVVybDogc3RyaW5nO1xyXG4gICAgdHlyZU1vZGVsSW1hZ2VGaWxlSUQ6IHN0cmluZztcclxuICAgIHR5cmVNb2RlbEltYWdlRmlsZVVybDogc3RyaW5nO1xyXG4gICAgdHlyZUluc3RhbGxhdGlvbkltYWdlRmlsZUlEOiBzdHJpbmc7XHJcbiAgICB0eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlVXJsOiBzdHJpbmc7XHJcbiAgICB2aWV3TW9kZTogYm9vbGVhbjtcclxuICAgIGNhbkRlbGV0ZTogYm9vbGVhbjtcclxuICAgIGlzRGVsZXRpbmc6IGJvb2xlYW47XHJcbn1cclxuXHJcblxyXG5QYWdlKHtcclxuICAgIGRhdGE6IHtcclxuICAgICAgICB2aWV3TW9kZTogdHJ1ZSxcclxuICAgICAgICBjYW5EZWxldGU6IGZhbHNlXHJcbiAgICB9IGFzIFdhcnJhbnR5RGV0YWlsUGFnZURhdGEsXHJcblxyXG4gICAgYXN5bmMgb25Mb2FkKG9wdGlvbnMpIHtcclxuICAgICAgICBsZXQgd2FycmFudHlJRCA9IG9wdGlvbnNbXCJpZFwiXSE7XHJcblxyXG4gICAgICAgIGxldCByZXQgPSBhd2FpdCB3YXJyYW50eVNlcnZpY2UuZ2V0V2FycmFudHlJdGVtRGV0YWlsKHdhcnJhbnR5SUQpO1xyXG5cclxuICAgICAgICBsZXQgdmlld0RhdGEgPSB7XHJcbiAgICAgICAgICAgIHdhcnJhbnR5SUQ6IHdhcnJhbnR5SUQsXHJcbiAgICAgICAgICAgIHRodW1ibmFpbDogcmV0LnRodW1ibmFpbCB8fCBcIlwiLFxyXG4gICAgICAgICAgICBwbGF0ZU51bWJlcjogcmV0LnBsYXRlTnVtYmVyIHx8IFwiXCIsXHJcbiAgICAgICAgICAgIHBsYXRlSW1hZ2VGaWxlSUQ6IHJldC5wbGF0ZUltYWdlRmlsZUlEIHx8IFwiXCIsXHJcbiAgICAgICAgICAgIHNob3BOYW1lOiByZXQuc2hvcE5hbWUgfHwgXCJcIixcclxuICAgICAgICAgICAgc2hvcEltYWdlRmlsZUlEOiByZXQuc2hvcEltYWdlRmlsZUlEIHx8IFwiXCIsXHJcbiAgICAgICAgICAgIHNob3BBZGRyZXNzOiByZXQuc2hvcEFkZHJlc3MgfHwgXCJcIixcclxuICAgICAgICAgICAgdHlyZU1vZGVsSW1hZ2VGaWxlSUQ6IHJldC50eXJlTW9kZWxJbWFnZUZpbGVJRCB8fCBcIlwiLFxyXG4gICAgICAgICAgICB0eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSUQ6IHJldC50eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSUQgfHwgXCJcIixcclxuICAgICAgICAgICAgZGF0ZVB1cmNoYXNlZDogbW9tZW50KHJldC5kYXRlUHVyY2hhc2VkKS5mb3JtYXQoXCJZWVlZLU1NLUREXCIpLFxyXG4gICAgICAgICAgICBlbmREYXRlOiBtb21lbnQocmV0LmVuZERhdGUpLmZvcm1hdChcIllZWVktTU0tRERcIiksXHJcbiAgICAgICAgICAgIGFwcHJvdmFsU3RhdHVzOiByZXQuYXBwcm92YWxTdGF0dXMgfHwgQXBwcm92YWxTdGF0dXMuZHJhZnRpbmcsXHJcbiAgICAgICAgICAgIHZpZXdNb2RlOiByZXQuYXBwcm92YWxTdGF0dXMgPT0gQXBwcm92YWxTdGF0dXMucGVuZGluZyB8fCByZXQuYXBwcm92YWxTdGF0dXMgPT0gQXBwcm92YWxTdGF0dXMuYXBwcm92ZWQsXHJcbiAgICAgICAgICAgIGNhbkRlbGV0ZTogcmV0LmFwcHJvdmFsU3RhdHVzID09IEFwcHJvdmFsU3RhdHVzLmRyYWZ0aW5nLFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJldC5zaG9wTG9jYXRpb24pIHtcclxuICAgICAgICAgICAgdmlld0RhdGFbXCJzaG9wTG9jYXRpb25cIl0gPSB7XHJcbiAgICAgICAgICAgICAgICBsb25ndGl0dWRlOiByZXQuc2hvcExvY2F0aW9uIS5sb25ndGl0dWRlLFxyXG4gICAgICAgICAgICAgICAgbGF0aXR1ZGU6IHJldC5zaG9wTG9jYXRpb24hLmxhdGl0dWRlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0RGF0YSh2aWV3RGF0YSk7XHJcblxyXG4gICAgICAgIGxldCBmaWxlSURzID0gW3sgbmFtZTogXCJwbGF0ZUltYWdlRmlsZUlEXCIsIHZhbHVlOiB0aGlzLmRhdGEucGxhdGVJbWFnZUZpbGVJRCB9LFxyXG4gICAgICAgIHsgbmFtZTogXCJzaG9wSW1hZ2VGaWxlSURcIiwgdmFsdWU6IHRoaXMuZGF0YS5zaG9wSW1hZ2VGaWxlSUQgfSxcclxuICAgICAgICB7IG5hbWU6IFwidHlyZU1vZGVsSW1hZ2VGaWxlSURcIiwgdmFsdWU6IHRoaXMuZGF0YS50eXJlTW9kZWxJbWFnZUZpbGVJRCB9LFxyXG4gICAgICAgIHsgbmFtZTogXCJ0eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSURcIiwgdmFsdWU6IHRoaXMuZGF0YS50eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSUQgfV0uZmlsdGVyKHggPT4gISF4LnZhbHVlKTtcclxuXHJcblxyXG4gICAgICAgIGlmIChmaWxlSURzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IHVybHMgPSBhd2FpdCB3eC5jbG91ZC5nZXRUZW1wRmlsZVVSTCh7XHJcbiAgICAgICAgICAgICAgICBmaWxlTGlzdDogZmlsZUlEcy5tYXAoeCA9PiB4LnZhbHVlKSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdXBkYXRlczogeyBbeDogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcclxuICAgICAgICAgICAgdXJscy5maWxlTGlzdC5mb3JFYWNoKGYgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IHggPSBmaWxlSURzLmZpbmQoaSA9PiBpLnZhbHVlID09IGYuZmlsZUlEKTtcclxuICAgICAgICAgICAgICAgIGlmICh4ICYmIGYuc3RhdHVzID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB1cGRhdGVzW3gubmFtZS5yZXBsYWNlKFwiSW1hZ2VGaWxlSURcIiwgXCJJbWFnZUZpbGVVcmxcIildID0gZi50ZW1wRmlsZVVSTDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7IC4uLnVwZGF0ZXMgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZih0aGlzLmRhdGEudGh1bWJuYWlsKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZHJhd2luZyB0aHVtYm5haWxcIilcclxuICAgICAgICAgICAgY29uc3QgY3R4ID0gd3guY3JlYXRlQ2FudmFzQ29udGV4dChcImNyb3BDYW52YXNcIik7XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5kYXRhLnRodW1ibmFpbCwgMCwwLDUwLDUwKTtcclxuICAgICAgICAgICAgY3R4LmRyYXcoKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5kYXRhW1wiY3JvcENhbnZhc0NvbnRleHRcIl0gPSBjdHg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfSxcclxuICAgIG9uUmVhZHkoKXtcclxuICAgIH0sXHJcbiAgICBvblNob3coKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJvblNob3dcIik7XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIG9uVW5sb2FkKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwib25VbmxvYWRcIilcclxuXHJcbiAgICAgICAgbGV0IHBhZ2VzID0gZ2V0Q3VycmVudFBhZ2VzKCk7XHJcbiAgICAgICAgbGV0IHBhZ2UgPSBwYWdlc1twYWdlcy5sZW5ndGggLSAyXSBhcyB1bmtub3duIGFzIFdhcnJhbnR5UGFnZTtcclxuXHJcblxyXG4gICAgICAgIGxldCBpdGVtID0gbmV3IFdhcnJhbnR5TGlzdEl0ZW0odGhpcy5kYXRhLndhcnJhbnR5SUQsIHRoaXMuZGF0YS5wbGF0ZU51bWJlciB8fCAn6L2m54mM5pyq5aGr5YaZJywgJycsIHRoaXMuZGF0YS50aHVtYm5haWwsIHRoaXMuZGF0YS5hcHByb3ZhbFN0YXR1cywgdGhpcy5kYXRhLmlzRGVsZXRpbmcpO1xyXG4gICAgICAgIGF3YWl0IHBhZ2UuVXBkYXRlSXRlbSh0aGlzLmRhdGEud2FycmFudHlJRCwgaXRlbSk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5kYXRhLmlzRGVsZXRpbmcpIHtcclxuICAgICAgICAgICAgYXdhaXQgd2FycmFudHlTZXJ2aWNlLnVwZGF0ZVdhcnJhbnR5SXRlbSh0aGlzLmRhdGEud2FycmFudHlJRCwge1xyXG4gICAgICAgICAgICAgICAgcGxhdGVJbWFnZUZpbGVJRDogdGhpcy5kYXRhLnBsYXRlSW1hZ2VGaWxlSUQsXHJcbiAgICAgICAgICAgICAgICBwbGF0ZU51bWJlcjogdGhpcy5kYXRhLnBsYXRlTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgZGF0ZVB1cmNoYXNlZDogbW9tZW50KHRoaXMuZGF0YS5kYXRlUHVyY2hhc2VkKS50b0RhdGUoKSxcclxuICAgICAgICAgICAgICAgIHNob3BBZGRyZXNzOiB0aGlzLmRhdGEuc2hvcEFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICBzaG9wSW1hZ2VGaWxlSUQ6IHRoaXMuZGF0YS5zaG9wSW1hZ2VGaWxlSUQsXHJcbiAgICAgICAgICAgICAgICBzaG9wTmFtZTogdGhpcy5kYXRhLnNob3BOYW1lLFxyXG4gICAgICAgICAgICAgICAgdHlyZU1vZGVsSW1hZ2VGaWxlSUQ6IHRoaXMuZGF0YS50eXJlTW9kZWxJbWFnZUZpbGVJRCxcclxuICAgICAgICAgICAgICAgIHR5cmVJbnN0YWxsYXRpb25JbWFnZUZpbGVJRDogdGhpcy5kYXRhLnR5cmVJbnN0YWxsYXRpb25JbWFnZUZpbGVJRCxcclxuICAgICAgICAgICAgICAgIGFwcHJvdmFsU3RhdHVzOiB0aGlzLmRhdGEuYXBwcm92YWxTdGF0dXMsXHJcbiAgICAgICAgICAgICAgICB0aHVtYm5haWw6IHRoaXMuZGF0YS50aHVtYm5haWxcclxuICAgICAgICAgICAgfSwgdGhpcy5kYXRhLnNob3BMb2NhdGlvbiA/IHtcclxuICAgICAgICAgICAgICAgIGxvbmd0aXR1ZGU6IHRoaXMuZGF0YS5zaG9wTG9jYXRpb24hLmxvbmd0aXR1ZGUsXHJcbiAgICAgICAgICAgICAgICBsYXRpdHVkZTogdGhpcy5kYXRhLnNob3BMb2NhdGlvbiEubGF0aXR1ZGVcclxuICAgICAgICAgICAgfSA6IHVuZGVmaW5lZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvbkRhdGVDaGFuZ2VkKGU6IGV2ZW50LklucHV0KSB7XHJcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgZGF0ZVB1cmNoYXNlZDogZS5kZXRhaWwudmFsdWVcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcbiAgICBvbkdldExvY2F0aW9uKCkge1xyXG4gICAgICAgIHd4LmNob29zZUxvY2F0aW9uKHtcclxuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3BBZGRyZXNzOiByZXMuYWRkcmVzcyxcclxuICAgICAgICAgICAgICAgICAgICBzaG9wTG9jYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZGU6IHJlcy5sYXRpdHVkZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ3RpdHVkZTogcmVzLmxvbmdpdHVkZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvcE5hbWU6IHJlcy5uYW1lXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFpbDogZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICB3eC5zaG93VG9hc3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn6I635Y+W5a6a5L2N5aSx6LSlJyxcclxuICAgICAgICAgICAgICAgICAgICBpY29uOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IDIwMDBcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcbiAgICBhc3luYyBvblNjYW5QbGF0ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5kYXRhLnZpZXdNb2RlKSB7XHJcbiAgICAgICAgICAgIHd4LnByZXZpZXdJbWFnZSh7XHJcbiAgICAgICAgICAgICAgICB1cmxzOiBbdGhpcy5kYXRhLnBsYXRlSW1hZ2VGaWxlVXJsXVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGltZ0ZpbGVVcmw6IHN0cmluZztcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IGltZ0ZpbGUgPSBhd2FpdCBuZXcgUHJvbWlzZTx3eC5JbWFnZUZpbGU+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICAgIHd4LmNob29zZUltYWdlKHtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudDogMSxcclxuICAgICAgICAgICAgICAgICAgICBzaXplVHlwZTogWydjb21wcmVzc2VkJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlVHlwZTogWydhbGJ1bScsICdjYW1lcmEnXSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiAocmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLnRlbXBGaWxlc1swXSlcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZhaWw6IGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpbWdGaWxlVXJsID0gaW1nRmlsZS5wYXRoO1xyXG4gICAgICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICAgICAgcGxhdGVJbWFnZUZpbGVVcmw6IGltZ0ZpbGVVcmxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IHRodW1ibmFpbERhdGEgPSBhd2FpdCB0aGlzLmdldFRodW1ibmFpbChpbWdGaWxlVXJsKTtcclxuICAgICAgICAgICAgd3guc2hvd0xvYWRpbmcoe1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6J+WbvueJh+S4iuS8oOS4rSdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGxldCByZXQgPSBhd2FpdCB3YXJyYW50eVNlcnZpY2UudXBsb2FkUGxhdGVJbWFnZSh0aGlzLmRhdGEud2FycmFudHlJRCwgaW1nRmlsZVVybCk7XHJcbiAgICAgICAgICAgIHd4LmhpZGVMb2FkaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgICAgICB0aHVtYm5haWw6IHRodW1ibmFpbERhdGEsXHJcbiAgICAgICAgICAgICAgICBwbGF0ZU51bWJlcjogcmV0LnBsYXRlTnVtYmVyLFxyXG4gICAgICAgICAgICAgICAgcGxhdGVJbWFnZUZpbGVJRDogcmV0LmZpbGVJRFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgd3guaGlkZUxvYWRpbmcoKTtcclxuICAgICAgICAgICAgd3guc2hvd01vZGFsKHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICfnhafniYfor4bliKvlpLHotKXvvIzor7fph43mlrDkuIrkvKDvvIzmiJbmiYvliqjloavlhaXovabniYwnLFxyXG4gICAgICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIG9uUGxhdGVJbnB1dChlOiBldmVudC5JbnB1dEJsdXIpIHtcclxuICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICBwbGF0ZU51bWJlcjogZS5kZXRhaWwudmFsdWVcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgYXN5bmMgY2hvb3NlSW1hZ2UoZTogZXZlbnQuVG91Y2gpIHtcclxuICAgICAgICBpZiAodGhpcy5kYXRhLnZpZXdNb2RlKSB7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXRbXCJuYW1lXCJdO1xyXG4gICAgICAgICAgICB3eC5wcmV2aWV3SW1hZ2Uoe1xyXG4gICAgICAgICAgICAgICAgdXJsczogW3RoaXMuZGF0YVtuYW1lICsgXCJJbWFnZUZpbGVVcmxcIl1dLFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaW1hZ2VOYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXRbXCJuYW1lXCJdO1xyXG4gICAgICAgIGxldCBpbWFnZUZpbGVQYXRoOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IGltYWdlRmlsZSA9IGF3YWl0IG5ldyBQcm9taXNlPHd4LkltYWdlRmlsZT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgd3guY2hvb3NlSW1hZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgIHNpemVUeXBlOiBbJ29yaWdpbmFsJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMudGVtcEZpbGVzWzBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbDogZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpbWFnZUZpbGVQYXRoID0gaW1hZ2VGaWxlLnBhdGg7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHd4LnNob3dMb2FkaW5nKHsgXCJtYXNrXCI6IHRydWUsIFwidGl0bGVcIjogXCLlm77niYfkuIrkvKDkuK1cIiB9KVxyXG5cclxuICAgICAgICBsZXQgZmlsZUlEID0gYXdhaXQgd2FycmFudHlTZXJ2aWNlLnVwbG9hZEltYWdlKHRoaXMuZGF0YS53YXJyYW50eUlELCBpbWFnZUZpbGVQYXRoLCBpbWFnZU5hbWUpO1xyXG4gICAgICAgIGxldCBmaWxlSURQcm9wZXJ0eSA9IGltYWdlTmFtZSArIFwiSW1hZ2VGaWxlSURcIjtcclxuICAgICAgICBsZXQgZmlsZVVybFByb3BlcnR5ID0gaW1hZ2VOYW1lICsgXCJJbWFnZUZpbGVVcmxcIjtcclxuICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICBbZmlsZUlEUHJvcGVydHldOiBmaWxlSUQsXHJcbiAgICAgICAgICAgIFtmaWxlVXJsUHJvcGVydHldOiBpbWFnZUZpbGVQYXRoXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoKTtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgb25SZW1vdmVXYXJyYW50eSgpIHtcclxuICAgICAgICB3eC5zaG93TG9hZGluZyh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAn5o+Q5Lqk5LitJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgIGlzRGVsZXRpbmc6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgIGF3YWl0IHdhcnJhbnR5U2VydmljZS5yZW1vdmVXYXJyYW50eUl0ZW0odGhpcy5kYXRhLndhcnJhbnR5SUQpO1xyXG4gICAgICAgIGxldCBwYWdlcyA9IGdldEN1cnJlbnRQYWdlcygpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHBhZ2VzKTtcclxuICAgICAgICBsZXQgcGFnZSA9IHBhZ2VzW3BhZ2VzLmxlbmd0aCAtIDJdIGFzIHVua25vd24gYXMgV2FycmFudHlQYWdlO1xyXG4gICAgICAgIC8vYXdhaXQgcGFnZS5vbkl0ZW1SZW1vdmVkKHRoaXMuZGF0YS53YXJyYW50eUlEKTtcclxuICAgICAgICB3eC5oaWRlTG9hZGluZygpO1xyXG4gICAgICAgIHd4Lm5hdmlnYXRlQmFjayh7XHJcbiAgICAgICAgICAgIGRlbHRhOiAxLFxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIHByZXZpZXdJbWFnZShlOiBldmVudC5Ub3VjaCkge1xyXG4gICAgICAgIGxldCBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXRbXCJuYW1lXCJdO1xyXG4gICAgICAgIHd4LnByZXZpZXdJbWFnZSh7XHJcbiAgICAgICAgICAgIHVybHM6IFt0aGlzLmRhdGFbbmFtZSArIFwiSW1hZ2VGaWxlVXJsXCJdXVxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG5cclxuICAgIG9uU3VibWl0KGU6IGV2ZW50LlRvdWNoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRhdGEuc2hvcEFkZHJlc3MpIHtcclxuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgdGl0bGU6IFwi5o+Q56S6XCIsIGNvbnRlbnQ6IFwi6Zeo5bqX5Zyw5Z2A6L+Y5rKh5pyJ5aGr5YaZ5ZOm77yBXCIsIHNob3dDYW5jZWw6IGZhbHNlIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZGF0YS5zaG9wTmFtZSkge1xyXG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoeyB0aXRsZTogXCLmj5DnpLpcIiwgY29udGVudDogXCLpl6jlupflkI3np7Dov5jmsqHmnInloavlhpnlk6bvvIFcIiwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5kYXRhLnNob3BJbWFnZUZpbGVJRCkge1xyXG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoeyB0aXRsZTogXCLmj5DnpLpcIiwgY29udGVudDogXCLpl6jlupfnhafniYfov5jmsqHmnInkuIrkvKDlk6bvvIFcIiwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5kYXRhLnBsYXRlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIuaPkOekulwiLCBjb250ZW50OiBcIui9pueJjOWPt+eggei/mOayoeacieWhq+WGmeWTpu+8gVwiLCBzaG93Q2FuY2VsOiBmYWxzZSB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmRhdGEudHlyZU1vZGVsSW1hZ2VGaWxlSUQpIHtcclxuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgdGl0bGU6IFwi5o+Q56S6XCIsIGNvbnRlbnQ6IFwi6L2u6IOO5Z6L5Y+354Wn54mH6L+Y5rKh5pyJ5LiK5Lyg5ZOm77yBXCIsIHNob3dDYW5jZWw6IGZhbHNlIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZGF0YS50eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSUQpIHtcclxuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgdGl0bGU6IFwi5o+Q56S6XCIsIGNvbnRlbnQ6IFwi6L2u6IOO5a6J6KOF54Wn54mH6L+Y5rKh5pyJ5LiK5Lyg5ZOm77yBXCIsIHNob3dDYW5jZWw6IGZhbHNlIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3eC5zaG93TW9kYWwoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ+aPkOekuicsXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfmj5DkuqTlkI7lsIbov5vlhaXlrqHmoLjnjq/oioLvvIzml6Dms5Xkv67mlLnvvIzor7fnoa7orqTotYTmlpnmmK/lkKbloavlhpnml6Dor68nLFxyXG4gICAgICAgICAgICBjb25maXJtVGV4dDogJ+aPkOS6pCcsXHJcbiAgICAgICAgICAgIGNhbmNlbFRleHQ6ICfov5Tlm54nLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcy5jb25maXJtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm92YWxTdGF0dXM6IEFwcHJvdmFsU3RhdHVzLnBlbmRpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbkRlbGV0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHd4Lm5hdmlnYXRlQmFjayh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbHRhOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcbiAgICBhc3luYyBnZXRUaHVtYm5haWwoaW1hZ2VVcmw6IHN0cmluZyk6UHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBjb25zdCBjdHggPSB3eC5jcmVhdGVDYW52YXNDb250ZXh0KCdjcm9wQ2FudmFzJyk7XHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZVVybCwgMCwgMCwgNTAsIDUwKTtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT4gY3R4LmRyYXcoZmFsc2UsIHJlc29sdmUpKTtcclxuXHJcbiAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgd3guY2FudmFzVG9UZW1wRmlsZVBhdGgoe1xyXG4gICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgIHk6IDAsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogNTAsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDUwLFxyXG4gICAgICAgICAgICAgICAgY2FudmFzSWQ6ICdjcm9wQ2FudmFzJyxcclxuICAgICAgICAgICAgICAgIGZpbGVUeXBlOiBcImpwZ1wiLFxyXG4gICAgICAgICAgICAgICAgcXVhbGl0eTogMSxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMudGVtcEZpbGVQYXRoKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmYWlsOiBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbWFuYWdlciA9IHd4LmdldEZpbGVTeXN0ZW1NYW5hZ2VyKCk7XHJcbiAgICAgICAgbGV0IGRhdGE6c3RyaW5nID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+eyBtYW5hZ2VyLnJlYWRGaWxlKHtcclxuICAgICAgICAgICAgZmlsZVBhdGg6IHBhdGgsXHJcbiAgICAgICAgICAgIGVuY29kaW5nOiAnYmFzZTY0JyxcclxuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLmRhdGEgYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFpbDogZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSl9KTtcclxuICAgICAgICByZXR1cm4gXCJkYXRhOmltYWdlL2pwZWc7YmFzZTY0LFwiK2RhdGE7XHJcbiAgICB9XHJcbn0pXHJcbiJdfQ==