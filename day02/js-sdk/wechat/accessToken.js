/**
 * 获取access_token
 * 是什么 ？   微信调用的唯一凭据
 * 
 * 特点
 *   1. 唯一
 *   2. 有效期2小时
 *   3. 接口权限 2000次
 * 
 * 请求地址：
 * https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 * 请求方式：
 * Get
 * 
 * 设计思路
 *  1. 首次本地没有，发送请求获取access_token,保存下来
 *  2. 第二次或者以后
 *     - 先去本地读取文件，判断是否过期
 *     - 过期了
 *      - 重新获取access_token,保存下来覆盖之前的文件
 *     - 没有过期
 *      - 直接使用
 *  整理思路：
 * 读取本地文件  readAccessToken
 *   - 本地有文件
 *     - 判断是否过期  isValidAccessToken
 *       - 过期了
 *         - 重新请求获取access_token (getAccessToken),保存下来覆盖之前的文件（saveAccessToken）
 *       - 没有过期
 *         - 直接使用
 * 
 *   - 本地没有文件
 *     - 发送获取access_token （getAccessToken），保存下来(本地文件)(saveAccessToken),直接使用
 * 
 */
const rp = require('request-promise-native')
const { appID, appsecret } = require('../config')
const fs = require('fs')
const { promises } = require('dns')
const menu = require('./menu')
class Wechat {
  constructor() {

  }
  /**
   * 获取access_token
   * 
   */
  getAccessToken() {
    return new Promise((resolve, reject) => {
      //定义url
      const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`
      //发送请求
      rp({
        method: 'GET',
        url,
        json: true
      }).then((res) => {
        /**
        * {
            access_token: '39_PaDlof_zDKvJ_Xe7dednnY4iUsTMKu8ryJmfWurfwVviDn1GT9m8DksCuxSV5VrvL-LDsyiSNkeb7cCHiyofkq7sZiMZnOs8CFb1fagETGyibj1cEXePPraLlVIg--UysAo7XORnDECE14yyGPCeADATCP',
            expires_in: 7200
          }
         */
        console.log(res);
        //设置过期时间
        res.expires_in = Date.now() + (res.expires_in - 300) * 1000
        resolve(res)

      }).catch((err) => {
        console.log(err);
        reject('getAccessToken' + err)
      })
    })
  }

  /**
   * 保存access_token
   */
  saveAccessToken(accessToken) {
    accessToken = JSON.stringify(accessToken)
    return new Promise((resolve, reject) => {
      fs.writeFile('./accessToken.txt', accessToken, (err) => {
        if (!err) {
          console.log('文件保存成功');
          resolve()
        } else {
          reject('saveAccessToke' + err)
        }
      })
    })
  }

  /**
   * 读取access_token
   */
  readAccessToken() {
    return new Promise((resolve, reject) => {
      fs.readFile('./accessToken.txt', (err, data) => {
        if (!err) {
          console.log('文件读取成功');
          data = JSON.parse(data)
          resolve(data)
        } else {
          reject('readAccessToke' + err)
        }
      })
    })
  }

  /**
   * 判断过期
   */
  isValidAccessToken(data) {
    //检测传入的参数有效
    if (!data && !data.expires_in && !data.access_token) {
      return false
    }

    //检测token是否在有效期内
    return data.expires_in > Date.now()
  }

  /**
   * 获取access_token
   *  */
  fetchAccessToken() {
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      //说明之前保存过accessToken，直接使用
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in
      })
    }
    return this.readAccessToken()
      .then(async res => {
        if (this.isValidAccessToken(res)) {
          resolve(res)
        } else {
          const res = await this.getAccessToken()
          await this.saveAccessToken(res)
          return new Promise.resolve(res)
        }
      })
      .catch(async err => {
        const res = await this.getAccessToken()
        await this.saveAccessToken(res)
        return new Promise.resolve(res)
      })
      .then(res => {
        this.access_token = res.access_token
        this.expires_in = res.expires_in
        return Promise.resolve(res)
      })

  }


  /**
   * 创建菜单
   */
  createMenu(menu) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.fetchAccessToken()
        const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${data.access_token}`
        const result = await rp({
          method: 'POST',
          url,
          json: true,
          body: menu
        })
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  }

  deleteMenu(){
    return new Promise(async (resolve,reject)=>{
     try {
      const data = await this.fetchAccessToken()
      const url = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${data.access_token}`
      const data =  await rp({method:'GET',url,json:true})
      resolve(data)
     } catch (error) {
       reject(error)
     }
    })
  }
}
