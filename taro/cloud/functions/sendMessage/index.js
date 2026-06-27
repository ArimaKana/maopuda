// 云函数入口文件
const cloud = require('wx-server-sdk')
const uuid = require('uuid/v1')
const isLogin = require('./isLogin')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  /**
   * 校验用户权限
   */
  let record = await isLogin(db, OPENID)
  if (!record.success) {
    return record
  }

  let err = {
    success: false,
    code: 500,
    msg: '参数不全'
  }
  // 参数校验
  if (typeof event.id !== 'string' || !event.id || typeof event.text !== 'string' || !event.text) {
    return err
  }
  const receive = event.id
  await db.collection('message')
    .add({
      data: {
        send: OPENID,    //发送者id
        receive,         //接收者id
        type: 'text',   //消息类型
        text: event.text,
        read: false,    //是否已读
        time: new Date().getTime(), //创建时间
      }
    })
  return {
    success: true
  }
}
