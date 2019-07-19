//app.js


App({
    onLaunch: function () {
        var _this = this;

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
                return new Promise((resolve, reject) => {
                    if (this.globalData.openid) {
                        wx.checkSession({
                            success: (res) => {
                                resolve(this.globalData.openid);
                            },
                            fail: () => {
                                doLogin().then(openid => { resolve(openid) });
                            }
                        })
                    } else {
                        doLogin().then(openid => { resolve(openid) });
                    }
                })
            },

            getUserInfo: () => {
                return new Promise((resolve, reject) => {
                    wx.getSetting({
                        success: res => {
                            if (res.authSetting['scope.userInfo']) {
                                updateUserInfo().then((info) => {
                                    resolve(info);
                                })
                            } else {
                                ensureLogin().then(() => {
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
        }
    }
})



function doLogin() {
    const app = getApp();
    return new Promise((resolve, reject) => {
        wx.login({
            success: res => {
                if (res.code) {
                    if (app.globalData.useCloud) {

                        getOpenIDCloud().then(openid => {
                            resolve(openid);
                        });
                    } else {
                        getOpenIDServer(code).then(openid => {
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
        const app = getApp();

        const db = wx.cloud.database();
        const _ = db.command;

        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                console.log('[云函数] [login] user openid: ', res.result);
                let openid = res.result.openid;
                app.globalData.openid = openid
            },
            fail: err => {
                console.error('[云函数] [login] 调用失败', err)
                reject(err);
            }
        });
    });

}

function getOpenIDServer(code) {
    return new Promise((resolve, reject) => {
        const app = getApp();
        wx.request({
            url: 'https:/xxxxx/xxxx',
            data: {
                code: code
            },
            success: res => {
                app.globalData.openid = res.result.openid;
                resolve(res.result)
            },
            fail: err => {
                reject(err);
            }
        });
    })
}

function updateUserInfo() {
    return new Promise((resolve, reject) => {
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
