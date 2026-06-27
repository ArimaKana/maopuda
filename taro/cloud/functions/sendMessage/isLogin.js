/**
 * 判断用户权限
 */
module.exports = function (db, OPENID) {
  return new Promise(async resolve => {
    let record
    try {
      const querResult = await db.collection('user')
        .doc(OPENID)
        .get()
      record = querResult.data
    } catch (err) {
      // 用户第一次上传分数
    }
    if (record) {
      if (record.role === -1) {
        resolve({
          success: false,
          code: 403,
          msg: '你没有权限'
        })
      }
    } else {
      resolve({
        success: false,
        code: 600,
        msg: '用户未登录'
      })
    }
    resolve({
      success: true,
      code: 200
    })
  })
}