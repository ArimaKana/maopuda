// 云函数入口文件
const cloud = require('wx-server-sdk');
const crypto = require('crypto');
const bucketPrefix = 'cloud://maopuda-sv4uw.6d61-maopuda-sv4uw-1300869164/qr/'
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const page = event.page
  const full_path = page + '?' + event.id;
  const qr_name_hash = crypto.createHash('md5').update(full_path).digest('hex')
  const temp_id = bucketPrefix + qr_name_hash + '.jpg'
  try {
    let getURLReault = await cloud.getTempFileURL({
      fileList: [temp_id]
    });
    // return getURLReault;
    let fileObj = getURLReault.fileList[0];
    if (fileObj.tempFileURL) {
      fileObj.fromCache = true
      return fileObj
    }

    // 生成小程序码
    const wxacodeResult = await cloud.openapi.wxacode.getUnlimited({
      scene: event.id,
      page: page,
      width: 280
    })
    // return wxacodeResult;
    if (wxacodeResult.errCode != 0) {
      // 生成二维码失败，返回错误信息
      return wxacodeResult;
    }
    // 上传到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: 'qr/' + qr_name_hash + '.jpg',
      fileContent: wxacodeResult.buffer,
    })
    return uploadResult;
  } catch (err) {
    return err
  }
}