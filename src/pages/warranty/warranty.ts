import { IMyApp } from "../../app";
import * as moment from "moment-mini-ts";
import { warrantyService, ApprovalStatus } from './warranty.service';

const app = getApp<IMyApp>();



export interface WarrantyListItem {
    id: string;
    plateNumber: string;
    description: string;
    thumbnail: string;
    approvalStatus: ApprovalStatus;
}

export interface WarrantyPageData {
    items: WarrantyListItem[],
    loading: boolean
}

export interface WarrantyPage {
    onItemClicked(e: any): void;
    addNew(): void;
    onItemRemoved(id: string): void;
    reloadList(): void;
}

Page<WarrantyPageData, WarrantyPage>({
    data: {
        loading: true,
        items: [
        ]
    } as WarrantyPageData,
    async onLoad() {
        await app.ensureLogin();
        await this.reloadList();

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



    async addNew() {
        let warrantyID = await warrantyService.createWarrantyItem();
        wx.navigateTo({
            url: `./add/add?id=${warrantyID}`
        })
    },


    async onItemRemoved(id: string) {
        let items = this.data.items;
        let i = items.findIndex(x => x.id == id);
        items.splice(i,1);
        this.setData({
            items: items
        });
    },

    async onPullDownRefresh() {
        await this.reloadList();
        wx.stopPullDownRefresh();
    },

    async reloadList() {

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
                plateNumber: item.plateNumber,
                thumbnail: item.thumbnail,
                description: item.endDate? `质保期限： ${moment(item.endDate).format("YYYY-MM-DD")}` : "",
                approvalStatus: item.approvalStatus
            });
        })
        console.log(warrantyItems);

        wx.hideToast();
        this.setData({
            items: viewItems,
            loading: false
        })
    }

})

