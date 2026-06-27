import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View,Image } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './index.less'

export default class Index extends Component {

  state = {}

  downQR() {
    Taro.downloadFile({
      url: 'https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/app/qr.JPG?sign=75af7106a4f4698523fa380a0c54846a&t=1581671692',
      success: (doc:any)=> {
        Taro.saveImageToPhotosAlbum({
          filePath: doc.tempFilePath
        })
          .then((res: any) => {
            if (res.errMsg === 'saveImageToPhotosAlbum:ok') {
              Taro.hideLoading()
              Taro.showToast({
                title: '保存成功'
              })
            }
          })
      }
    })
  }
  render() {
    return (
      <View className='static'>
        <View className='login-logo'></View>
        <View className='login-text'>关注猫普达公众号</View>
        <AtButton
          className='login-btn'
          onClick={this.downQR.bind(this)}
          circle
        >
          点击保存二维码
          </AtButton>
        <View className='login-text'>如何关注公众号？</View>
        <View className='sub-text'>点击微信右上角加号，点击扫一扫</View>
        <Image
          className='cardImage'
          src='https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/app/follow1.JPG?sign=3cf1bc9687dd17fb9baab257691edfef&t=1581674096'
          lazy-load='true'
          mode='widthFix'
        />
        <View className='sub-text'>点击右下角相册按钮选择二维码扫描</View>
        <Image
          className='cardImage'
          src='https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/app/follow2.jpg?sign=da67e00aa93cfba53ad323bc4674a6fa&t=1581674109'
          lazy-load='true'
          mode='widthFix'
        />
      </View>
    )
  }
}
