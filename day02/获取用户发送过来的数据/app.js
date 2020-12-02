const express = require('express')
const { get } = require('request-promise-native')
const auth = require('./wechat/auth')
const app = express()

 // 接收处理所有数据
app.use(auth())
//配置模板资源目录
app.set('views','./views')
//配置模板引擎
app,set('view engine','ejs')
app.get('/search',(req,res)=>{
  
  res.render('search')
})
app.listen(3000,()=>{
  console.log('服务启动成功');
})