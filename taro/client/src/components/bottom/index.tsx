import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { AtTabBar } from 'taro-ui'

export default class Bottom extends Component {
  state = {
    tabList: [
      { title: '首页', iconType: 'home', iconPrefixClass: 'icon' },
      { title: '领养', iconType: 'compass', iconPrefixClass: 'icon' },
      { title: '小卖铺', iconType: 'cat_wool_ball', iconPrefixClass: 'icon' },
      { title: '消息', iconType: 'comment', iconPrefixClass: 'icon' },
      { title: '我的', iconType: 'user', iconPrefixClass: 'icon' }
    ]
  }
  props: {
    current: number
  }
  componentDidShow() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'queryUnreadMessage'
    }).then((res:any) => {
      console.log(res)
      if (res.result.success && res.result.data) {
        let tabList: any = this.state.tabList
        tabList[3].text = res.result.data
        // tabList[3].dot = true
        this.setState({
          tabList
        })
      }
    })
  }
  handleClick(value) {
    if (value === this.props.current) {
      return false
    }
    const tab = [
      '/pages/index/index',
      '/pages/adopt/index',
      '/pages/maopian/index',
      '/pages/message/index',
      '/pages/me/index',
    ]
    if(value===2){
      // Taro.navigateTo({ url: tab[2] })
      Taro.navigateToMiniProgram({
        appId: 'wx45420ceeff868b05'
      })
    }else{
      Taro.redirectTo({ url: tab[value] })
    }
    // Taro.redirectTo({ url: tab[value] })
  }
  render() {
    return (
      <AtTabBar
        selectedColor='#51A9FC'
        iconSize={20}
        fixed
        tabList={this.state.tabList}
        onClick={this.handleClick.bind(this)}
        current={this.props.current}
      />
    )
  }
}
