module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const id = event.id
    let record
    let card
    try {
      const result = await db.collection('dynamic')
        .doc(id)
        .get()
      record = result.data
      record.self = record._openid === OPENID
      const res = await db.collection('card')
        .doc(record.cardId)
        .get()
      card = res.data
      const $ = _.aggregate
      const doc = await db.collection('like')
        .aggregate()
        .match({
          dynamicId: id,
          status: 1
        })
        .count('likeNum')
        .lookup({
          from: 'like',
          pipeline: $.pipeline()
            .match(_.expr($.and([
              $.eq(['$dynamicId', id]),
              $.eq(['$status', 1]),
              $.eq(['$_openid', OPENID])
            ])))
            .count('num')
            .done(),
          as: 'liked',
        })
        .end()
      const follow = await db.collection('follow')
        .where({
          cardId: _.eq(record.cardId),
          _openid: _.eq(OPENID),
          status: 1
        })
        .get()
      let followed = !!follow.data.length
      let like = {
        likeNum: 0,
        liked: false
      }
      if (doc.list.length) {
        like = {
          likeNum: doc.list[0].likeNum,
          liked: !!doc.list[0].liked.length
        }
      }
      resolve({
        success: true,
        code: 200,
        record,
        card,
        like,
        followed
      })
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
