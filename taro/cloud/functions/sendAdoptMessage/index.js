// 云函数入口文件
const cloud = require('wx-server-sdk')
const moment = require('moment')
const isLogin = require('./isLogin')

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
  let record = await isLogin(db, OPENID)
  if (!record.success) {
    return record
  }

  let err = {
    success: false,
    code: 500,
    msg: '参数不全'
  }
  // 参数校验
  if (typeof event.id !== 'string' || !event.id) {
    return err
  }
  let cat
  try {
    const querResult = await db.collection('cat')
      .doc(event.id)
      .get()
    cat = querResult.data
  } catch (err) {
    // 用户第一次上传分数
  }
  if (cat) {
    const receive = cat._openid
    await db.collection('message')
      .add({
        data: {
          send: OPENID,    //发送者id
          receive,         //接收者id
          type: 'adopt',   //消息类型
          adopt: event.id, //猫咪id
          read: false,    //是否已读
          time: new Date().getTime(), //创建时间
        }
      })
    try {
      let time = moment().utcOffset(480).format('YYYY[年]M[月]D[日] H:mm')
      const message = await cloud.openapi.subscribeMessage.send({
        touser: receive,
        page: '/pages/message/dialog?id=' + OPENID,
        data: {
          thing1: {
            value: cat.title
          },
          date2: {
            value: time
          }
        },
        templateId: 'WciV4I7PaLf_3rajAEhlEBzfMu63F0PMZfKsCshSemU'
      })
      console.log(message)
    } catch (err) {
      console.log(err)
    }
    return {
      success: true,
      created: true,
      receive
    }
  } else {
    return err
  }
}
