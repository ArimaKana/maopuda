const uuid = require('uuid/v1')
const isLogin = require('./isLogin')
const notice = require('./sendNotice')
module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    /**
     * 校验用户权限
     */
    let login = await isLogin(db, OPENID)
    if (!login.success) {
      resolve(login)
      return false
    }
    let err = {
      success: false,
      code: 500,
      msg: '参数不全'
    }

    // 参数校验
    if (typeof event.content !== 'string' || !event.content || event.content.length > 140) {
      resolve(err)
      return false
    } else if (typeof event.dynamicId !== 'string' || !event.dynamicId) {
      resolve(err)
      return false
    } else if (typeof event.replyId !== 'string') {
      resolve(err)
      return false
    }

    // 以 openid-score 作为记录 id
    const docId = uuid().replace(/-/g, '')
    // 创建新的用户记录
    await db.collection('comment').add({
      // data 是将要被插入到 cat 集合的 JSON 对象
      data: {
        // 这里指定了 _id，如果不指定，数据库会默认生成一个
        _id: docId,
        // 评论用户
        _openid: OPENID,
        // 动态id
        dynamicId: event.dynamicId,
        // 评论内容
        content: event.content,
        // 回复评论id
        replyId: event.replyId,
        // 创建时间
        time: new Date().getTime(),
        // 状态 1:正常 2:删除 -1:异常
        status: 1
      }
    })
    await notice(db, {
      dynamicId: event.dynamicId,
      content: event.content,
      type: event.replyId ? 2 : 1,
      send: OPENID
    })

    resolve({
      success: true,
      created: true,
    })
  })
}
