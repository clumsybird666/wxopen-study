 /** 
  * 
  * 
*/ 
module.exports= message =>{
  if(message.msgType==='text'){

  }else if(message.msgType==='image'){
    options.msgType='image'
    options.mediaId=message.MediaId
  }else if(message.msgType==='voice'){

  }

  let content=''
  let options = {
    toUserName:message.fromUserName,
    fromUserName:message.toUserName,
    createTime:message.createTime,
    msgType:'text'
  }
  options.content=content
  return options
}