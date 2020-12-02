const sha1 = require('sha1')
const config = require('../config')
const {getUserDataAsync,parseXMLAsync,formatMessage} = require('../utils/tool')
const reply = require('./reply')
const  template  = require('./template')
module.exports = ()=>{
  return async (req,res,next)=>{
    console.log(req.query);
    const {signature,echostr,timestamp,nonce} = req.query
    const {token} = config
    const shaStr = sha1([timestamp,nonce,token].sort().join(''))
    /**
     * 微信服务器会发送两种类型的消息给开发服务器
     * 1. get请求
     *   - 验证服务的有效性
     * 2. Post请求
     *   - 验证服务器的有效性 
     *   - 发送的数据转发到开发者服务器
     */
    if(req.method==='GET'){
      if(shaStr===signature){
        res.send(signature)
      }else{
        res.send('error')
      }
    }
    if(req.method==='POST'){
      /**
       * {
  signature: 'fe3092fc06f14d79b99547b825518237482d8044',
  timestamp: '1606645988',
  nonce: '215520139',
   openid: 'oACvpwGj6Jc6MhEeH8WNoUysfUrE'
       */
      //接收到的数据
      //验证来自于微信服务器
      if(shaStr!==signature){
        console.log('error');
      }
      // console.log(req.query);
      //接收请求体中的数据，流式数据
      const xmlData = await getUserDataAsync(req)
      console.log(xmlData);
      /**
       * <xml><ToUserName><![CDATA[gh_aa06866ca032]]></ToUserName>  //开发者的id
          <FromUserName><![CDATA[oACvpwGj6Jc6MhEeH8WNoUysfUrE]]></FromUserName>  //用户id openid
          <CreateTime>1606646835</CreateTime>   //发送时间戳
          <MsgType><![CDATA[text]]></MsgType>  //发送的类型
          <Content><![CDATA[你好]]></Content>   //内容
          <MsgId>23001653569930368</MsgId>   //消息id
        </xml>
       */
      //解析xml数据
      const jsData = await parseXMLAsync(xmlData)
      //格式化数据
      const message = formatMessage(jsData)
      console.log(message);
      const options = reply(message)
      const resMessage=template(options)
      //如果开发者服务器没有返回响应给微信服务器，微信服务器会发送3次请求过来
      res.send(resMessage)

    }else{

    }
  }
}
