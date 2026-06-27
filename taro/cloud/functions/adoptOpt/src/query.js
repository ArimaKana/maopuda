module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const id = event.id
    let record
    try {
      const querResult = await db.collection('cat')
        .doc(id)
        .get()
      record = querResult.data
    } catch (err) {
      // 用户第一次上传分数
    }
    if (record) {
      if (record._openid !== OPENID) {
        delete record.adopts
      }
      resolve({
        success: true,
        code: 200,
        record
      })
    }
    resolve({
      success: false,
      code: 404,
      msg: '找不到记录'
    })
  })
}
