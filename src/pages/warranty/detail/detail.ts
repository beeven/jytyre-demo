import {warrantyService } from "../warranty.service";

interface WarrantyDetailPageData {
    warrantyID: string;
    plate: string;
    plateImageUrl: string;
    shopImageUrl: string;
    shopAddress: string;
    tyreImageUrls: string[];
    startDate: Date;
    endDate: Date
}


Page({
    data: {
        
    },
    async onLoad(options) {
        console.log(options);
        let ret = await warrantyService.getWarrantyItemDetail(options["id"]!);
        console.log(ret);
    }
})