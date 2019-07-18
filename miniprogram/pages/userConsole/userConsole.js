// pages/userConsole/userConsole.js

const app = getApp();

Page({

  data: {
    openid: '',
    avatarUrl: "./user-unlogin.png",
    userName: "未登录",
    phoneNumber: "",
    hasPhoneNumber: false
  },

  onLoad: async function(options) {
    if (app.globalData.userInfo) {
      this.setData({
        userName: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl
      });
    } else {
      await app.functions.ensureLogin();
  
      let info = await app.functions.getUserInfo();
      console.log(info);
      this.setData({
        userName: info.nickName,
        avatarUrl: info.avatarUrl
      });
    }
  },

  saveInfo: async function() {
    await saveUserInfo({
      phoneNumber: this.phoneNumber,
      userName: this.userName,
      avatarUrl: this.avatarUrl,
    })
  }
})


async function getPhoneNumber() {
  wx.getPhoneNumber({
    success: res => {

    }
  })
}

async function saveUserInfo(info) {
  if(app.globalData.useCloud) {
    const db = wx.cloud.database();
    const _ = db.command;
    const users = db.collection("users");
    await users.where({
      _openid: app.globalData.user
    }).update({
      data: {
        phoneNumber: _.set(info.phoneNumber),
        userName: _.set(info.userName),
        avatarUrl: _.set(info.avatarUrl)
      }
    });
  } else {
    wx.request({
      url: "https://xxxxx/xxx",
      method: "POST",
      data: info
    })
  }
}
