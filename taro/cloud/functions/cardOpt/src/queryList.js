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
    } else if (type === 'follow') {
      const list = await db.collection('follow')
        .where({
          status: _.eq(1),
          _openid: _.eq(OPENID)
        })
        .orderBy('time', 'desc')
        .skip(skip)
        .limit(10)
        .get()
      query._id = _.in(list.data.map(i => i.cardId))
      skip = 0
    }
    const $ = _.aggregate
    const doc = await db.collection('card')
      .aggregate()
      .match(query)
      .sort({ time: -1 })
      .skip(skip)
      .limit(10)
      .lookup({
        from: 'follow',
        let: {
          card_id: '$_id'
        },
        pipeline: $.pipeline()
          .match(_.expr($.and([
            $.eq(['$cardId', '$$card_id']),
            $.eq(['$status', 1])
          ])))
          .count('num')
          .done(),
        as: 'followNum',
      })
      .lookup({
        from: 'follow',
        let: {
          card_id: '$_id'
        },
        pipeline: $.pipeline()
          .match(_.expr($.and([
            $.eq(['$cardId', '$$card_id']),
            $.eq(['$_openid', OPENID])
          ])))
          .done(),
        as: 'myFollow',
      })
      .end()
    const data = doc.list.map(it => {
      it.followNum = it.followNum.length ? it.followNum[0].num : 0
      if (it.myFollow.length && it.myFollow[0].status === 1) {
        it.myFollow = true
      } else {
        it.myFollow = false
      }
      return it
    })

    resolve({
      success: true,
      data
    })
  })
}
