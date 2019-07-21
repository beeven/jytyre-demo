import { IMyApp } from "../../app";
import { formatTime } from '../../utils/util';
import { warrantyService } from './warranty.service';

const app = getApp<IMyApp>();



export interface WarrantyListItem {
    id: string;
    plate: string;
    description: string;
    thumbnail: string;
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
                description: `质保期限：${formatTime(item.startDate).substr(0,10)} 至 ${formatTime(item.endDate).substr(0,10)}`
            });
        })
        console.log(warrantyItems);

        wx.hideToast();
        this.setData({
            items: viewItems,
            loading: false
        })

    },

    addNew() {
        wx.navigateTo({
            url: './add/add?id=1'
        })
    }

})

