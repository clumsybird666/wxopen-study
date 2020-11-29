const express = require('express')
const sha1 = require('sha1')
const app = express()

/**
 * 验证服务器有效性
 * 1. 微信服务器知道开发者服务器是哪个
 *   - 测试号管理页面上填写url开发者服务器地址
 *   - 使用ngrok内网穿透  将本地端口号开启的服务映射到外网跨域访问的一个网址
 *  - 填写token
 *   - 参与微信签名加密的一个参数
 * 2. 开发者服务器   验证是微信服务器发来的
 *   目的：计算出signature微信加密签名，和微信传递过来的signature进行对比。如果一样，则来自于微信服务器
 *   1. 微信加密的3个参数（timestamp，nonce ，token）按照字典序排序 形成一个数组
 *   2. 将数组里的所有参数拼接成一个字符串，进行sha1加密
 *   3. 加密完成一个signature，和微信过来的进行对比。
 *      如果一样，则是来自于微信服务器，返回echostr给微信服务器
 */
const config = {
  token: 'shenweijian',
  appID: 'wx4abdcadb13793f2d',
  appsecret: '85c86c0a7db82db92f4883959cb3a662'
}
 // 接收处理所有数据
app.use((req,res,next)=>{
  console.log(req.query);
  /**
  signature: '3857fe48e93afdfd0c31e60cd8a32f114afd4967', 微信的加密签名
  echostr: '5820879817324877807',  //微信的随机字符串
  timestamp: '1606633034',  微信发送的时间戳
  nonce: '2084380469'  微信的随机数字
   */
  const {signature,echostr,timestamp,nonce} = req.query
  const {token} = config
  const arr=[timestamp,nonce,token]
  const arrSort = arr.sort()
  console.log(arrSort);
  //
  const str = arr.join('')
  const shaStr = sha1(str)
  console.log(shaStr);
  //
  if(shaStr === signature) {
    res.end(echostr)
  }else {
    res.end('error')
  }
})

app.listen(3000,()=>{
  console.log('服务启动成功');
})