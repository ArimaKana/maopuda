module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    const type = event.type
    let query = {
      status: _.eq(1)
    }
    let skip = (i - 1) * 10
    if (type === 'my') {
      query._openid = _.eq(OPENID)
    } else if (type === 'like') {
      const list = await db.collection('like')
        .where({
          status: _.eq(1),
          _openid: _.eq(OPENID)
        })
        .orderBy('time', 'desc')
        .skip(skip)
        .limit(10)
        .get()
      query._id = _.in(list.data.map(i => i.dynamicId))
      skip = 0
    } else if (type === 'follow') {
      const follow = await db.collection('follow')
        .where({
          status: _.eq(1),
          _openid: _.eq(OPENID)
        })
        .count()
      const total = follow.total
      const batchTimes = Math.ceil(total / 100)
      let list = []
      for (let n = 0; n < batchTimes; n++) {
        const doc = await db.collection('follow')
          .where({
            status: _.eq(1),
            _openid: _.eq(OPENID)
          })
          .orderBy('time', 'desc')
          .skip(n * 100)
          .limit(100)
          .get()
        list.push(...doc.data)
      }
      query.cardId = _.in(list.map(i => i.cardId))
    } else if (type === 'topic') {
      query.topic = _.eq(event.topic)
    }
    const $ = _.aggregate
    const doc = await db.collection('dynamic')
      .aggregate()
      .match(query)
      .sort({ time: -1 })
      .skip(skip)
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
