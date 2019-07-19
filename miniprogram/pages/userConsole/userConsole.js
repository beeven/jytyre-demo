// pages/userConsole/userConsole.js

const app = getApp();

Page({

  data: {
    openid: '',
    avatarUrl: "./user-unlogin.png",
    nickName: "未登录",
    phoneNumber: "",
    hasPhoneNumber: false
  },

  onLoad: async function (options) {
    if (app.globalData.userInfo) {
      if (app.globalData.userInfo.phoneNumber) {
        this.setData({
          nickName: app.globalData.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl,
          phoneNumber: app.globalData.userInfo.phoneNumber
        });
      } else {
        this.setData({
          nickName: app.globalData.userInfo.nickName,
          avatarUrl: app.globalData.userInfo.avatarUrl
        });
        fillPhoneNumber(this);
      }
    } else {
      await app.functions.ensureLogin();
      let info = await app.functions.getUserInfo();

      this.setData({
        nickName: info.nickName,
        avatarUrl: info.avatarUrl
      });

      fillPhoneNumber(this);
    }
  },

  inputedit: function(e){
    let value = e.detail.value;
    this.setData({
      phoneNumber: value
    });
  },

  saveInfo: async function () {
    app.globalData.userInfo.phoneNumber = this.data.phoneNumber;
    await saveUserInfo()
  }
})



async function getPhoneNumber() {
  await new Promise((resolve, reject) => {
    wx.getPhoneNumber({
      success: res => {
        resolve(res.result.phoneNumber);
      },
      fail: (err) => {
        reject(err);
      }
    })
  });
}

async function fillPhoneNumber(page) {

  let phoneNumber = "";
  try {
    phoneNumber = await getPhoneNumber();
    app.globalData.userInfo.phoneNumber = phoneNumber;
    page.setData({
      hasPhoneNumber: true
    });
    await saveUserInfo();
  } catch (err) {
    let user = await loadUserInfo();
    if (user.phoneNumber) {
      phoneNumber = user.phoneNumber
      app.globalData.userInfo.phoneNumber = phoneNumber;
    }
  }
  page.setData({
    phoneNumber: phoneNumber,
  });
  return phoneNumber;
}

async function saveUserInfo() {
  wx.showLoading({
    'title': '保存中'
  });
  if (app.globalData.useCloud) {
    const db = wx.cloud.database();
    await db.collection("users").doc(app.globalData.openid).set({
      data: {
        phoneNumber: app.globalData.userInfo.phoneNumber,
        nickName: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl,
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
      data: info
    })
  }
}

async function loadUserInfo() {
  if (app.globalData.useCloud) {
    const db = wx.cloud.database();
    let res = await db.collection("users").doc(app.globalData.openid).get();
    console.log(res.data);
    return res.data;
  } else {
    // TODO: load user from server logic
    wx.request({
      url: "https://xxxxx/xxx",
      method: "POST",
      data: info
    })
  }
}
