const uuid = require('uuid/v1')
const isLogin = require('./isLogin')
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
    if (typeof event.cardId !== 'string' || !event.cardId) {
      resolve(err)
      return false
    }

    try {
      const res = await db.collection('card')
        .doc(event.cardId)
        .get()
      card = res.data
      if (card._openid !== OPENID) {
        err.code = 700
        err.msg = '请选择自己的猫咪'
        resolve(err)
        return false
      }
    } catch (err) {
      // 用户第一次上传分数
    }

    // 参数校验
    if (typeof event.topic !== 'string') {
      resolve(err)
      return false
    } else if (typeof event.content !== 'string' || event.content.length > 140) {
      resolve(err)
      return false
    } else if (!Array.isArray(event.cover) || !event.cover.length) {
      resolve(err)
      return false
    }

    // 以 openid-score 作为记录 id
    const docId = uuid().replace(/-/g, '')
    // 创建新的用户记录
    await db.collection('dynamic').add({
      // data 是将要被插入到 cat 集合的 JSON 对象
      data: {
        // 这里指定了 _id，如果不指定，数据库会默认生成一个
        _id: docId,
        // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
        _openid: OPENID,
        // 猫卡id
        cardId: event.cardId,
        // 话题
        topic: event.topic,
        // 文字
        content: event.content,
        // 图片
        cover: event.cover,
        // 创建时间
        time: new Date().getTime(),
        // 状态 1:正常 2:删除 -1:异常
        status: 1
      }
    })

    resolve({
      success: true,
      created: true,
    })
  })
}
