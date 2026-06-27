module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    const exp = db.RegExp({
      regexp: event.text,
      options: 'i',
    })
    const $ = _.aggregate
    const doc = await db.collection('card')
      .aggregate()
      .match(_.or([
        {
          status: _.eq(1),
          name: exp
        },
        {
          status: _.eq(1),
          brief: exp
        }
      ]))
      .sort({ time: -1 })
      .skip((i - 1) * 10)
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
