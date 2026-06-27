module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const i = event.index
    let record
    try {
      const querResult = await db.collection('user')
        .doc(OPENID)
        .get()
      record = querResult.data
    } catch (err) {
      // 用户未注册
    }
    if (record && record.role === 2) {
      const list = await db.collection('cat')
        .orderBy('time', 'desc')
        .skip((i - 1) * 10)
        .limit(10)
        .get()

      resolve({
        success: true,
        data: list.data
      })
    }
    resolve({
      success: false,
      code: 403,
      msg: '你没有权限'
    })
  })
}
