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

  let err = {
    success: false,
    code: 500,
    msg: '参数不全'
  }
  // 参数校验
  if (typeof event.id !== 'string' || !event.id) {
    return err
  }
  // 获取对话
  const res = await db.collection('message')
    .where(_.or([
      {
        send: _.eq(event.id),
        receive: _.eq(OPENID),
      },
      {
        send: _.eq(OPENID),
        receive: _.eq(event.id),
      }
    ]))
    .orderBy('time', 'desc')
    .get()
  const data = res.data
  await db.collection('message')
    .where(_.or([
      {
        send: _.eq(event.id),
        receive: _.eq(OPENID),
        read: false
      }
    ]))
    .update({
      data: {
        read: true
      }
    })
  // 获取用户
  const users = [OPENID, event.id]
  const result = await db.collection('user')
    .where({
      _id: _.in(users)
    })
    .field({
      _id: true,
      info: true,
    })
    .get()
  // 获取猫
  let cats = []
  for (let i of data) {
    if (i.type === 'adopt') {
      cats.push(i.adopt)
    }
  }
  const doc = await db.collection('cat')
    .where({
      _id: _.in(cats)
    })
    .field({
      _id: true,
      title: true,
      avatar: true
    })
    .get()
  return {
    success: true,
    data,
    users: result.data,
    cats: doc.data
  }
}
