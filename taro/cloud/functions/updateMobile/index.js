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
  let record
  let mobile
  try {
    console.log(event.mobile)
    const querResult = await db.collection('user')
      .doc(OPENID)
      .get()
    record = querResult.data
    mobile = event.mobile.data.phoneNumber
  } catch (err) {
    // 用户未注册
  }
  if (record && mobile) {
    await db.collection('user')
      .doc(OPENID)
      .update({
        data: {
          mobile
        }
      })
    return {
      success: true,
      mobile
    }
  } else {
    return {
      success: false,
      code: 600
    }
  }
}
