import { IMyApp } from "../../app";

// pages/userConsole/userConsole.js


const app = getApp<IMyApp>();

interface UserConsoleData {
    avatarUrl: string;
    nickName: string;
    phoneNumber: string;
    hasPhoneNumber: boolean;
    editPhoneNumber: boolean
}



Page({
    data:  {
        avatarUrl: "/assets/user-unlogin.png",
        nickName: "未登录",
        phoneNumber: "",
        hasPhoneNumber: false,
        editPhoneNumber: false
    },

    async onLoad() {
        if (app.globalData.userInfo) {
            if (app.globalData.phoneNumber) {
                this.setData({
                    nickName: app.globalData.userInfo.nickName,
                    avatarUrl: app.globalData.userInfo.avatarUrl,
                    phoneNumber: app.globalData.phoneNumber,
                    hasPhoneNumber: true
                });
            } else {
                this.setData({
                    nickName: app.globalData.userInfo.nickName,
                    avatarUrl: app.globalData.userInfo.avatarUrl,
                });
                try {
                    await fillPhoneNumber(this);
                } catch(err) {
                    this.setData({
                        editPhoneNumber: true
                    });
                }
            }
        } else {
            await app.ensureLogin();
            let info = await app.getUserInfo();

            this.setData({
                nickName: info.nickName,
                avatarUrl: info.avatarUrl
            });
            try {
             await fillPhoneNumber(this);
            } catch (err) {
                this.setData({
                    editPhoneNumber: true
                })
            }
        }
    },

    inputedit(e: event.Input) {
        let value = e.detail.value;
        this.setData({
            phoneNumber: value
        });
    },

    async saveInfo() {
        this.setData({
            hasPhoneNumber: true,
            editPhoneNumber: false
        })
        app.globalData.phoneNumber = this.data.phoneNumber;
        await saveUserInfo();
    },

    editNumber() {
        this.setData({
            hasPhoneNumber: false
        })
    },

    async onGetPhoneNumber(e: event.ButtonGetPhoneNumber) {
        if(e.detail.errMsg) {
            wx.showToast({
                title: '无法获得授权，请输入',
                icon: 'none',
                duration: 1000
            })
            this.setData({
                editPhoneNumber: true
            });
        } else {
            let phoneNumber:string;
            if(e.detail.cloudID) {
                phoneNumber = await getPhoneNumberCloud(e.detail.cloudID)
                
            } else {
                phoneNumber = await getPhoneNumberServer(e.detail.encryptedData!, e.detail.iv!);
            }
            this.setData({
                phoneNumber: phoneNumber,
                hasPhoneNumber: true,
                editPhoneNumber: false
            })
        }
    }
});





async function fillPhoneNumber(page: Page.PageInstance<UserConsoleData>) {

    let phoneNumber = "";
    let user = await loadUserInfo();
    if (user!.phoneNumber) {
        phoneNumber = user!.phoneNumber
        app.globalData.phoneNumber = phoneNumber;
        page.setData({
            phoneNumber: phoneNumber,
            hasPhoneNumber: true
        });
        return phoneNumber;
    } else {
        throw new Error("phoneNumber not found");
    }

}

async function saveUserInfo() {
    wx.showLoading({
        'title': '保存中'
    });
    if (app.globalData.useCloud && app.globalData.openid) {
        const db = wx.cloud.database();
        await db.collection("users").doc(app.globalData.openid).set({
            data: {
                phoneNumber: app.globalData.phoneNumber,
                nickName: app.globalData.userInfo!.nickName,
                avatarUrl: app.globalData.userInfo!.avatarUrl,
            }
        });
        wx.hideLoading();
        wx.showToast({
            title: '已保存',
            icon: 'success',
            duration: 1000
        })
    } else {
        // TODO: save user to server logic
        wx.request({
            url: "https://xxxxx/xxx",
            method: "POST",
            data: ""
        })
    }
}

async function loadUserInfo() {
    if (app.globalData.useCloud && app.globalData.openid) {
        const db = wx.cloud.database();
        let res = await db.collection("users").doc(app.globalData.openid).get();
        console.log(res.data);
        return res.data;
    } else {
        // TODO: load user from server logic
        wx.request({
            url: "https://xxxxx/xxx",
            method: "POST",
            data: "info"
        })

        throw new Error("Not implemented.")

    }
}


async function getPhoneNumberCloud(code: string) {
    let ret = await wx.cloud.callFunction({
            name: "updatePhoneNumber",
            data: {
                openid: app.globalData.openid,
                phoneNumber: wx.cloud.cloudID(code)
            }
        });
    return ret.result;
} 

async function getPhoneNumberServer(encryptedData: string, iv: string): Promise<any> {
    await new Promise((resolve, reject)=>{
        wx.request({
            url: "http://xxxx/xxx",
            method: "POST",
            data: {
                openid: app.globalData.openid,
                encryptedData: encryptedData,
                iv: iv
            },
            success: (res)=>{
                resolve(res.data)    
            },
            fail: err =>{
                reject(err);
            }
        });
    })
    
}