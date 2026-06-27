const uuid = require('uuid/v1')
const isLogin = require('./isLogin')
const notice = require('./sendNotice')
module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    /**
     * 校验用户权限
     */
    // let login = await isLogin(db, OPENID)
    // if (!login.success) {
    //   resolve(login)
    //   return false
    // }
    let err = {
      success: false,
      code: 500,
      msg: '参数不全'
    }
    // 参数校验
    if (typeof event.cardId !== 'string' || !event.cardId) {
      resolve(err)
      return false
    } else if (typeof event.status !== 'number') {
      resolve(err)
      return false
    }
    // 查找是否关注过
    const doc = await db.collection('follow')
      .where({
        _openid: _.eq(OPENID),
        cardId: _.eq(event.cardId)
      })
      .get()
    let record = doc.data
    if (record.length) {
      await db.collection('follow')
        .doc(record[0]._id)
        .update({
          data: {
            status: event.status,
            // 更新时间
            time: new Date().getTime(),
          }
        })
    } else {
      // 以 openid-score 作为记录 id
      const docId = uuid().replace(/-/g, '')
      // 创建新的用户记录
      await db.collection('follow').add({
        // data 是将要被插入到 cat 集合的 JSON 对象
        data: {
          // 这里指定了 _id，如果不指定，数据库会默认生成一个
          _id: docId,
          // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
          _openid: OPENID,
          // 头像
          cardId: event.cardId,
          // 创建时间
          time: new Date().getTime(),
          // 状态 1:正常 2:删除 -1:异常
          status: 1
        }
      })
      await notice(db, {
        cardId: event.cardId,
        send: OPENID
      })
    }
    resolve({
      success: true,
      follow: true,
    })
  })
}
