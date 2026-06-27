import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './index.less'

export default class Index extends Component {

  state = {}

  getMobile(e) {
    try {
      const mobile = Taro.cloud.CloudID(e.detail.cloudID)
      Taro.cloud.callFunction({
        // 要调用的云函数名称
        name: 'updateMobile',
        data: { mobile },
        success: (res: any) => {
          console.log('updateMobile', res)
          if (res.result.success) {
            Taro.navigateBack()
          } else {
            Taro.showToast({
              title: '登录失败，请检查系统时间或稍后重试',
              icon: 'none'
            })
          }
        }
      })
    } catch (err) {
      Taro.showToast({
        title: '发生错误，请更新微信客户端并重试',
        icon: 'none'
      })
    }
  }
  render() {
    return (
      <View className='login'>
        <View className='login-logo'></View>
        <View className='login-text'>欢迎注册猫普达</View>
        <View className='login-text'>请验证您的手机号</View>
        <AtButton
          className='login-btn'
          openType='getPhoneNumber'
          onGetPhoneNumber={this.getMobile.bind(this)}
          circle
        >
          认证手机号
          </AtButton>
      </View>
    )
  }
}
