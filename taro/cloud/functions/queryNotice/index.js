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
  /**
   * 校验用户权限
   */
  let err = {
    success: false,
    code: 500,
    msg: '参数不全'
  }
  let query = {
    receive: _.eq(OPENID),
    read: false
  }
  if (event.type == 1) {
    query.type = _.or(_.eq(1), _.eq(2))
  } else if (event.type == 2) {
    query.type = 3
  } else if (event.type == 3) {
    query.type = 4
  } else {
    return {
      success: false
    }
  }
  // 获取对话
  const $ = _.aggregate
  let res
  if (event.type == 3) {
    res = await db.collection('notice')
      .aggregate()
      .match(query)
      .sort({ time: -1 })
      .lookup({
        from: 'card',
        let: {
          card_id: '$cardId'
        },
        pipeline: $.pipeline()
          .match(_.expr($.eq(['$_id', '$$card_id'])))
          .done(),
        as: 'source',
      })
      .lookup({
        from: 'user',
        let: {
          openid: '$_openid'
        },
        pipeline: $.pipeline()
          .match(_.expr($.eq(['$_id', '$$openid'])))
          .project({
            'info.avatarUrl': 1,
            'info.nickName': 1
          })
          .done(),
        as: 'user',
      })
      .end()
  } else {
    res = await db.collection('notice')
      .aggregate()
      .match(query)
      .sort({ time: -1 })
      .lookup({
        from: 'dynamic',
        let: {
          dynamic_id: '$dynamicId'
        },
        pipeline: $.pipeline()
          .match(_.expr($.eq(['$_id', '$$dynamic_id'])))
          .done(),
        as: 'source',
      })
      .lookup({
        from: 'user',
        let: {
          openid: '$_openid'
        },
        pipeline: $.pipeline()
          .match(_.expr($.eq(['$_id', '$$openid'])))
          .project({
            'info.avatarUrl': 1,
            'info.nickName': 1
          })
          .done(),
        as: 'user',
      })
      .end()
  }
  await db.collection('notice')
    .where(query)
    .update({
      data: {
        read: true
      }
    })
  const data = res.list.map(it => {
    it.source = it.source.length ? it.source[0] : {}
    it.user = it.user.length ? it.user[0] : false
    return it
  })
  return {
    success: true,
    data
  }
}
