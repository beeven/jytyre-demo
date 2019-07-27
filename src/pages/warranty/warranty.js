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
const moment = require("moment-mini-ts");
const warranty_service_1 = require("./warranty.service");
const warrantListItem_1 = require("./warrantListItem");
const app = getApp();
Page({
    data: {
        loading: true,
        items: [],
    },
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            yield app.ensureLogin();
            yield this.reloadList();
        });
    },
    onItemClicked(e) {
        console.log(e);
        let itemId = e.currentTarget.dataset["itemId"];
        wx.navigateTo({
            url: "./detail/detail?id=" + itemId,
        });
    },
    addNew() {
        return __awaiter(this, void 0, void 0, function* () {
            let warrantyID = yield warranty_service_1.warrantyService.createWarrantyItem();
            wx.navigateTo({
                url: `./detail/detail?id=${warrantyID}`
            });
        });
    },
    UpdateItem(id, item) {
        return __awaiter(this, void 0, void 0, function* () {
            let items = this.data.items;
            let i = items.findIndex(x => x.warrantyID === id);
            if (item.isDeleting) {
                if (i != -1) {
                    items.splice(i, 1);
                }
            }
            else {
                if (i != -1) {
                    items.splice(i, 1, item);
                }
                else {
                    items.push(item);
                }
            }
            this.setData({
                items: items
            });
        });
    },
    onPullDownRefresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.reloadList();
            wx.stopPullDownRefresh();
        });
    },
    reloadList() {
        return __awaiter(this, void 0, void 0, function* () {
            wx.showToast({
                title: '数据加载中',
                icon: 'loading',
                duration: 10000
            });
            let warrantyItems = yield warranty_service_1.warrantyService.loadWarrantyItems();
            let viewItems = [];
            warrantyItems.forEach(item => {
                let i = new warrantListItem_1.WarrantyListItem(item._id, item.plateNumber ? item.plateNumber : '车牌未填写', item.endDate ? `质保期限： ${moment(item.endDate).format("YYYY-MM-DD")}` : "", item.thumbnail, item.approvalStatus);
                viewItems.push(i);
            });
            console.log(viewItems);
            wx.hideToast();
            this.setData({
                items: viewItems,
                loading: false
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FycmFudHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3YXJyYW50eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQ0EseUNBQXlDO0FBQ3pDLHlEQUFxRTtBQUNyRSx1REFBcUQ7QUFFckQsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUM7QUFrQjdCLElBQUksQ0FBaUM7SUFDakMsSUFBSSxFQUFFO1FBQ0YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsRUFDTjtLQUNnQjtJQUNmLE1BQU07O1lBQ1IsTUFBTSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDeEIsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFNUIsQ0FBQztLQUFBO0lBRUQsYUFBYSxDQUFDLENBQWM7UUFDeEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLEVBQUUsQ0FBQyxVQUFVLENBQUM7WUFDVixHQUFHLEVBQUUscUJBQXFCLEdBQUcsTUFBTTtTQUN0QyxDQUFDLENBQUE7SUFDTixDQUFDO0lBSUssTUFBTTs7WUFDUixJQUFJLFVBQVUsR0FBRyxNQUFNLGtDQUFlLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUM1RCxFQUFFLENBQUMsVUFBVSxDQUFDO2dCQUNWLEdBQUcsRUFBRSxzQkFBc0IsVUFBVSxFQUFFO2FBQzFDLENBQUMsQ0FBQTtRQUNOLENBQUM7S0FBQTtJQUlLLFVBQVUsQ0FBQyxFQUFVLEVBQUUsSUFBc0I7O1lBQy9DLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQzVCLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQ1QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUE7aUJBQ3JCO2FBQ0o7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQ1QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUM1QjtxQkFBTTtvQkFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2lCQUNuQjthQUNKO1lBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDVCxLQUFLLEVBQUUsS0FBSzthQUNmLENBQUMsQ0FBQztRQUNQLENBQUM7S0FBQTtJQUVLLGlCQUFpQjs7WUFDbkIsTUFBTSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDeEIsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDN0IsQ0FBQztLQUFBO0lBRUssVUFBVTs7WUFFWixFQUFFLENBQUMsU0FBUyxDQUFDO2dCQUNULEtBQUssRUFBRSxPQUFPO2dCQUNkLElBQUksRUFBRSxTQUFTO2dCQUNmLFFBQVEsRUFBRSxLQUFLO2FBQ2xCLENBQUMsQ0FBQztZQUVILElBQUksYUFBYSxHQUFHLE1BQU0sa0NBQWUsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBRTlELElBQUksU0FBUyxHQUF1QixFQUFFLENBQUM7WUFDdkMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDekIsSUFBSSxDQUFDLEdBQUcsSUFBSSxrQ0FBZ0IsQ0FDeEIsSUFBSSxDQUFDLEdBQUcsRUFDUixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQzdDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUN4RSxJQUFJLENBQUMsU0FBUyxFQUNkLElBQUksQ0FBQyxjQUFjLENBQ3RCLENBQUM7Z0JBRUYsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQTtZQUNGLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFdkIsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQztnQkFDVCxLQUFLLEVBQUUsU0FBUztnQkFDaEIsT0FBTyxFQUFFLEtBQUs7YUFDakIsQ0FBQyxDQUFBO1FBQ04sQ0FBQztLQUFBO0NBRUosQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSU15QXBwIH0gZnJvbSBcIi4uLy4uL2FwcFwiO1xyXG5pbXBvcnQgKiBhcyBtb21lbnQgZnJvbSBcIm1vbWVudC1taW5pLXRzXCI7XHJcbmltcG9ydCB7IHdhcnJhbnR5U2VydmljZSwgQXBwcm92YWxTdGF0dXMgfSBmcm9tICcuL3dhcnJhbnR5LnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBXYXJyYW50eUxpc3RJdGVtIH0gZnJvbSBcIi4vd2FycmFudExpc3RJdGVtXCI7XHJcblxyXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgV2FycmFudHlQYWdlRGF0YSB7XHJcbiAgICBpdGVtczogV2FycmFudHlMaXN0SXRlbVtdLFxyXG4gICAgbG9hZGluZzogYm9vbGVhblxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFdhcnJhbnR5UGFnZSB7XHJcbiAgICBvbkl0ZW1DbGlja2VkKGU6IGFueSk6IHZvaWQ7XHJcbiAgICBhZGROZXcoKTogdm9pZDtcclxuICAgIHJlbG9hZExpc3QoKTogdm9pZDtcclxuICAgIFVwZGF0ZUl0ZW0oaWQ6IHN0cmluZywgaXRlbTogV2FycmFudHlMaXN0SXRlbSk6IHZvaWQ7XHJcbn1cclxuXHJcblBhZ2U8V2FycmFudHlQYWdlRGF0YSwgV2FycmFudHlQYWdlPih7XHJcbiAgICBkYXRhOiB7XHJcbiAgICAgICAgbG9hZGluZzogdHJ1ZSxcclxuICAgICAgICBpdGVtczogW1xyXG4gICAgICAgIF0sXHJcbiAgICB9IGFzIFdhcnJhbnR5UGFnZURhdGEsXHJcbiAgICBhc3luYyBvbkxvYWQoKSB7XHJcbiAgICAgICAgYXdhaXQgYXBwLmVuc3VyZUxvZ2luKCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5yZWxvYWRMaXN0KCk7XHJcblxyXG4gICAgfSxcclxuXHJcbiAgICBvbkl0ZW1DbGlja2VkKGU6IGV2ZW50LlRvdWNoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZSk7XHJcbiAgICAgICAgbGV0IGl0ZW1JZCA9IGUuY3VycmVudFRhcmdldC5kYXRhc2V0W1wiaXRlbUlkXCJdO1xyXG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xyXG4gICAgICAgICAgICB1cmw6IFwiLi9kZXRhaWwvZGV0YWlsP2lkPVwiICsgaXRlbUlkLFxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG5cclxuXHJcblxyXG4gICAgYXN5bmMgYWRkTmV3KCkge1xyXG4gICAgICAgIGxldCB3YXJyYW50eUlEID0gYXdhaXQgd2FycmFudHlTZXJ2aWNlLmNyZWF0ZVdhcnJhbnR5SXRlbSgpO1xyXG4gICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xyXG4gICAgICAgICAgICB1cmw6IGAuL2RldGFpbC9kZXRhaWw/aWQ9JHt3YXJyYW50eUlEfWBcclxuICAgICAgICB9KVxyXG4gICAgfSxcclxuXHJcblxyXG5cclxuICAgIGFzeW5jIFVwZGF0ZUl0ZW0oaWQ6IHN0cmluZywgaXRlbTogV2FycmFudHlMaXN0SXRlbSkge1xyXG4gICAgICAgIGxldCBpdGVtcyA9IHRoaXMuZGF0YS5pdGVtcztcclxuICAgICAgICBsZXQgaSA9IGl0ZW1zLmZpbmRJbmRleCh4ID0+IHgud2FycmFudHlJRCA9PT0gaWQpO1xyXG4gICAgICAgIGlmIChpdGVtLmlzRGVsZXRpbmcpIHtcclxuICAgICAgICAgICAgaWYgKGkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpLCAxKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpLCAxLCBpdGVtKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zLnB1c2goaXRlbSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgaXRlbXM6IGl0ZW1zXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIG9uUHVsbERvd25SZWZyZXNoKCkge1xyXG4gICAgICAgIGF3YWl0IHRoaXMucmVsb2FkTGlzdCgpO1xyXG4gICAgICAgIHd4LnN0b3BQdWxsRG93blJlZnJlc2goKTtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgcmVsb2FkTGlzdCgpIHtcclxuXHJcbiAgICAgICAgd3guc2hvd1RvYXN0KHtcclxuICAgICAgICAgICAgdGl0bGU6ICfmlbDmja7liqDovb3kuK0nLFxyXG4gICAgICAgICAgICBpY29uOiAnbG9hZGluZycsXHJcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vYXdhaXQgd2FycmFudHlTZXJ2aWNlLnNhbXBsaW5nRGF0YWJhc2UoKTtcclxuICAgICAgICBsZXQgd2FycmFudHlJdGVtcyA9IGF3YWl0IHdhcnJhbnR5U2VydmljZS5sb2FkV2FycmFudHlJdGVtcygpO1xyXG5cclxuICAgICAgICBsZXQgdmlld0l0ZW1zOiBXYXJyYW50eUxpc3RJdGVtW10gPSBbXTtcclxuICAgICAgICB3YXJyYW50eUl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBpID0gbmV3IFdhcnJhbnR5TGlzdEl0ZW0oXHJcbiAgICAgICAgICAgICAgICBpdGVtLl9pZCxcclxuICAgICAgICAgICAgICAgIGl0ZW0ucGxhdGVOdW1iZXIgPyBpdGVtLnBsYXRlTnVtYmVyIDogJ+i9pueJjOacquWhq+WGmScsXHJcbiAgICAgICAgICAgICAgICBpdGVtLmVuZERhdGUgPyBg6LSo5L+d5pyf6ZmQ77yaICR7bW9tZW50KGl0ZW0uZW5kRGF0ZSkuZm9ybWF0KFwiWVlZWS1NTS1ERFwiKX1gIDogXCJcIixcclxuICAgICAgICAgICAgICAgIGl0ZW0udGh1bWJuYWlsLFxyXG4gICAgICAgICAgICAgICAgaXRlbS5hcHByb3ZhbFN0YXR1c1xyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgdmlld0l0ZW1zLnB1c2goaSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zb2xlLmxvZyh2aWV3SXRlbXMpO1xyXG5cclxuICAgICAgICB3eC5oaWRlVG9hc3QoKTtcclxuICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICBpdGVtczogdmlld0l0ZW1zLFxyXG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG59KVxyXG5cclxuIl19