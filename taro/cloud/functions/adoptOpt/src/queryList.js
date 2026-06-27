module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    const query = {
      status: _.eq(1)
    }
    if (Array.isArray(event.poi) && event.poi[0] !== '全部') {
      let poi = event.poi[2] !== '全部' ? event.poi[2] : event.poi[1]
      if (poi === '全部') {
        poi = event.poi[0]
      }
      console.log(poi)
      query.poi = _.elemMatch(_.eq(poi))
    }
    const list = await db.collection('cat')
      .where(query)
      .field({
        _id: true,
        title: true,
        poi: true,
        age: true,
        sex: true,
        desc: true,
        avatar: true,
        cover: true
      })
      .orderBy('time', 'desc')
      .skip((i - 1) * 10)
      .limit(10)
      .get()

    resolve({
      success: true,
      data: list.data
    })
  })
}
