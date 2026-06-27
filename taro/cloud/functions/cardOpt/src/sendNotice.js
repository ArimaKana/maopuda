const uuid = require('uuid/v1')
module.exports = async (db, message) => {
  return new Promise(async resolve => {
    try {
      const result = await db.collection('card')
        .doc(message.cardId)
        .get()
      // 以 openid-score 作为记录 id
      const docId = uuid().replace(/-/g, '')
      // 创建新的用户记录
      await db.collection('notice').add({
        // data 是将要被插入到 cat 集合的 JSON 对象
        data: {
          // 这里指定了 _id，如果不指定，数据库会默认生成一个
          _id: docId,
          // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
          receive: result.data._openid,
          _openid: message.send,
          // 状态id
          cardId: message.cardId,
          // 1评论 2回复 3点赞 4关注
          type: 4,
          // 创建时间
          time: new Date().getTime(),
          // 阅读状态
          read: false
        }
      })
      resolve({
        success: true
      })
    } catch (err) {
      // 用户第一次上传分数
      console.log(err)
    }
    resolve({
      success: false
    })
  })
}
