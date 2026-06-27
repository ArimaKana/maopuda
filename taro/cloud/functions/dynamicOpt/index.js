// 云函数入口文件
const cloud = require('wx-server-sdk')
const add = require('./src/add')
const queryList = require('./src/queryList')
const query = require('./src/query')
const comment = require('./src/comment')
const queryComment = require('./src/queryComment')
const like = require('./src/like')
const myLike = require('./src/myLike')
const deleteCard = require('./src/delete')
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
    case 'queryList':
      return await queryList(db, _, event, OPENID)
    case 'query':
      return await query(db, _, event, OPENID)
    case 'comment':
      return await comment(db, _, event, OPENID)
    case 'queryComment':
      return await queryComment(db, _, event, OPENID)
    case 'like':
      return await like(db, _, event, OPENID)
    case 'myLike':
      return await myLike(db, _, event, OPENID)
    case 'delete':
      return await deleteCard(db, _, event, OPENID)
    default:
      return {
        success: false,
        msg: '不知道干啥'
      }
  }
}
