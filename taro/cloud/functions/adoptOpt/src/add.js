const uuid = require('uuid/v1')
module.exports = async (db, _, event, OPENID) => {
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
        return false
      }
    } else {
      resolve({
        success: false,
        code: 600,
        msg: '用户未登录'
      })
      return false
    }
    let err = {
      success: false,
      code: 500,
      msg: '参数不全'
    }

    if (!Array.isArray(event.poi) || event.poi.findIndex(i => i === '全部') > -1) {
      resolve(err)
      return false
    }
    console.log(Array.isArray(event.cover))
    // 参数校验
    if (typeof event.title !== 'string' || !event.title || event.title.length > 16) {
      resolve(err)
      return false
    } else if (typeof event.age !== 'number') {
      resolve(err)
      return false
    } else if (typeof event.desc !== 'string' || !event.desc || event.desc.length > 200) {
      resolve(err)
      return false
    } else if (typeof event.sex !== 'number') {
      resolve(err)
      return false
    } else if (typeof event.jueyu !== 'number' || !event.jueyu) {
      resolve(err)
      return false
    } else if (typeof event.quchong !== 'number' || !event.quchong) {
      resolve(err)
      return false
    } else if (typeof event.yimiao !== 'number' || !event.yimiao) {
      resolve(err)
      return false
    } else if (!Array.isArray(event.cover) || !event.cover.length) {
      resolve(err)
      return false
    }

    // 以 openid-score 作为记录 id
    const docId = uuid().replace(/-/g, '')
    // 创建新的用户记录
    await db.collection('cat').add({
      // data 是将要被插入到 cat 集合的 JSON 对象
      data: {
        // 这里指定了 _id，如果不指定，数据库会默认生成一个
        _id: docId,
        // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
        _openid: OPENID,
        // 标题
        title: event.title,
        // 性别
        sex: event.sex,
        // 绝育
        jueyu: event.jueyu,
        // 驱虫
        quchong: event.quchong,
        // 疫苗
        yimiao: event.yimiao,
        // 年龄
        age: event.age,
        // 位置信息
        poi: event.poi,
        // 图片
        cover: event.cover,
        // 描述
        desc: event.desc,
        // 创建时间
        time: new Date().getTime(),
        // 状态 1:正常 2:关闭 -1:异常
        status: 1
      }
    })

    resolve({
      success: true,
      created: true,
    })
  })
}
