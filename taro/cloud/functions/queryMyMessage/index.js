// 云函数入口文件
const cloud = require('wx-server-sdk')
const uuid = require('uuid/v1')

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
    .where(_.or([
      {
        send: _.eq(OPENID)
      },
      {
        receive: _.eq(OPENID)
      }
    ]))
    .orderBy('time', 'desc')
    .get()
  const comment = await db.collection('notice')
    .where(_.or([
      {
        receive: _.eq(OPENID),
        type: 1,
        read: false
      },
      {
        receive: _.eq(OPENID),
        type: 2,
        read: false
      }
    ]))
    .count()
  const like = await db.collection('notice')
    .where({
      receive: _.eq(OPENID),
      type: 3,
      read: false
    })
    .count()
  const follow = await db.collection('notice')
    .where({
      receive: _.eq(OPENID),
      type: 4,
      read: false
    })
    .count()
  let users = []
  for (let i of res.data) {
    users.push(i.send)
    users.push(i.receive)
  }
  users = [...new Set(users)]
  const result = await db.collection('user')
    .where({
      _id: _.in(users)
    })
    .field({
      _id: true,
      info: true,
    })
    .get()
  return {
    success: true,
    data: res.data,
    users: result.data,
    me: OPENID,
    comment: comment.total,
    like: like.total,
    follow: follow.total
  }
}
