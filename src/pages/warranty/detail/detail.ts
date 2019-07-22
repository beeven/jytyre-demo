import {warrantyService, ApprovalStatus } from "../warranty.service";
import { WarrantyPageData, WarrantyPage} from '../warranty';

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
        wx.showLoading({
            title: '提交中'
        });
        await warrantyService.removeWarrantyItem(this.data.id);
        let pages = getCurrentPages();
        console.log(pages);
        let page = pages[pages.length-2] as unknown as WarrantyPage;
        await page.onItemRemoved(this.data.id);
        wx.hideLoading();
        wx.navigateBack({
            delta: 1,
        })
    }
})