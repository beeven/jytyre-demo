# 驿达轮胎

微信小程序，采用云开发方式

## About
包含功能
* 个人中心
    * 获取用户信息、手机号码
* 质保申请
    * 列表增删改查操作
    * 百度AI车牌识别
* 品牌介绍
* 积分商城

## Known bugs
* webpack 编译还不成功，问题主要在 mini-program-webpack-plugin。曾经修改过后，还是无法加载src/pages/warranty/warranty.service.ts中export的实例。
* 由于微信小程序只暴露App()、Page()这样的接口。如果使用ES6的class，生成的object传入 Page等接口，prototype里面的函数不会被识别。

## Related repo
* [@beeven/miniprogram-typings](https://github.com/beeven/miniprogram-typings), forked from [MDGS](https://github.com/MS-DG/api-typings)