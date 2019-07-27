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
                const ctx = wx.createCanvasContext("cropCanvas");
                ctx.drawImage(this.data.thumbnail, 0, 0);
                ctx.draw();
            }
        });
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
                wx.showLoading({ title: "图片上传中", mask: true });
                let fileID = yield warranty_service_1.warrantyService.uploadImage(this.data.warrantyID, imgFileUrl, "licensePlate");
                this.setData({
                    plateImageFileID: fileID
                });
                wx.showLoading({ title: "识别车牌中" });
                console.log(fileID);
                let ret = yield warranty_service_1.warrantyService.getPlateNumber(fileID);
                wx.hideLoading();
                this.setData({
                    plateNumber: ret.plateNumber
                });
                let thumbnailData = yield this.getThumbnail(imgFileUrl);
                this.setData({
                    thumbnail: thumbnailData
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0YWlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGV0YWlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQSwwREFBc0U7QUFFdEUseUNBQXlDO0FBRXpDLHdEQUFzRDtBQTZCdEQsSUFBSSxDQUFDO0lBQ0QsSUFBSSxFQUFFO1FBQ0YsUUFBUSxFQUFFLElBQUk7UUFDZCxTQUFTLEVBQUUsS0FBSztLQUNPO0lBRXJCLE1BQU0sQ0FBQyxPQUFPOztZQUNoQixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFFLENBQUM7WUFFaEMsSUFBSSxHQUFHLEdBQUcsTUFBTSxrQ0FBZSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRWxFLElBQUksUUFBUSxHQUFHO2dCQUNYLFVBQVUsRUFBRSxVQUFVO2dCQUN0QixTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVMsSUFBSSxFQUFFO2dCQUM5QixXQUFXLEVBQUUsR0FBRyxDQUFDLFdBQVcsSUFBSSxFQUFFO2dCQUNsQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsZ0JBQWdCLElBQUksRUFBRTtnQkFDNUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxRQUFRLElBQUksRUFBRTtnQkFDNUIsZUFBZSxFQUFFLEdBQUcsQ0FBQyxlQUFlLElBQUksRUFBRTtnQkFDMUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxXQUFXLElBQUksRUFBRTtnQkFDbEMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLG9CQUFvQixJQUFJLEVBQUU7Z0JBQ3BELDJCQUEyQixFQUFFLEdBQUcsQ0FBQywyQkFBMkIsSUFBSSxFQUFFO2dCQUNsRSxhQUFhLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO2dCQUM3RCxPQUFPLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO2dCQUNqRCxjQUFjLEVB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O29CQUNmLE9BQU8sRUFBRSxDQUFDO29CQUNWLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRTt3QkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUM5QixDQUFDO29CQUNELElBQUksRUFBRSxHQUFHLENBQUMsRUFBRTt3QkFDUixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3dCQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQ2hCLENBQUM7aUJBQ0osQ0FBQyxDQUFBO1lBQ04sQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztZQUN4QyxJQUFJLElBQUksR0FBVSxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxFQUFFO2dCQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUM7b0JBQ3JFLFFBQVEsRUFBRSxJQUFJO29CQUNkLFFBQVEsRUFBRSxRQUFRO29CQUNsQixPQUFPLEVBQUUsR0FBRyxDQUFDLEVBQUU7d0JBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFjLENBQUMsQ0FBQztvQkFDaEMsQ0FBQztvQkFDRCxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7d0JBQ1IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNoQixDQUFDO2lCQUNKLENBQUMsQ0FBQTtZQUFBLENBQUMsQ0FBQyxDQUFDO1lBQ0wsT0FBTyx5QkFBeUIsR0FBQyxJQUFJLENBQUM7UUFDMUMsQ0FBQztLQUFBO0NBQ0osQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCB7IHdhcnJhbnR5U2VydmljZSwgQXBwcm92YWxTdGF0dXMgfSBmcm9tICcuLi93YXJyYW50eS5zZXJ2aWNlJztcclxuXHJcbmltcG9ydCAqIGFzIG1vbWVudCBmcm9tIFwibW9tZW50LW1pbmktdHNcIjtcclxuaW1wb3J0IHsgV2FycmFudHlQYWdlIH0gZnJvbSAnLi4vd2FycmFudHknO1xyXG5pbXBvcnQgeyBXYXJyYW50eUxpc3RJdGVtIH0gZnJvbSAnLi4vd2FycmFudExpc3RJdGVtJztcclxuXHJcbmludGVyZmFjZSBXYXJyYW50eURldGFpbFBhZ2VEYXRhIHtcclxuICAgIHdhcnJhbnR5SUQ6IHN0cmluZztcclxuICAgIHRodW1ibmFpbDogc3RyaW5nO1xyXG4gICAgc2hvcE5hbWU6IHN0cmluZztcclxuICAgIHNob3BJbWFnZUZpbGVJRDogc3RyaW5nO1xyXG4gICAgc2hvcEltYWdlRmlsZVVybDogc3RyaW5nO1xyXG4gICAgc2hvcEFkZHJlc3M6IHN0cmluZztcclxuICAgIHNob3BMb2NhdGlvbj86IHtcclxuICAgICAgICBsb25ndGl0dWRlOiBudW1iZXIsXHJcbiAgICAgICAgbGF0aXR1ZGU6IG51bWJlclxyXG4gICAgfVxyXG4gICAgZGF0ZVB1cmNoYXNlZDogc3RyaW5nO1xyXG4gICAgZW5kRGF0ZTogc3RyaW5nO1xyXG4gICAgYXBwcm92YWxTdGF0dXM6IEFwcHJvdmFsU3RhdHVzO1xyXG4gICAgcGxhdGVOdW1iZXI6IHN0cmluZztcclxuICAgIHBsYXRlSW1hZ2VGaWxlSUQ6IHN0cmluZztcclxuICAgIHBsYXRlSW1hZ2VGaWxlVXJsOiBzdHJpbmc7XHJcbiAgICB0eXJlTW9kZWxJbWFnZUZpbGVJRDogc3RyaW5nO1xyXG4gICAgdHlyZU1vZGVsSW1hZ2VGaWxlVXJsOiBzdHJpbmc7XHJcbiAgICB0eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSUQ6IHN0cmluZztcclxuICAgIHR5cmVJbnN0YWxsYXRpb25JbWFnZUZpbGVVcmw6IHN0cmluZztcclxuICAgIHZpZXdNb2RlOiBib29sZWFuO1xyXG4gICAgY2FuRGVsZXRlOiBib29sZWFuO1xyXG4gICAgaXNEZWxldGluZzogYm9vbGVhbjtcclxufVxyXG5cclxuXHJcblBhZ2Uoe1xyXG4gICAgZGF0YToge1xyXG4gICAgICAgIHZpZXdNb2RlOiB0cnVlLFxyXG4gICAgICAgIGNhbkRlbGV0ZTogZmFsc2VcclxuICAgIH0gYXMgV2FycmFudHlEZXRhaWxQYWdlRGF0YSxcclxuXHJcbiAgICBhc3luYyBvbkxvYWQob3B0aW9ucykge1xyXG4gICAgICAgIGxldCB3YXJyYW50eUlEID0gb3B0aW9uc1tcImlkXCJdITtcclxuXHJcbiAgICAgICAgbGV0IHJldCA9IGF3YWl0IHdhcnJhbnR5U2VydmljZS5nZXRXYXJyYW50eUl0ZW1EZXRhaWwod2FycmFudHlJRCk7XHJcblxyXG4gICAgICAgIGxldCB2aWV3RGF0YSA9IHtcclxuICAgICAgICAgICAgd2FycmFudHlJRDogd2FycmFudHlJRCxcclxuICAgICAgICAgICAgdGh1bWJuYWlsOiByZXQudGh1bWJuYWlsIHx8IFwiXCIsXHJcbiAgICAgICAgICAgIHBsYXRlTnVtYmVyOiByZXQucGxhdGVOdW1iZXIgfHwgXCJcIixcclxuICAgICAgICAgICAgcGxhdGVJbWFnZUZpbGVJRDogcmV0LnBsYXRlSW1hZ2VGaWxlSUQgfHwgXCJcIixcclxuICAgICAgICAgICAgc2hvcE5hbWU6IHJldC5zaG9wTmFtZSB8fCBcIlwiLFxyXG4gICAgICAgICAgICBzaG9wSW1hZ2VGaWxlSUQ6IHJldC5zaG9wSW1hZ2VGaWxlSUQgfHwgXCJcIixcclxuICAgICAgICAgICAgc2hvcEFkZHJlc3M6IHJldC5zaG9wQWRkcmVzcyB8fCBcIlwiLFxyXG4gICAgICAgICAgICB0eXJlTW9kZWxJbWFnZUZpbGVJRDogcmV0LnR5cmVNb2RlbEltYWdlRmlsZUlEIHx8IFwiXCIsXHJcbiAgICAgICAgICAgIHR5cmVJbnN0YWxsYXRpb25JbWFnZUZpbGVJRDogcmV0LnR5cmVJbnN0YWxsYXRpb25JbWFnZUZpbGVJRCB8fCBcIlwiLFxyXG4gICAgICAgICAgICBkYXRlUHVyY2hhc2VkOiBtb21lbnQocmV0LmRhdGVQdXJjaGFzZWQpLmZvcm1hdChcIllZWVktTU0tRERcIiksXHJcbiAgICAgICAgICAgIGVuZERhdGU6IG1vbWVudChyZXQuZW5kRGF0ZSkuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKSxcclxuICAgICAgICAgICAgYXBwcm92YWxTdGF0dXM6IHJldC5hcHByb3ZhbFN0YXR1cyB8fCBBcHByb3ZhbFN0YXR1cy5kcmFmdGluZyxcclxuICAgICAgICAgICAgdmlld01vZGU6IHJldC5hcHByb3ZhbFN0YXR1cyA9PSBBcHByb3ZhbFN0YXR1cy5wZW5kaW5nIHx8IHJldC5hcHByb3ZhbFN0YXR1cyA9PSBBcHByb3ZhbFN0YXR1cy5hcHByb3ZlZCxcclxuICAgICAgICAgICAgY2FuRGVsZXRlOiByZXQuYXBwcm92YWxTdGF0dXMgPT0gQXBwcm92YWxTdGF0dXMuZHJhZnRpbmcsXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAocmV0LnNob3BMb2NhdGlvbikge1xyXG4gICAgICAgICAgICB2aWV3RGF0YVtcInNob3BMb2NhdGlvblwiXSA9IHtcclxuICAgICAgICAgICAgICAgIGxvbmd0aXR1ZGU6IHJldC5zaG9wTG9jYXRpb24hLmxvbmd0aXR1ZGUsXHJcbiAgICAgICAgICAgICAgICBsYXRpdHVkZTogcmV0LnNob3BMb2NhdGlvbiEubGF0aXR1ZGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXREYXRhKHZpZXdEYXRhKTtcclxuXHJcbiAgICAgICAgbGV0IGZpbGVJRHMgPSBbeyBuYW1lOiBcInBsYXRlSW1hZ2VGaWxlSURcIiwgdmFsdWU6IHRoaXMuZGF0YS5wbGF0ZUltYWdlRmlsZUlEIH0sXHJcbiAgICAgICAgeyBuYW1lOiBcInNob3BJbWFnZUZpbGVJRFwiLCB2YWx1ZTogdGhpcy5kYXRhLnNob3BJbWFnZUZpbGVJRCB9LFxyXG4gICAgICAgIHsgbmFtZTogXCJ0eXJlTW9kZWxJbWFnZUZpbGVJRFwiLCB2YWx1ZTogdGhpcy5kYXRhLnR5cmVNb2RlbEltYWdlRmlsZUlEIH0sXHJcbiAgICAgICAgeyBuYW1lOiBcInR5cmVJbnN0YWxsYXRpb25JbWFnZUZpbGVJRFwiLCB2YWx1ZTogdGhpcy5kYXRhLnR5cmVJbnN0YWxsYXRpb25JbWFnZUZpbGVJRCB9XS5maWx0ZXIoeCA9PiAhIXgudmFsdWUpO1xyXG5cclxuXHJcbiAgICAgICAgaWYgKGZpbGVJRHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgdXJscyA9IGF3YWl0IHd4LmNsb3VkLmdldFRlbXBGaWxlVVJMKHtcclxuICAgICAgICAgICAgICAgIGZpbGVMaXN0OiBmaWxlSURzLm1hcCh4ID0+IHgudmFsdWUpLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCB1cGRhdGVzOiB7IFt4OiBzdHJpbmddOiBzdHJpbmcgfSA9IHt9O1xyXG4gICAgICAgICAgICB1cmxzLmZpbGVMaXN0LmZvckVhY2goZiA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgeCA9IGZpbGVJRHMuZmluZChpID0+IGkudmFsdWUgPT0gZi5maWxlSUQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHggJiYgZi5zdGF0dXMgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZXNbeC5uYW1lLnJlcGxhY2UoXCJJbWFnZUZpbGVJRFwiLCBcIkltYWdlRmlsZVVybFwiKV0gPSBmLnRlbXBGaWxlVVJMO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdGhpcy5zZXREYXRhKHsgLi4udXBkYXRlcyB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmKHRoaXMuZGF0YS50aHVtYm5haWwpIHtcclxuICAgICAgICAgICAgY29uc3QgY3R4ID0gd3guY3JlYXRlQ2FudmFzQ29udGV4dChcImNyb3BDYW52YXNcIik7XHJcbiAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5kYXRhLnRodW1ibmFpbCwgMCwwKTtcclxuICAgICAgICAgICAgY3R4LmRyYXcoKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5kYXRhW1wiY3JvcENhbnZhc0NvbnRleHRcIl0gPSBjdHg7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBhc3luYyBvblVubG9hZCgpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIm9uVW5sb2FkXCIpXHJcblxyXG4gICAgICAgIGxldCBwYWdlcyA9IGdldEN1cnJlbnRQYWdlcygpO1xyXG4gICAgICAgIGxldCBwYWdlID0gcGFnZXNbcGFnZXMubGVuZ3RoIC0gMl0gYXMgdW5rbm93biBhcyBXYXJyYW50eVBhZ2U7XHJcblxyXG5cclxuICAgICAgICBsZXQgaXRlbSA9IG5ldyBXYXJyYW50eUxpc3RJdGVtKHRoaXMuZGF0YS53YXJyYW50eUlELCB0aGlzLmRhdGEucGxhdGVOdW1iZXIgfHwgJ+i9pueJjOacquWhq+WGmScsICcnLCB0aGlzLmRhdGEudGh1bWJuYWlsLCB0aGlzLmRhdGEuYXBwcm92YWxTdGF0dXMsIHRoaXMuZGF0YS5pc0RlbGV0aW5nKTtcclxuICAgICAgICBhd2FpdCBwYWdlLlVwZGF0ZUl0ZW0odGhpcy5kYXRhLndhcnJhbnR5SUQsIGl0ZW0pO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZGF0YS5pc0RlbGV0aW5nKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHdhcnJhbnR5U2VydmljZS51cGRhdGVXYXJyYW50eUl0ZW0odGhpcy5kYXRhLndhcnJhbnR5SUQsIHtcclxuICAgICAgICAgICAgICAgIHBsYXRlSW1hZ2VGaWxlSUQ6IHRoaXMuZGF0YS5wbGF0ZUltYWdlRmlsZUlELFxyXG4gICAgICAgICAgICAgICAgcGxhdGVOdW1iZXI6IHRoaXMuZGF0YS5wbGF0ZU51bWJlcixcclxuICAgICAgICAgICAgICAgIGRhdGVQdXJjaGFzZWQ6IG1vbWVudCh0aGlzLmRhdGEuZGF0ZVB1cmNoYXNlZCkudG9EYXRlKCksXHJcbiAgICAgICAgICAgICAgICBzaG9wQWRkcmVzczogdGhpcy5kYXRhLnNob3BBZGRyZXNzLFxyXG4gICAgICAgICAgICAgICAgc2hvcEltYWdlRmlsZUlEOiB0aGlzLmRhdGEuc2hvcEltYWdlRmlsZUlELFxyXG4gICAgICAgICAgICAgICAgc2hvcE5hbWU6IHRoaXMuZGF0YS5zaG9wTmFtZSxcclxuICAgICAgICAgICAgICAgIHR5cmVNb2RlbEltYWdlRmlsZUlEOiB0aGlzLmRhdGEudHlyZU1vZGVsSW1hZ2VGaWxlSUQsXHJcbiAgICAgICAgICAgICAgICB0eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSUQ6IHRoaXMuZGF0YS50eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSUQsXHJcbiAgICAgICAgICAgICAgICBhcHByb3ZhbFN0YXR1czogdGhpcy5kYXRhLmFwcHJvdmFsU3RhdHVzLFxyXG4gICAgICAgICAgICAgICAgdGh1bWJuYWlsOiB0aGlzLmRhdGEudGh1bWJuYWlsXHJcbiAgICAgICAgICAgIH0sIHRoaXMuZGF0YS5zaG9wTG9jYXRpb24gPyB7XHJcbiAgICAgICAgICAgICAgICBsb25ndGl0dWRlOiB0aGlzLmRhdGEuc2hvcExvY2F0aW9uIS5sb25ndGl0dWRlLFxyXG4gICAgICAgICAgICAgICAgbGF0aXR1ZGU6IHRoaXMuZGF0YS5zaG9wTG9jYXRpb24hLmxhdGl0dWRlXHJcbiAgICAgICAgICAgIH0gOiB1bmRlZmluZWQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25EYXRlQ2hhbmdlZChlOiBldmVudC5JbnB1dCkge1xyXG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgIGRhdGVQdXJjaGFzZWQ6IGUuZGV0YWlsLnZhbHVlXHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcblxyXG4gICAgb25HZXRMb2NhdGlvbigpIHtcclxuICAgICAgICB3eC5jaG9vc2VMb2NhdGlvbih7XHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgICAgICBzaG9wQWRkcmVzczogcmVzLmFkZHJlc3MsXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvcExvY2F0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWRlOiByZXMubGF0aXR1ZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvbmd0aXR1ZGU6IHJlcy5sb25naXR1ZGVcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3BOYW1lOiByZXMubmFtZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZhaWw6IGVyciA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ+iOt+WPluWumuS9jeWksei0pScsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAyMDAwXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgb25TY2FuUGxhdGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGF0YS52aWV3TW9kZSkge1xyXG4gICAgICAgICAgICB3eC5wcmV2aWV3SW1hZ2Uoe1xyXG4gICAgICAgICAgICAgICAgdXJsczogW3RoaXMuZGF0YS5wbGF0ZUltYWdlRmlsZVVybF1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpbWdGaWxlVXJsOiBzdHJpbmc7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBpbWdGaWxlID0gYXdhaXQgbmV3IFByb21pc2U8d3guSW1hZ2VGaWxlPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB3eC5jaG9vc2VJbWFnZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnQ6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgc2l6ZVR5cGU6IFsnY29tcHJlc3NlZCddLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZVR5cGU6IFsnYWxidW0nLCAnY2FtZXJhJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogKHJlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlcy50ZW1wRmlsZXNbMF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmYWlsOiBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaW1nRmlsZVVybCA9IGltZ0ZpbGUucGF0aDtcclxuICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgIHBsYXRlSW1hZ2VGaWxlVXJsOiBpbWdGaWxlVXJsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHd4LnNob3dMb2FkaW5nKHsgdGl0bGU6IFwi5Zu+54mH5LiK5Lyg5LitXCIsIG1hc2s6IHRydWUgfSk7XHJcbiAgICAgICAgICAgIGxldCBmaWxlSUQgPSBhd2FpdCB3YXJyYW50eVNlcnZpY2UudXBsb2FkSW1hZ2UodGhpcy5kYXRhLndhcnJhbnR5SUQsIGltZ0ZpbGVVcmwsIFwibGljZW5zZVBsYXRlXCIpO1xyXG4gICAgICAgICAgICAvL3d4LmhpZGVMb2FkaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgICAgICBwbGF0ZUltYWdlRmlsZUlEOiBmaWxlSURcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgd3guc2hvd0xvYWRpbmcoeyB0aXRsZTogXCLor4bliKvovabniYzkuK1cIiB9KVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhmaWxlSUQpO1xyXG4gICAgICAgICAgICBsZXQgcmV0ID0gYXdhaXQgd2FycmFudHlTZXJ2aWNlLmdldFBsYXRlTnVtYmVyKGZpbGVJRCk7XHJcbiAgICAgICAgICAgIHd4LmhpZGVMb2FkaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgICAgICBwbGF0ZU51bWJlcjogcmV0LnBsYXRlTnVtYmVyXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRodW1ibmFpbERhdGEgPSBhd2FpdCB0aGlzLmdldFRodW1ibmFpbChpbWdGaWxlVXJsKTtcclxuICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgIHRodW1ibmFpbDogdGh1bWJuYWlsRGF0YVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgd3guaGlkZUxvYWRpbmcoKTtcclxuICAgICAgICAgICAgd3guc2hvd01vZGFsKHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAn5o+Q56S6JyxcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6ICfnhafniYfor4bliKvlpLHotKXvvIzor7fph43mlrDkuIrkvKDvvIzmiJbmiYvliqjloavlhaXovabniYwnLFxyXG4gICAgICAgICAgICAgICAgc2hvd0NhbmNlbDogZmFsc2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIG9uUGxhdGVJbnB1dChlOiBldmVudC5JbnB1dEJsdXIpIHtcclxuICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICBwbGF0ZU51bWJlcjogZS5kZXRhaWwudmFsdWVcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcblxyXG4gICAgYXN5bmMgY2hvb3NlSW1hZ2UoZTogZXZlbnQuVG91Y2gpIHtcclxuICAgICAgICBpZiAodGhpcy5kYXRhLnZpZXdNb2RlKSB7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXRbXCJuYW1lXCJdO1xyXG4gICAgICAgICAgICB3eC5wcmV2aWV3SW1hZ2Uoe1xyXG4gICAgICAgICAgICAgICAgdXJsczogW3RoaXMuZGF0YVtuYW1lICsgXCJJbWFnZUZpbGVVcmxcIl1dLFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgaW1hZ2VOYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXRbXCJuYW1lXCJdO1xyXG4gICAgICAgIGxldCBpbWFnZUZpbGVQYXRoOiBzdHJpbmc7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgbGV0IGltYWdlRmlsZSA9IGF3YWl0IG5ldyBQcm9taXNlPHd4LkltYWdlRmlsZT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgd3guY2hvb3NlSW1hZ2Uoe1xyXG4gICAgICAgICAgICAgICAgICAgIHNpemVUeXBlOiBbJ29yaWdpbmFsJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMudGVtcEZpbGVzWzBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZmFpbDogZXJyID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpbWFnZUZpbGVQYXRoID0gaW1hZ2VGaWxlLnBhdGg7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHd4LnNob3dMb2FkaW5nKHsgXCJtYXNrXCI6IHRydWUsIFwidGl0bGVcIjogXCLlm77niYfkuIrkvKDkuK1cIiB9KVxyXG5cclxuICAgICAgICBsZXQgZmlsZUlEID0gYXdhaXQgd2FycmFudHlTZXJ2aWNlLnVwbG9hZEltYWdlKHRoaXMuZGF0YS53YXJyYW50eUlELCBpbWFnZUZpbGVQYXRoLCBpbWFnZU5hbWUpO1xyXG4gICAgICAgIGxldCBmaWxlSURQcm9wZXJ0eSA9IGltYWdlTmFtZSArIFwiSW1hZ2VGaWxlSURcIjtcclxuICAgICAgICBsZXQgZmlsZVVybFByb3BlcnR5ID0gaW1hZ2VOYW1lICsgXCJJbWFnZUZpbGVVcmxcIjtcclxuICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICBbZmlsZUlEUHJvcGVydHldOiBmaWxlSUQsXHJcbiAgICAgICAgICAgIFtmaWxlVXJsUHJvcGVydHldOiBpbWFnZUZpbGVQYXRoXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoKTtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgb25SZW1vdmVXYXJyYW50eSgpIHtcclxuICAgICAgICB3eC5zaG93TG9hZGluZyh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAn5o+Q5Lqk5LitJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgIGlzRGVsZXRpbmc6IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgICAgIGF3YWl0IHdhcnJhbnR5U2VydmljZS5yZW1vdmVXYXJyYW50eUl0ZW0odGhpcy5kYXRhLndhcnJhbnR5SUQpO1xyXG4gICAgICAgIGxldCBwYWdlcyA9IGdldEN1cnJlbnRQYWdlcygpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHBhZ2VzKTtcclxuICAgICAgICBsZXQgcGFnZSA9IHBhZ2VzW3BhZ2VzLmxlbmd0aCAtIDJdIGFzIHVua25vd24gYXMgV2FycmFudHlQYWdlO1xyXG4gICAgICAgIC8vYXdhaXQgcGFnZS5vbkl0ZW1SZW1vdmVkKHRoaXMuZGF0YS53YXJyYW50eUlEKTtcclxuICAgICAgICB3eC5oaWRlTG9hZGluZygpO1xyXG4gICAgICAgIHd4Lm5hdmlnYXRlQmFjayh7XHJcbiAgICAgICAgICAgIGRlbHRhOiAxLFxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIHByZXZpZXdJbWFnZShlOiBldmVudC5Ub3VjaCkge1xyXG4gICAgICAgIGxldCBuYW1lID0gZS5jdXJyZW50VGFyZ2V0LmRhdGFzZXRbXCJuYW1lXCJdO1xyXG4gICAgICAgIHd4LnByZXZpZXdJbWFnZSh7XHJcbiAgICAgICAgICAgIHVybHM6IFt0aGlzLmRhdGFbbmFtZSArIFwiSW1hZ2VGaWxlVXJsXCJdXVxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG5cclxuICAgIG9uU3VibWl0KGU6IGV2ZW50LlRvdWNoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRhdGEuc2hvcEFkZHJlc3MpIHtcclxuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgdGl0bGU6IFwi5o+Q56S6XCIsIGNvbnRlbnQ6IFwi6Zeo5bqX5Zyw5Z2A6L+Y5rKh5pyJ5aGr5YaZ5ZOm77yBXCIsIHNob3dDYW5jZWw6IGZhbHNlIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZGF0YS5zaG9wTmFtZSkge1xyXG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoeyB0aXRsZTogXCLmj5DnpLpcIiwgY29udGVudDogXCLpl6jlupflkI3np7Dov5jmsqHmnInloavlhpnlk6bvvIFcIiwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5kYXRhLnNob3BJbWFnZUZpbGVJRCkge1xyXG4gICAgICAgICAgICB3eC5zaG93TW9kYWwoeyB0aXRsZTogXCLmj5DnpLpcIiwgY29udGVudDogXCLpl6jlupfnhafniYfov5jmsqHmnInkuIrkvKDlk6bvvIFcIiwgc2hvd0NhbmNlbDogZmFsc2UgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5kYXRhLnBsYXRlTnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHd4LnNob3dNb2RhbCh7IHRpdGxlOiBcIuaPkOekulwiLCBjb250ZW50OiBcIui9pueJjOWPt+eggei/mOayoeacieWhq+WGmeWTpu+8gVwiLCBzaG93Q2FuY2VsOiBmYWxzZSB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmRhdGEudHlyZU1vZGVsSW1hZ2VGaWxlSUQpIHtcclxuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgdGl0bGU6IFwi5o+Q56S6XCIsIGNvbnRlbnQ6IFwi6L2u6IOO5Z6L5Y+354Wn54mH6L+Y5rKh5pyJ5LiK5Lyg5ZOm77yBXCIsIHNob3dDYW5jZWw6IGZhbHNlIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZGF0YS50eXJlSW5zdGFsbGF0aW9uSW1hZ2VGaWxlSUQpIHtcclxuICAgICAgICAgICAgd3guc2hvd01vZGFsKHsgdGl0bGU6IFwi5o+Q56S6XCIsIGNvbnRlbnQ6IFwi6L2u6IOO5a6J6KOF54Wn54mH6L+Y5rKh5pyJ5LiK5Lyg5ZOm77yBXCIsIHNob3dDYW5jZWw6IGZhbHNlIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB3eC5zaG93TW9kYWwoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ+aPkOekuicsXHJcbiAgICAgICAgICAgIGNvbnRlbnQ6ICfmj5DkuqTlkI7lsIbov5vlhaXlrqHmoLjnjq/oioLvvIzml6Dms5Xkv67mlLnvvIzor7fnoa7orqTotYTmlpnmmK/lkKbloavlhpnml6Dor68nLFxyXG4gICAgICAgICAgICBjb25maXJtVGV4dDogJ+aPkOS6pCcsXHJcbiAgICAgICAgICAgIGNhbmNlbFRleHQ6ICfov5Tlm54nLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcy5jb25maXJtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXBwcm92YWxTdGF0dXM6IEFwcHJvdmFsU3RhdHVzLnBlbmRpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbkRlbGV0ZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdNb2RlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHd4Lm5hdmlnYXRlQmFjayh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbHRhOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcbiAgICBhc3luYyBnZXRUaHVtYm5haWwoaW1hZ2VVcmw6IHN0cmluZyk6UHJvbWlzZTxzdHJpbmc+IHtcclxuICAgICAgICBjb25zdCBjdHggPSB3eC5jcmVhdGVDYW52YXNDb250ZXh0KCdjcm9wQ2FudmFzJyk7XHJcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZVVybCwgMCwgMCwgNTAsIDUwKTtcclxuICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpPT4gY3R4LmRyYXcoZmFsc2UsIHJlc29sdmUpKTtcclxuXHJcbiAgICAgICAgbGV0IHBhdGg6IHN0cmluZyA9IGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgd3guY2FudmFzVG9UZW1wRmlsZVBhdGgoe1xyXG4gICAgICAgICAgICAgICAgeDogMCxcclxuICAgICAgICAgICAgICAgIHk6IDAsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogNTAsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDUwLFxyXG4gICAgICAgICAgICAgICAgY2FudmFzSWQ6ICdjcm9wQ2FudmFzJyxcclxuICAgICAgICAgICAgICAgIGZpbGVUeXBlOiBcImpwZ1wiLFxyXG4gICAgICAgICAgICAgICAgcXVhbGl0eTogMSxcclxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHJlcyA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXMudGVtcEZpbGVQYXRoKTtcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmYWlsOiBlcnIgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KTtcclxuICAgICAgICBsZXQgbWFuYWdlciA9IHd4LmdldEZpbGVTeXN0ZW1NYW5hZ2VyKCk7XHJcbiAgICAgICAgbGV0IGRhdGE6c3RyaW5nID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUscmVqZWN0KT0+eyBtYW5hZ2VyLnJlYWRGaWxlKHtcclxuICAgICAgICAgICAgZmlsZVBhdGg6IHBhdGgsXHJcbiAgICAgICAgICAgIGVuY29kaW5nOiAnYmFzZTY0JyxcclxuICAgICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLmRhdGEgYXMgc3RyaW5nKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmFpbDogZXJyID0+IHtcclxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSl9KTtcclxuICAgICAgICByZXR1cm4gXCJkYXRhOmltYWdlL2pwZWc7YmFzZTY0LFwiK2RhdGE7XHJcbiAgICB9XHJcbn0pXHJcbiJdfQ==