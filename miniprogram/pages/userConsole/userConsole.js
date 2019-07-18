// pages/userConsole/userConsole.js

const app = getApp();

Page({

  data: {
    openid: ''
  },

  async onLoad(options) {
    await app.functions.ensureLogin();
  
    let info = await app.functions.getUserInfo();
    this.setData({
      openid: info.openid
    })

    
  }
})