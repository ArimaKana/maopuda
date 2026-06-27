module.exports = async (db, _, event, OPENID) => {
  return new Promise(async resolve => {
    const id = event.id
    const i = event.index
    const $ = _.aggregate
    try {
      const doc = await db.collection('comment')
        .aggregate()
        .match({
          dynamicId: _.eq(id)
        })
        .sort({ time: -1 })
        .skip((i - 1) * 10)
        .limit(10)
        .lookup({
          from: 'comment',
          localField: 'replyId',
          foreignField: '_id',
          as: 'reply',
        })
        .lookup({
          from: 'user',
          let: {
            comment_user: '$_openid'
          },
          pipeline: $.pipeline()
            .match(_.expr($.eq(['$_id', '$$comment_user'])))
            .project({
              'info.avatarUrl': 1,
              'info.nickName': 1
            })
            .done(),
          as: 'user',
        })
        .end()
      const comment = doc.list
      resolve({
        success: true,
        code: 200,
        comment
      })
    } catch (err) {
      console.log(err)
      // 用户第一次上传分数
    }
    resolve({
      success: false,
      code: 404,
      msg: '找不到记录'
    })
  })
}
