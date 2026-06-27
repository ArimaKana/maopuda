module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    const query = {
      status: _.eq(1)
    }
    const list = await db.collection('video')
      .where(query)
      .field({
        _id: true,
        content: true,
        src: true,
        time: true,
        height:true
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
