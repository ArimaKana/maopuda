// 云函数入口文件
const cloud = require('wx-server-sdk')
const add = require('./src/add')
const deleteVideo = require('./src/deleteVideo')
const query = require('./src/query')
// 与小程序端一致，均需调用 init 方法初始化
cloud.init()
// 可在入口函数外缓存 db 对象
const db = cloud.database()
// 数据库查询更新指令对象
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  switch (event.optType) {
    case 'add':
      return await add(db, _, event, OPENID)
    case 'delete':
      return await deleteVideo(db, _, event, OPENID)
    case 'query':
      return await query(db, _, event, OPENID)
    default:
      return {
        success: false,
        msg: '不知道干啥'
      }
  }
}
