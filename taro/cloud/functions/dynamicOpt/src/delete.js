module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const id = event.id
    try {
      const res = await db.collection('dynamic')
        .doc(id)
        .get()
      const dynamic = res.data
      if (dynamic && dynamic._openid === OPENID) {
        await db.collection('dynamic')
          .doc(id)
          .update({
            data: {
              status: 2
            }
          })
        resolve({
          success: true
        })
      }
    } catch (err) {
      console.error(err)
    }
    resolve({
      success: false,
      code: 403,
      msg: '你没有权限'
    })
  })
}
