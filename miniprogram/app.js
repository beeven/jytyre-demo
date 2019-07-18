//app.js


App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.globalData = {
      useCloud: true
    }

    this.functions = {
      ensureLogin: () => {
        return new Promise((resolve, reject)=>{
          wx.checkSession({
            success: () => {
              resolve();
            },
            fail: () => {
              wx.login({
                success: res => {
                  if(res.code) {
                    if(this.globalData.useCloud) {
                      cloudLogin().then(()=>{resolve()});
                    } else {
                      serverLogin(res.code).then(()=>{resolve()});
                    }
                  }
                },
                fail: err => {
                  reject(err);
                }
              })
            }
          })
        })
      },

      getUserInfo: () => {
        return new Promise((resolve,reject)=>{
          wx.getSetting({
            success: res => {
              if(res.authSetting['scope.userInfo']){
                updateUserInfo().then((info)=>{
                  resolve(info);
                })
              } else {
                ensureLogin().then(()=>{
                  return updateUserInfo()
                    .then((info)=>{
                      resolve(info);
                    })
                });
              }
            },
            fail: err => {
              reject(err);
            }
          })
        })
        
      }
    }
  }
})


function cloudLogin() {
  return new Promise((resolve,reject)=>{
    const app = getApp();
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result);
        app.globalData.auth = res.result;
        resolve(res.result);
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        reject(err);
      }
    });
  });
  
}

function serverLogin(code) {
  return new Promise((resolve, reject)=>{
    const app = getApp();
    wx.request({
      url: 'https:/xxxxx/xxxx',
      data: {
        code: code
      },
      success: res => {
        app.globalData.auth = res.result;
        resolve(res.result)
      },
      fail: err => {
        reject(err);
      }
    });
  })
}

function updateUserInfo() {
  return new Promise((resolve, reject)=>{
    const app = getApp();
    wx.getUserInfo({
      success: res => {
        app.globalData.userInfo = res.userInfo;
        resolve(res.userInfo);
      },
      fail: err => {
        reject(err);
      }
    });
  })
}