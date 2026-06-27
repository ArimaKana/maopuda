module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    const exp = db.RegExp({
      regexp: event.text,
      options: 'i',
    })
    const doc = await db.collection('cat')
      .aggregate()
      .match(_.or([
        {
          status: _.eq(1),
          title: exp
        },
        {
          status: _.eq(1),
          desc: exp
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
