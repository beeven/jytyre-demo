import { IMyApp } from "../../app";
import * as moment from "moment-mini-ts";
import { warrantyService, ApprovalStatus } from './warranty.service';

const app = getApp<IMyApp>();



export interface WarrantyListItem {
    id: string;
    plate: string;
    description: string;
    thumbnail: string;
    approvalStatus: ApprovalStatus;
}

interface WarrantyPageData {
    items: WarrantyListItem[],
    loading: boolean
}

Page({
    data: {
        loading: true,
        items: [
        ]
    } as WarrantyPageData,
    async onLoad() {
        await app.ensureLogin();
        wx.showToast({
            title: '数据加载中',
            icon: 'loading',
            duration: 10000
        });
        await warrantyService.samplingDatabase();
        let warrantyItems = await warrantyService.loadWarrantyItems();

        let viewItems: WarrantyListItem[] = [];
        warrantyItems.forEach(item => {
            viewItems.push({
                id: item._id,
                plate: item.plate,
                thumbnail: item.thumbnail,
                description: `质保期限： ${moment(item.endDate).format("YYYY-MM-DD")}`,
                approvalStatus: item.approvalStatus
            });
        })
        console.log(warrantyItems);

        wx.hideToast();
        this.setData({
            items: viewItems,
            loading: false
        })

    },

    onShow() {
        console.log(this.route);
    },

    onItemClicked(e: event.Touch) {
        console.log(e);
        let itemId = e.currentTarget.dataset["itemId"];
        wx.navigateTo({
            url: "./detail/detail?id=" + itemId,
        })
    },



    addNew() {
        wx.navigateTo({
            url: './add/add?id=1'
        })
    }

})

