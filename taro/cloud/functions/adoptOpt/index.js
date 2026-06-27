// 云函数入口文件
const cloud = require('wx-server-sdk')
const add = require('./src/add')
const deleteAdopt = require('./src/deleteAdopt')
const query = require('./src/query')
const queryAll = require('./src/queryAll')
const queryList = require('./src/queryList')
const queryMy = require('./src/queryMy')
const refresh = require('./src/refresh')
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
    case 'deleteAdopt':
      return await deleteAdopt(db, _, event, OPENID)
    case 'query':
      return await query(db, _, event, OPENID)
    case 'queryAll':
      return await queryAll(db, _, event, OPENID)
    case 'queryList':
      return await queryList(db, _, event, OPENID)
    case 'queryMy':
      return await queryMy(db, _, event, OPENID)
    case 'refresh':
      return await refresh(db, _, event, OPENID)
    default:
      return {
        success: false,
        msg: '不知道干啥'
      }
  }
}
