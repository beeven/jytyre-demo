import {warrantyService, ApprovalStatus } from "../warranty.service";

interface WarrantyDetailPageData {
    id: string;
    plate: string;
    plateImageUrl: string;
    shopImageUrl: string;
    shopAddress: string;
    tyreImageUrls: string[];
    datePurchased: string;
    endDate: string,
    approvalStatus: ApprovalStatus,

}


Page({
    data: {
        
    } as WarrantyDetailPageData,
    async onLoad(options) {
        console.log(options);

        let ret = await warrantyService.getWarrantyItemDetail(options["id"]!);

        this.setData({
            id: ret._id,
            plate: ret.plate || "",
            plateImageUrl: ret.plateImageUrl || "",
            shopImageUrl: ret.shopImageUrl || "",
            shopAddress: ret.shopAddress || "",
            tyreImageUrls: ret.tyreImageUrls || [],
            datePurchased: ret.datePurchased!.toString() || "",
            endDate: ret.endDate!.toDateString() || "",
            approvalStatus: ret.approvalStatus || ApprovalStatus.drafting
        })
    },

    async onRemoveWarranty() {
        wx.showToast({
            title: '提交中',
            icon: 'loading',
            duration: 3000
        });
        await warrantyService.removeWarrantyItem(this.data.id);
        wx.navigateBack({
            delta: 1,
            complete: ()=>{
                wx.hideToast();
            }
        })
    }
})