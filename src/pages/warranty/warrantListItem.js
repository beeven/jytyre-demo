"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const warranty_service_1 = require("./warranty.service");
class WarrantyListItem {
    constructor(warrantyID, plateNumber, description, thumbnail, approvalStatus, isDeleting = false) {
        this.warrantyID = warrantyID;
        this.plateNumber = plateNumber;
        this.description = description;
        this.thumbnail = thumbnail;
        this.approvalStatus = approvalStatus;
        this.isDeleting = isDeleting;
        this.status = '';
        this.statusIconClass = '';
        if (this.approvalStatus == warranty_service_1.ApprovalStatus.drafting) {
            this.status = '继续填写';
        }
        else if (this.approvalStatus == warranty_service_1.ApprovalStatus.pending) {
            this.status = '审核中';
        }
        if (this.approvalStatus == warranty_service_1.ApprovalStatus.approved) {
            this.statusIconClass = 'icon-chenggong';
        }
        if (this.approvalStatus == warranty_service_1.ApprovalStatus.rejected) {
            this.statusIconClass = 'icon-tishi';
        }
    }
}
exports.WarrantyListItem = WarrantyListItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FycmFudExpc3RJdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsid2FycmFudExpc3RJdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEseURBQW9EO0FBRXBELE1BQWEsZ0JBQWdCO0lBSXpCLFlBQ08sVUFBa0IsRUFDbEIsV0FBbUIsRUFDbkIsV0FBbUIsRUFDbkIsU0FBaUIsRUFDakIsY0FBOEIsRUFDOUIsYUFBc0IsS0FBSztRQUwzQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQ2xCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ25CLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzlCLGVBQVUsR0FBVixVQUFVLENBQWlCO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO1FBQzFCLElBQUcsSUFBSSxDQUFDLGNBQWMsSUFBSSxpQ0FBYyxDQUFDLFFBQVEsRUFBRTtZQUMvQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztTQUN4QjthQUNJLElBQUcsSUFBSSxDQUFDLGNBQWMsSUFBSSxpQ0FBYyxDQUFDLE9BQU8sRUFBRTtZQUNuRCxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztTQUN2QjtRQUNELElBQUcsSUFBSSxDQUFDLGNBQWMsSUFBSSxpQ0FBYyxDQUFDLFFBQVEsRUFBRTtZQUMvQyxJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDO1NBQzNDO1FBQ0QsSUFBRyxJQUFJLENBQUMsY0FBYyxJQUFJLGlDQUFjLENBQUMsUUFBUSxFQUFFO1lBQy9DLElBQUksQ0FBQyxlQUFlLEdBQUcsWUFBWSxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztDQUNKO0FBMUJELDRDQTBCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcHJvdmFsU3RhdHVzIH0gZnJvbSBcIi4vd2FycmFudHkuc2VydmljZVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFdhcnJhbnR5TGlzdEl0ZW0ge1xyXG4gICAgcHVibGljIHN0YXR1czogc3RyaW5nO1xyXG4gICAgcHVibGljIHN0YXR1c0ljb25DbGFzczogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIHdhcnJhbnR5SUQ6IHN0cmluZyxcclxuICAgIHB1YmxpYyBwbGF0ZU51bWJlcjogc3RyaW5nLFxyXG4gICAgcHVibGljIGRlc2NyaXB0aW9uOiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgdGh1bWJuYWlsOiBzdHJpbmcsXHJcbiAgICBwdWJsaWMgYXBwcm92YWxTdGF0dXM6IEFwcHJvdmFsU3RhdHVzLFxyXG4gICAgcHVibGljIGlzRGVsZXRpbmc6IGJvb2xlYW4gPSBmYWxzZSkgeyBcclxuICAgICAgICB0aGlzLnN0YXR1cyA9ICcnO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzSWNvbkNsYXNzID0gJyc7XHJcbiAgICAgICAgaWYodGhpcy5hcHByb3ZhbFN0YXR1cyA9PSBBcHByb3ZhbFN0YXR1cy5kcmFmdGluZykge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9ICfnu6fnu63loavlhpknO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmKHRoaXMuYXBwcm92YWxTdGF0dXMgPT0gQXBwcm92YWxTdGF0dXMucGVuZGluZykge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9ICflrqHmoLjkuK0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0aGlzLmFwcHJvdmFsU3RhdHVzID09IEFwcHJvdmFsU3RhdHVzLmFwcHJvdmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdHVzSWNvbkNsYXNzID0gJ2ljb24tY2hlbmdnb25nJztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodGhpcy5hcHByb3ZhbFN0YXR1cyA9PSBBcHByb3ZhbFN0YXR1cy5yZWplY3RlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXR1c0ljb25DbGFzcyA9ICdpY29uLXRpc2hpJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXX0=