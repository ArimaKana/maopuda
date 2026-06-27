module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const id = event.id
    try {
      const res = await db.collection('card')
        .doc(id)
        .get()
      const card = res.data
      if (card && card._openid === OPENID) {
        await db.collection('card')
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
