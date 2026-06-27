const uuid = require('uuid/v1')
const isLogin = require('./isLogin')
module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    /**
     * 校验用户权限
     */
    let login = await isLogin(db, OPENID)
    if (!login.success) {
      resolve(login)
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
    // 参数校验
    if (typeof event.name !== 'string' || !event.name || event.name.length > 10) {
      resolve(err)
      return false
    } else if (typeof event.brief !== 'string' || !event.brief || event.brief.length > 50) {
      resolve(err)
      return false
    } else if (typeof event.avatar !== 'string' || !event.avatar) {
      resolve(err)
      return false
    } else if (typeof event.birth !== 'string' || !event.birth) {
      resolve(err)
      return false
    } else if (typeof event.sex !== 'number' || !event.sex) {
      resolve(err)
      return false
    } else if (typeof event.weight !== 'number' || !event.weight) {
      resolve(err)
      return false
    } else if (typeof event.food !== 'string' || !event.food) {
      resolve(err)
      return false
    } else if (typeof event.snack !== 'string' || !event.snack) {
      resolve(err)
      return false
    } else if (typeof event.jueyu !== 'number' || !event.jueyu) {
      resolve(err)
      return false
    } else if (!Array.isArray(event.tag) || event.tag.length > 3) {
      resolve(err)
      return false
    }

    // 以 openid-score 作为记录 id
    const docId = uuid().replace(/-/g, '')
    // 创建新的用户记录
    await db.collection('card').add({
      // data 是将要被插入到 cat 集合的 JSON 对象
      data: {
        // 这里指定了 _id，如果不指定，数据库会默认生成一个
        _id: docId,
        // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
        _openid: OPENID,
        // 头像
        avatar: event.avatar,
        // 昵称
        name: event.name,
        // 简介
        brief: event.brief,
        // 生日
        birth: event.birth,
        // 性别
        sex: event.sex,
        // 位置
        poi: event.poi,
        // 标签
        tag: event.tag,
        // 体重
        weight: event.weight,
        // 爱好主粮
        food: event.food,
        // 爱好零食
        snack: event.snack,
        // 绝育状态
        jueyu: event.jueyu,
        // 粉丝数
        fans: 0,
        // 创建时间
        time: new Date().getTime(),
        // 状态 1:正常 2:删除 -1:异常
        status: 1
      }
    })

    resolve({
      success: true,
      created: true,
    })
  })
}
