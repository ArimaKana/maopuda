const isAdmin = require('./isAdmin')
module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    /**
     * 校验用户权限
     */
    let record = await isAdmin(db, OPENID)
    if (!record.success) {
      resolve(err)
      return false
    }
    const id = event.id
    try {
      let res = await db.collection('video')
        .doc(id)
        .get()
      const video = res.data
      if (video && video._openid === OPENID) {
        await db.collection('video')
          .doc(id)
          .update({
            data: {
              status: 2
            }
          })
        resolve({
          success: true
        })
        return false
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
