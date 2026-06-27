const uuid = require('uuid/v1')
const isAdmin = require('./isAdmin')
module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    /**
     * 校验用户权限
     */
    let record = await isAdmin(db, OPENID)
    if (!record.success) {
      resolve(err)
      return false
    }

    // 参数校验
    if (typeof event.content !== 'string' || !event.content || event.content.length > 140) {
      resolve(err)
      return false
    }else if (typeof event.src !== 'string' || !event.src || event.src.length > 200) {
      resolve(err)
      return false
    }else if (typeof event.height !== 'number' || !event.height) {
      resolve(err)
      return false
    }

    // 以 openid-score 作为记录 id
    const docId = uuid().replace(/-/g, '')
    // 创建新的用户记录
    await db.collection('video').add({
      // data 是将要被插入到 cat 集合的 JSON 对象
      data: {
        // 这里指定了 _id，如果不指定，数据库会默认生成一个
        _id: docId,
        // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
        _openid: OPENID,
        // 文字
        content: event.content,
        // 链接
        src: event.src,
        // 链接
        height: event.height,
        // 创建时间
        time: new Date().getTime(),
        // 状态 1:正常 2:关闭 -1:异常
        status: 1
      }
    })

    resolve({
      success: true,
      created: true,
    })
  })
}
