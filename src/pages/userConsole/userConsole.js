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
const app = getApp();
Page({
    data: {
        avatarUrl: "/assets/user-unlogin.png",
        nickName: "未登录",
        phoneNumber: "",
        hasPhoneNumber: false,
        editPhoneNumber: false
    },
    onLoad() {
        return __awaiter(this, void 0, void 0, function* () {
            if (app.globalData.userInfo) {
                if (app.globalData.phoneNumber) {
                    this.setData({
                        nickName: app.globalData.userInfo.nickName,
                        avatarUrl: app.globalData.userInfo.avatarUrl,
                        phoneNumber: app.globalData.phoneNumber,
                        hasPhoneNumber: true
                    });
                }
                else {
                    this.setData({
                        nickName: app.globalData.userInfo.nickName,
                        avatarUrl: app.globalData.userInfo.avatarUrl,
                    });
                    try {
                        yield fillPhoneNumber(this);
                    }
                    catch (err) {
                        this.setData({
                            editPhoneNumber: true
                        });
                    }
                }
            }
            else {
                yield app.ensureLogin();
                let info = yield app.getUserInfo();
                this.setData({
                    nickName: info.nickName,
                    avatarUrl: info.avatarUrl
                });
                try {
                    yield fillPhoneNumber(this);
                }
                catch (err) {
                    this.setData({
                        editPhoneNumber: true
                    });
                }
            }
        });
    },
    inputedit(e) {
        let value = e.detail.value;
        this.setData({
            phoneNumber: value
        });
    },
    saveInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            this.setData({
                hasPhoneNumber: true,
                editPhoneNumber: false
            });
            app.globalData.phoneNumber = this.data.phoneNumber;
            yield saveUserInfo();
        });
    },
    editNumber() {
        this.setData({
            hasPhoneNumber: false
        });
    },
    onGetPhoneNumber(e) {
        return __awaiter(this, void 0, void 0, function* () {
            if (e.detail.errMsg) {
                wx.showToast({
                    title: '无法获得授权，请输入',
                    icon: 'none',
                    duration: 1000
                });
                this.setData({
                    editPhoneNumber: true
                });
            }
            else {
                let phoneNumber;
                if (e.detail.cloudID) {
                    phoneNumber = yield getPhoneNumberCloud(e.detail.cloudID);
                }
                else {
                    phoneNumber = yield getPhoneNumberServer(e.detail.encryptedData, e.detail.iv);
                }
                this.setData({
                    phoneNumber: phoneNumber,
                    hasPhoneNumber: true,
                    editPhoneNumber: false
                });
            }
        });
    }
});
function fillPhoneNumber(page) {
    return __awaiter(this, void 0, void 0, function* () {
        let phoneNumber = "";
        let user = yield loadUserInfo();
        if (user.phoneNumber) {
            phoneNumber = user.phoneNumber;
            app.globalData.phoneNumber = phoneNumber;
            page.setData({
                phoneNumber: phoneNumber,
                hasPhoneNumber: true
            });
            return phoneNumber;
        }
        else {
            throw new Error("phoneNumber not found");
        }
    });
}
function saveUserInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        wx.showLoading({
            'title': '保存中'
        });
        if (app.globalData.useCloud && app.globalData.openid) {
            const db = wx.cloud.database();
            yield db.collection("users").doc(app.globalData.openid).set({
                data: {
                    phoneNumber: app.globalData.phoneNumber,
                    nickName: app.globalData.userInfo.nickName,
                    avatarUrl: app.globalData.userInfo.avatarUrl,
                }
            });
            wx.hideLoading();
            wx.showToast({
                title: '已保存',
                icon: 'success',
                duration: 1000
            });
        }
        else {
            wx.request({
                url: "https://xxxxx/xxx",
                method: "POST",
                data: ""
            });
        }
    });
}
function loadUserInfo() {
    return __awaiter(this, void 0, void 0, function* () {
        if (app.globalData.useCloud && app.globalData.openid) {
            const db = wx.cloud.database();
            let res = yield db.collection("users").doc(app.globalData.openid).get();
            console.log(res.data);
            return res.data;
        }
        else {
            wx.request({
                url: "https://xxxxx/xxx",
                method: "POST",
                data: "info"
            });
            throw new Error("Not implemented.");
        }
    });
}
function getPhoneNumberCloud(code) {
    return __awaiter(this, void 0, void 0, function* () {
        let ret = yield wx.cloud.callFunction({
            name: "updatePhoneNumber",
            data: {
                openid: app.globalData.openid,
                phoneNumber: wx.cloud.cloudID(code)
            }
        });
        return ret.result;
    });
}
function getPhoneNumberServer(encryptedData, iv) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new Promise((resolve, reject) => {
            wx.request({
                url: "http://xxxx/xxx",
                method: "POST",
                data: {
                    openid: app.globalData.openid,
                    encryptedData: encryptedData,
                    iv: iv
                },
                success: (res) => {
                    resolve(res.data);
                },
                fail: err => {
                    reject(err);
                }
            });
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlckNvbnNvbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ1c2VyQ29uc29sZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBS0EsTUFBTSxHQUFHLEdBQUcsTUFBTSxFQUFVLENBQUM7QUFZN0IsSUFBSSxDQUFDO0lBQ0QsSUFBSSxFQUFHO1FBQ0gsU0FBUyxFQUFFLDBCQUEwQjtRQUNyQyxRQUFRLEVBQUUsS0FBSztRQUNmLFdBQVcsRUFBRSxFQUFFO1FBQ2YsY0FBYyxFQUFFLEtBQUs7UUFDckIsZUFBZSxFQUFFLEtBQUs7S0FDekI7SUFFSyxNQUFNOztZQUNSLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUU7Z0JBQ3pCLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUU7b0JBQzVCLElBQUksQ0FBQyxPQUFPLENBQUM7d0JBQ1QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVE7d0JBQzFDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTO3dCQUM1QyxXQUFXLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXO3dCQUN2QyxjQUFjLEVBQUUsSUFBSTtxQkFDdkIsQ0FBQyxDQUFDO2lCQUNOO3FCQUFNO29CQUNILElBQUksQ0FBQyxPQUFPLENBQUM7d0JBQ1QsUUFBUSxFQUFFLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVE7d0JBQzFDLFNBQVMsRUFBRSxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTO3FCQUMvQyxDQUFDLENBQUM7b0JBQ0gsSUFBSTt3QkFDQSxNQUFNLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztxQkFDL0I7b0JBQUMsT0FBTSxHQUFHLEVBQUU7d0JBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQzs0QkFDVCxlQUFlLEVBQUUsSUFBSTt5QkFDeEIsQ0FBQyxDQUFDO3FCQUNOO2lC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LEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNO29CQUM3QixhQUFhLEVBQUUsYUFBYTtvQkFDNUIsRUFBRSxFQUFFLEVBQUU7aUJBQ1Q7Z0JBQ0QsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFDLEVBQUU7b0JBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDckIsQ0FBQztnQkFDRCxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUU7b0JBQ1IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNoQixDQUFDO2FBQ0osQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUE7SUFFTixDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJTXlBcHAgfSBmcm9tIFwiLi4vLi4vYXBwXCI7XHJcblxyXG4vLyBwYWdlcy91c2VyQ29uc29sZS91c2VyQ29uc29sZS5qc1xyXG5cclxuXHJcbmNvbnN0IGFwcCA9IGdldEFwcDxJTXlBcHA+KCk7XHJcblxyXG5pbnRlcmZhY2UgVXNlckNvbnNvbGVEYXRhIHtcclxuICAgIGF2YXRhclVybDogc3RyaW5nO1xyXG4gICAgbmlja05hbWU6IHN0cmluZztcclxuICAgIHBob25lTnVtYmVyOiBzdHJpbmc7XHJcbiAgICBoYXNQaG9uZU51bWJlcjogYm9vbGVhbjtcclxuICAgIGVkaXRQaG9uZU51bWJlcjogYm9vbGVhblxyXG59XHJcblxyXG5cclxuXHJcblBhZ2Uoe1xyXG4gICAgZGF0YTogIHtcclxuICAgICAgICBhdmF0YXJVcmw6IFwiL2Fzc2V0cy91c2VyLXVubG9naW4ucG5nXCIsXHJcbiAgICAgICAgbmlja05hbWU6IFwi5pyq55m75b2VXCIsXHJcbiAgICAgICAgcGhvbmVOdW1iZXI6IFwiXCIsXHJcbiAgICAgICAgaGFzUGhvbmVOdW1iZXI6IGZhbHNlLFxyXG4gICAgICAgIGVkaXRQaG9uZU51bWJlcjogZmFsc2VcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgb25Mb2FkKCkge1xyXG4gICAgICAgIGlmIChhcHAuZ2xvYmFsRGF0YS51c2VySW5mbykge1xyXG4gICAgICAgICAgICBpZiAoYXBwLmdsb2JhbERhdGEucGhvbmVOdW1iZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgICAgICAgICAgbmlja05hbWU6IGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvLm5pY2tOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogYXBwLmdsb2JhbERhdGEudXNlckluZm8uYXZhdGFyVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIHBob25lTnVtYmVyOiBhcHAuZ2xvYmFsRGF0YS5waG9uZU51bWJlcixcclxuICAgICAgICAgICAgICAgICAgICBoYXNQaG9uZU51bWJlcjogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICAgICAgICAgIG5pY2tOYW1lOiBhcHAuZ2xvYmFsRGF0YS51c2VySW5mby5uaWNrTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvLmF2YXRhclVybCxcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBmaWxsUGhvbmVOdW1iZXIodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRQaG9uZU51bWJlcjogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXdhaXQgYXBwLmVuc3VyZUxvZ2luKCk7XHJcbiAgICAgICAgICAgIGxldCBpbmZvID0gYXdhaXQgYXBwLmdldFVzZXJJbmZvKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICAgICAgbmlja05hbWU6IGluZm8ubmlja05hbWUsXHJcbiAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IGluZm8uYXZhdGFyVXJsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgYXdhaXQgZmlsbFBob25lTnVtYmVyKHRoaXMpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZWRpdFBob25lTnVtYmVyOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBpbnB1dGVkaXQoZTogZXZlbnQuSW5wdXQpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBlLmRldGFpbC52YWx1ZTtcclxuICAgICAgICB0aGlzLnNldERhdGEoe1xyXG4gICAgICAgICAgICBwaG9uZU51bWJlcjogdmFsdWVcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgYXN5bmMgc2F2ZUluZm8oKSB7XHJcbiAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgaGFzUGhvbmVOdW1iZXI6IHRydWUsXHJcbiAgICAgICAgICAgIGVkaXRQaG9uZU51bWJlcjogZmFsc2VcclxuICAgICAgICB9KVxyXG4gICAgICAgIGFwcC5nbG9iYWxEYXRhLnBob25lTnVtYmVyID0gdGhpcy5kYXRhLnBob25lTnVtYmVyO1xyXG4gICAgICAgIGF3YWl0IHNhdmVVc2VySW5mbygpO1xyXG4gICAgfSxcclxuXHJcbiAgICBlZGl0TnVtYmVyKCkge1xyXG4gICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgIGhhc1Bob25lTnVtYmVyOiBmYWxzZVxyXG4gICAgICAgIH0pXHJcbiAgICB9LFxyXG5cclxuICAgIGFzeW5jIG9uR2V0UGhvbmVOdW1iZXIoZTogZXZlbnQuQnV0dG9uR2V0UGhvbmVOdW1iZXIpIHtcclxuICAgICAgICBpZihlLmRldGFpbC5lcnJNc2cpIHtcclxuICAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAn5peg5rOV6I635b6X5o6I5p2D77yM6K+36L6T5YWlJyxcclxuICAgICAgICAgICAgICAgIGljb246ICdub25lJyxcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAwXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgICAgICBlZGl0UGhvbmVOdW1iZXI6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHBob25lTnVtYmVyOnN0cmluZztcclxuICAgICAgICAgICAgaWYoZS5kZXRhaWwuY2xvdWRJRCkge1xyXG4gICAgICAgICAgICAgICAgcGhvbmVOdW1iZXIgPSBhd2FpdCBnZXRQaG9uZU51bWJlckNsb3VkKGUuZGV0YWlsLmNsb3VkSUQpXHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBob25lTnVtYmVyID0gYXdhaXQgZ2V0UGhvbmVOdW1iZXJTZXJ2ZXIoZS5kZXRhaWwuZW5jcnlwdGVkRGF0YSEsIGUuZGV0YWlsLml2ISk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcclxuICAgICAgICAgICAgICAgIHBob25lTnVtYmVyOiBwaG9uZU51bWJlcixcclxuICAgICAgICAgICAgICAgIGhhc1Bob25lTnVtYmVyOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZWRpdFBob25lTnVtYmVyOiBmYWxzZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5cclxuXHJcblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmlsbFBob25lTnVtYmVyKHBhZ2U6IFBhZ2UuUGFnZUluc3RhbmNlPFVzZXJDb25zb2xlRGF0YT4pIHtcclxuXHJcbiAgICBsZXQgcGhvbmVOdW1iZXIgPSBcIlwiO1xyXG4gICAgbGV0IHVzZXIgPSBhd2FpdCBsb2FkVXNlckluZm8oKTtcclxuICAgIGlmICh1c2VyIS5waG9uZU51bWJlcikge1xyXG4gICAgICAgIHBob25lTnVtYmVyID0gdXNlciEucGhvbmVOdW1iZXJcclxuICAgICAgICBhcHAuZ2xvYmFsRGF0YS5waG9uZU51bWJlciA9IHBob25lTnVtYmVyO1xyXG4gICAgICAgIHBhZ2Uuc2V0RGF0YSh7XHJcbiAgICAgICAgICAgIHBob25lTnVtYmVyOiBwaG9uZU51bWJlcixcclxuICAgICAgICAgICAgaGFzUGhvbmVOdW1iZXI6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gcGhvbmVOdW1iZXI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInBob25lTnVtYmVyIG5vdCBmb3VuZFwiKTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHNhdmVVc2VySW5mbygpIHtcclxuICAgIHd4LnNob3dMb2FkaW5nKHtcclxuICAgICAgICAndGl0bGUnOiAn5L+d5a2Y5LitJ1xyXG4gICAgfSk7XHJcbiAgICBpZiAoYXBwLmdsb2JhbERhdGEudXNlQ2xvdWQgJiYgYXBwLmdsb2JhbERhdGEub3BlbmlkKSB7XHJcbiAgICAgICAgY29uc3QgZGIgPSB3eC5jbG91ZC5kYXRhYmFzZSgpO1xyXG4gICAgICAgIGF3YWl0IGRiLmNvbGxlY3Rpb24oXCJ1c2Vyc1wiKS5kb2MoYXBwLmdsb2JhbERhdGEub3BlbmlkKS5zZXQoe1xyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBwaG9uZU51bWJlcjogYXBwLmdsb2JhbERhdGEucGhvbmVOdW1iZXIsXHJcbiAgICAgICAgICAgICAgICBuaWNrTmFtZTogYXBwLmdsb2JhbERhdGEudXNlckluZm8hLm5pY2tOYW1lLFxyXG4gICAgICAgICAgICAgICAgYXZhdGFyVXJsOiBhcHAuZ2xvYmFsRGF0YS51c2VySW5mbyEuYXZhdGFyVXJsLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgd3guaGlkZUxvYWRpbmcoKTtcclxuICAgICAgICB3eC5zaG93VG9hc3Qoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ+W3suS/neWtmCcsXHJcbiAgICAgICAgICAgIGljb246ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgZHVyYXRpb246IDEwMDBcclxuICAgICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBUT0RPOiBzYXZlIHVzZXIgdG8gc2VydmVyIGxvZ2ljXHJcbiAgICAgICAgd3gucmVxdWVzdCh7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwczovL3h4eHh4L3h4eFwiLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBkYXRhOiBcIlwiXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZFVzZXJJbmZvKCkge1xyXG4gICAgaWYgKGFwcC5nbG9iYWxEYXRhLnVzZUNsb3VkICYmIGFwcC5nbG9iYWxEYXRhLm9wZW5pZCkge1xyXG4gICAgICAgIGNvbnN0IGRiID0gd3guY2xvdWQuZGF0YWJhc2UoKTtcclxuICAgICAgICBsZXQgcmVzID0gYXdhaXQgZGIuY29sbGVjdGlvbihcInVzZXJzXCIpLmRvYyhhcHAuZ2xvYmFsRGF0YS5vcGVuaWQpLmdldCgpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcclxuICAgICAgICByZXR1cm4gcmVzLmRhdGE7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIFRPRE86IGxvYWQgdXNlciBmcm9tIHNlcnZlciBsb2dpY1xyXG4gICAgICAgIHd4LnJlcXVlc3Qoe1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly94eHh4eC94eHhcIixcclxuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgZGF0YTogXCJpbmZvXCJcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQuXCIpXHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0UGhvbmVOdW1iZXJDbG91ZChjb2RlOiBzdHJpbmcpIHtcclxuICAgIGxldCByZXQgPSBhd2FpdCB3eC5jbG91ZC5jYWxsRnVuY3Rpb24oe1xyXG4gICAgICAgICAgICBuYW1lOiBcInVwZGF0ZVBob25lTnVtYmVyXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIG9wZW5pZDogYXBwLmdsb2JhbERhdGEub3BlbmlkLFxyXG4gICAgICAgICAgICAgICAgcGhvbmVOdW1iZXI6IHd4LmNsb3VkLmNsb3VkSUQoY29kZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgcmV0dXJuIHJldC5yZXN1bHQ7XHJcbn0gXHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRQaG9uZU51bWJlclNlcnZlcihlbmNyeXB0ZWREYXRhOiBzdHJpbmcsIGl2OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCk9PntcclxuICAgICAgICB3eC5yZXF1ZXN0KHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly94eHh4L3h4eFwiLFxyXG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBvcGVuaWQ6IGFwcC5nbG9iYWxEYXRhLm9wZW5pZCxcclxuICAgICAgICAgICAgICAgIGVuY3J5cHRlZERhdGE6IGVuY3J5cHRlZERhdGEsXHJcbiAgICAgICAgICAgICAgICBpdjogaXZcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3VjY2VzczogKHJlcyk9PntcclxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzLmRhdGEpICAgIFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmYWlsOiBlcnIgPT57XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSlcclxuICAgIFxyXG59Il19