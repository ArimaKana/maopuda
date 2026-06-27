module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    const cardId = event.cardId
    const query = {
      status: _.eq(1),
      cardId: _.eq(cardId)
    }
    const $ = _.aggregate
    const doc = await db.collection('dynamic')
      .aggregate()
      .match(query)
      .sort({ time: -1 })
      .skip((i - 1) * 10)
      .limit(10)
      .lookup({
        from: 'like',
        let: {
          dynamic_id: '$_id'
        },
        pipeline: $.pipeline()
          .match(_.expr($.and([
            $.eq(['$dynamicId', '$$dynamic_id']),
            $.eq(['$status', 1])
          ])))
          .count('num')
          .done(),
        as: 'likeNum',
      })
      .lookup({
        from: 'like',
        let: {
          dynamic_id: '$_id'
        },
        pipeline: $.pipeline()
          .match(_.expr($.and([
            $.eq(['$dynamicId', '$$dynamic_id']),
            $.eq(['$_openid', OPENID])
          ])))
          .done(),
        as: 'myLike',
      })
      .lookup({
        from: 'comment',
        let: {
          dynamic_id: '$_id'
        },
        pipeline: $.pipeline()
          .match(_.expr($.eq(['$dynamicId', '$$dynamic_id'])))
          .count('num')
          .done(),
        as: 'commentNum',
      })
      .end()
    const data = doc.list.map(it => {
      it.likeNum = it.likeNum.length ? it.likeNum[0].num : 0
      it.commentNum = it.commentNum.length ? it.commentNum[0].num : 0
      if (it.myLike.length && it.myLike[0].status === 1) {
        it.myLike = true
      } else {
        it.myLike = false
      }
      return it
    })

    resolve({
      success: true,
      data
    })
  })
}
