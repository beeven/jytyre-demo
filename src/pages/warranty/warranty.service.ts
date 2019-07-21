import { IMyApp } from "../../app";
import * as moment from "moment-mini-ts";

const app = getApp<IMyApp>();

export enum ApprovalStatus {
    drafting = "drafting",
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}


export interface WarrantyItem {
    _id: string;
    thumbnail: string;
    plate: string;
    endDate: Date,
    approvalStatus: ApprovalStatus;
}

export interface WarrantyItemDetail {
    _id: string;
    plate?: string;
    plateImageUrl?: string;
    shopImageUrl?: string;
    shopName?: string;
    shopAddress?: string;
    shopLocation?: {
        latitude: string;
        longtitude: string;
    }
    tyreImageUrls: string[];
    datePurchased?: Date;
    endDate?: Date;
    approvalStatus: ApprovalStatus;
    dateCreated: Date;
    lastUpdated: Date;
    feedback?: string;
}


export class WarrantyService {
    constructor() {
        
    }

    private db = wx.cloud.database();

    async loadWarrantyItems(){
        
        let items = await this.db.collection("warranty").where({
            _openid: app.globalData.openid
        }).field({
            _id: true,
            thumbnail: true,
            plate: true,
            endDate: true,
            approvalStatus: true
        }).get();
        let ret: WarrantyItem[] = [];
        items.data.forEach(item => {
            ret.push({
                _id: item._id!.toString(),
                thumbnail: item["thumbnail"],
                plate: item["plate"],
                endDate: new Date(item["endDate"]),
                approvalStatus: item["approvalStatus"]
            })
        });
        return ret;
    }

    async getWarrantyItemDetail(id: string) {
        let ret = await this.db.collection("warranty").doc(id).get();
        return {
            _id: ret.data._id,
            plate: ret.data["plate"],
            plateImageUrl: ret.data["plateImageUrl"],
            shopAddress: ret.data["shopAddress"],
            shopImageUrl: ret.data["shopImageUrl"],
            shopName: ret.data["shopName"],
            tyreImageUrls: ret.data["tyreImageUrls"],
            datePurchased: new Date(ret.data["startDate"]),
            endDate: new Date(ret.data["endDate"]),
            approvalStatus: ret.data["approvalStatus"],
            dateCreated: new Date(ret.data["dateCreated"]),
            lastUpdated: new Date(ret.data["lastUpdated"]),
            shopLocation: ret.data["shopLocation"]
        } as WarrantyItemDetail;
    }

    async createWarrantyItem() {
        let ret = await this.db.collection("warranty").add({
            data: {
                approvalStatus: ApprovalStatus.drafting,
                dateCreated: new Date(),
                lastUpdated: new Date()
            } 
        });
        return ret._id;
    }

    async updateWarrantyItem(id: string) {
    }

    async removeWarrantyItem(id: string) {
        let ret = await this.db.collection("warranty").doc(id).remove();
        console.log(ret);
    }

    async samplingDatabase() {
        console.log("Sampling Data")
        let items = await this.loadWarrantyItems();
        if(items.length >= 3) { return; }
        for(let i=0;i<3;i++)
        {
            let startDate =  (moment().subtract(Math.round(Math.random()*100), "day"));
            let endDate = (moment().add(Math.round(Math.random()*100), "day"));
            let ret = await this.db.collection("warranty").add({
                data: {
                    thumbnail: defaultThumbnail,
                    plate: "粤A DE"+ Math.round((Math.random() * 1000)).toString().padStart(3,'0'),
                    startDate: startDate.toDate(),
                    endDate: endDate.toDate()
                } 
            });

            console.log(ret);
        }
        
    }
}


const defaultThumbnail = "data:image/png;base64,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"


export const warrantyService = new WarrantyService();