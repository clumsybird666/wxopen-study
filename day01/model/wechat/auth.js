const sha1 = require('sha1')
const config = require('../config')
module.exports = ()=>{
  return (req,res,next)=>{
    console.log(req.query);
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
  }
}