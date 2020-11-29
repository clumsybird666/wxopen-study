const express = require('express')
const auth = require('./wechat/auth')
const app = express()

 // 接收处理所有数据
app.use(auth())

app.listen(3000,()=>{
  console.log('服务启动成功');
})