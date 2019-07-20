export interface IMyAppGlobalData {
  userInfo?: wx.UserInfo,
  useCloud: boolean,
  openid?: string,
  phoneNumber?: string,
  test?: string | object,
  [key: string]: any
}

export interface IMyApp {
  userInfoReadyCallback?(res: wx.UserInfo): void;

  globalData: IMyAppGlobalData;

  ensureLogin(): Promise<any>;
  getUserInfo(): Promise<any>;
}

App({
  globalData: {
    useCloud: true
  } as IMyAppGlobalData,
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })


    }
  },

  ensureLogin() {
    return new Promise((resolve, reject) => {
      if (this.globalData.openid !== null && typeof (this.globalData.openid) !== "undefined") {
        wx.checkSession({
          success: () => {
            resolve(this.globalData.openid);
          },
          fail: () => {
            doLogin().then(openid => { resolve(openid) }).catch((err) => { reject(err) });
          }
        })
      } else {
        doLogin().then(openid => { resolve(openid) }).catch(err => { reject(err) });
      }
    })
  },

  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: res => {
          if (res.authSetting["scope.userInfo"]) {
            updateUserInfo().then((info) => {
              resolve(info);
            })
          } else {
            this.ensureLogin().then(() => {
              return updateUserInfo()
                .then((info) => {
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

})

// class myApp implements IMyApp {
//   globalData: IMyAppGlobalData = {
//     useCloud: true,

//   }

//   async onLaunch() {
//     if (!wx.cloud) {
//       console.error('请使用 2.2.3 或以上的基础库以使用云能力')
//     } else {
//       wx.cloud.init({
//         traceUser: true,
//       })


//     }
//     // try {
//     //   await this.getUserInfo()
//     // } catch (err) {
//     //   console.error(err);
//     // }
//     // await this.getUserInfo();
//   }

//   ensureLogin() {
//     return new Promise((resolve, reject) => {
//       if (this.globalData.openid !== null && typeof (this.globalData.openid) !== "undefined") {
//         wx.checkSession({
//           success: () => {
//             resolve(this.globalData.openid);
//           },
//           fail: () => {
//             doLogin().then(openid => { resolve(openid) }).catch((err) => { reject(err) });
//           }
//         })
//       } else {
//         doLogin().then(openid => { resolve(openid) }).catch(err => { reject(err) });
//       }
//     })
//   }

//   getUserInfo() {
//     return new Promise((resolve, reject) => {
//       wx.getSetting({
//         success: res => {
//           if (res.authSetting["scope.userInfo"]) {
//             updateUserInfo().then((info) => {
//               resolve(info);
//             })
//           } else {
//             this.ensureLogin().then(() => {
//               return updateUserInfo()
//                 .then((info) => {
//                   resolve(info);
//                 })
//             });
//           }
//         },
//         fail: err => {
//           reject(err);
//         }
//       })
//     })

//   }
// }


function doLogin() {
  const app = getApp<IMyApp>();
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        if (res.code) {
          if (app.globalData.useCloud) {

            getOpenIDCloud().then(openid => {
              resolve(openid);
            });
          } else {
            getOpenIDServer(res.code).then(openid => {
              resolve(openid);
            });
          }
        }
      },
      fail: err => {
        reject(err);
      }
    });
  });
}


function getOpenIDCloud() {
  return new Promise((resolve, reject) => {
    const app = getApp<IMyApp>();

    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result);
        let openid = res.result.openid;
        app.globalData.openid = openid
        resolve(openid);
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        reject(err);
      }
    });
  });

}

function getOpenIDServer(code: string) {
  // TODO: implement 
  return new Promise((resolve, reject) => {
    const app = getApp<IMyApp>();
    wx.request({
      url: 'https:/xxxxx/xxxx',
      data: {
        code: code
      },
      success: res => {
        app.globalData.openid = res.data.openid;
        resolve(res.data)
      },
      fail: err => {
        reject(err);
      }
    });
  })
}

function updateUserInfo() {
  return new Promise((resolve, reject) => {
    const app = getApp<IMyApp>();
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


