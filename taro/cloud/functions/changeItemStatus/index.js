// 云函数入口文件
const cloud = require('wx-server-sdk')
const isAdmin = require('./isAdmin')
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
  let record = await isAdmin(db, OPENID)
  if (!record.success) {
    return record
  }
  const id = event.id
  await db.collection('item')
    .doc(id)
    .update({
      data: {
        status: event.status,  // 状态 1:正常 2:下架
      }
    })

  return {
    success: true,
    created: true,
  }
}
