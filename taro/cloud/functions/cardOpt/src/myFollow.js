module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    let query = {
      status: _.eq(1),
      _openid: _.eq(OPENID)
    }
    const list = await db.collection('follow')
      .where(query)
      .orderBy('time', 'desc')
      .skip((i - 1) * 10)
      .limit(10)
      .get()

    const res = await db.collection('follow')
      .where(query)
      .count()

    resolve({
      success: true,
      data: list.data,
      total: res.total
    })
  })
}
