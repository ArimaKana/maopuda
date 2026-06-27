// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const res = await db.collection('message')
    .where({
      receive: _.eq(OPENID),
      read: false
    })
    .count()
  const doc = await db.collection('notice')
    .where({
      receive: _.eq(OPENID),
      read: false
    })
    .count()
  return {
    success: true,
    data: res.total + doc.total
  }
}
