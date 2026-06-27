// 云函数入口文件
const cloud = require('wx-server-sdk')

// 与小程序端一致，均需调用 init 方法初始化
cloud.init()

// 可在入口函数外缓存 db 对象
const db = cloud.database()

// 数据库查询更新指令对象
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const id = event.id
  let record
  try {
    const querResult = await db.collection('article')
      .doc(id)
      .get()
    record = querResult.data
  } catch (err) {
    // 用户第一次上传分数
  }
  if (record) {
    return {
      success: true,
      code: 200,
      record
    }
  } else {
    return {
      success: false,
      code: 404,
      msg: '找不到记录'
    }
  }
}
