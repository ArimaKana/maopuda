module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const id = event.id
    try {
      let res = await db.collection('cat')
        .doc(id)
        .get()
      const adopt = res.data
      if (adopt && adopt._openid === OPENID) {
        await db.collection('cat')
          .doc(id)
          .update({
            data: {
              time: new Date().getTime()
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
