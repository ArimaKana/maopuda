// 云函数入口文件
const cloud = require('wx-server-sdk')
const uuid = require('uuid/v1')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  let record
  try {
    const querResult = await db.collection('user')
      .doc(OPENID)
      .get()
    record = querResult.data
  } catch (err) {
    // 用户第一次上传分数
  }
  let err = {
    success: false,
    code: 500,
    msg: '参数不全'
  }
  if (record && record.role === 2) {
    // 参数校验
    if (typeof event.cover !== 'string') {
      return err
    } else if (typeof event.link !== 'string') {
      return err
    }

    // 以 openid-score 作为记录 id
    const docId = uuid().replace(/-/g, '')
    // 创建新的用户记录
    await db.collection('article').add({
      // data 是将要被插入到 newsList 集合的 JSON 对象
      data: {
        // 这里指定了 _id，如果不指定，数据库会默认生成一个
        _id: docId,
        // 这里指定了 _openid，因在云函数端创建的记录不会默认插入用户 openid，如果是在小程序端创建的记录，会默认插入 _openid 字段
        _openid: OPENID,
        // 标题
        link: event.link,
        // 封面
        cover: event.cover,
        // 创建时间
        time: new Date().getTime(),
        // 状态 1:正常 2:关闭 -1:异常
        status: 1
      }
    })
  } else {
    return {
      success: false,
      code: 403,
      msg: '你没有权限'
    }
  }

  return {
    success: true,
    created: true,
  }
}
