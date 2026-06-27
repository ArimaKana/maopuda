// 云函数入口文件
const cloud = require('wx-server-sdk')
const queryAdopt = require('./src/queryAdopt')
const queryCard = require('./src/queryCard')
const queryDynamic = require('./src/queryDynamic')
const queryItem = require('./src/queryItem')
// 与小程序端一致，均需调用 init 方法初始化
cloud.init()
// 可在入口函数外缓存 db 对象
const db = cloud.database()
// 数据库查询更新指令对象
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  if (typeof event.text !== 'string') {
    return {
      success: false,
      msg: '参数错误'
    }
  }
  console.log(event.optType)
  switch (event.optType) {
    case 'queryAdopt':
      return await queryAdopt(db, _, event, OPENID)
    case 'queryCard':
      return await queryCard(db, _, event, OPENID)
    case 'queryDynamic':
      return await queryDynamic(db, _, event, OPENID)
    case 'queryItem':
      return await queryItem(db, _, event, OPENID)
    default:
      return {
        success: false,
        msg: '不知道干啥'
      }
  }
}
