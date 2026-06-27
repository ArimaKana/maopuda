// 云函数入口文件
const cloud = require('wx-server-sdk')
const add = require('./src/add')
const query = require('./src/query')
const querySample = require('./src/querySample')
const queryDynamic = require('./src/queryDynamic')
const queryList = require('./src/queryList')
const follow = require('./src/follow')
const myFollow = require('./src/myFollow')
const deleteCard = require('./src/delete')
const updateCard = require('./src/update')
// 与小程序端一致，均需调用 init 方法初始化
cloud.init()
// 可在入口函数外缓存 db 对象
const db = cloud.database()
// 数据库查询更新指令对象
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  console.log(event.optType)
  switch (event.optType) {
    case 'add':
      return await add(db, _, event, OPENID)
    case 'query':
      return await query(db, _, event, OPENID)
    case 'querySample':
      return await querySample(db, _, event, OPENID)
    case 'queryDynamic':
      return await queryDynamic(db, _, event, OPENID)
    case 'queryList':
      return await queryList(db, _, event, OPENID)
    case 'follow':
      return await follow(db, _, event, OPENID)
    case 'myFollow':
      return await myFollow(db, _, event, OPENID)
    case 'delete':
      return await deleteCard(db, _, event, OPENID)
    case 'update':
      return await updateCard(db, _, event, OPENID)
    default:
      return {
        success: false,
        msg: '不知道干啥'
      }
  }
}
