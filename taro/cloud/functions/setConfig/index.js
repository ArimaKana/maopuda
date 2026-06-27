// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

const configId = '13fddf05-631c-4239-97c4-3d3060e34415'

// 云函数入口函数
exports.main = async (event, context) => {
  const showPub = event.showPub
  const receive = event.receive
  const send = event.send
  const iconsNew = event.icons
  const { OPENID } = cloud.getWXContext()
  let record
  try {
    const querResult = await db.collection('user')
      .doc(OPENID)
      .get()
    record = querResult.data
  } catch (err) {
    // 用户未注册
  }
  if (record && record.role === 2) {
    await db.collection('config')
      .doc(configId)
      .update({
        data: {
          receive,
          send,
          iconsNew,
          showPub
        }
      })

    return {
      success: true
    }
  }
  return {
    success: false,
    code: 403,
    msg: '你没有权限'
  }
}
