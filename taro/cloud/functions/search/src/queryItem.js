module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    const exp = db.RegExp({
      regexp: event.text,
      options: 'i',
    })
    const $ = _.aggregate
    const doc = await db.collection('item')
      .aggregate()
      .match(_.or([
        {
          status: _.eq(1),
          name: exp
        },
        {
          status: _.eq(1),
          description: exp
        }
      ]))
      .sort({ time: -1 })
      .skip((i - 1) * 10)
      .limit(10)
      .end()

    resolve({
      success: true,
      data: doc.list
    })
  })
}
