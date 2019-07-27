import { ApprovalStatus } from "./warranty.service";

export class WarrantyListItem {
    public status: string;
    public statusIconClass: string;

    constructor(
    public warrantyID: string,
    public plateNumber: string,
    public description: string,
    public thumbnail: string,
    public approvalStatus: ApprovalStatus,
    public isDeleting: boolean = false) { 
        this.status = '';
        this.statusIconClass = '';
        if(this.approvalStatus == ApprovalStatus.drafting) {
            this.status = '继续填写';
        }
        else if(this.approvalStatus == ApprovalStatus.pending) {
            this.status = '审核中';
        }
        if(this.approvalStatus == ApprovalStatus.approved) {
            this.statusIconClass = 'icon-chenggong';
        }
        if(this.approvalStatus == ApprovalStatus.rejected) {
            this.statusIconClass = 'icon-tishi';
        }
    }
}