module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const id = event.id
    try {
      const result = await db.collection('card')
        .doc(id)
        .get()
      const record = result.data
      const followNum = await db.collection('follow')
        .where({
          cardId: _.eq(id),
          status: 1
        })
        .count()
      const follow = await db.collection('follow')
        .where({
          cardId: _.eq(id),
          _openid: _.eq(OPENID),
          status: 1
        })
        .get()
      let followed = !!follow.data.length
      if (record) {
        resolve({
          success: true,
          code: 200,
          record,
          followed,
          fans: followNum.total
        })
      }
    } catch (err) {
      // 用户第一次上传分数
    }
    resolve({
      success: false,
      code: 404,
      msg: '找不到记录'
    })
  })
}
