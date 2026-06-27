import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { WebView } from '@tarojs/components'

export default class Detail extends Component {

  state = {
    link: ''
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'queryArticleDetail',
      data: {
        id: Router.params.id
      },
      success: (res: any) => {
        Taro.hideLoading()
        if (res.result.success) {
          let data = res.result.record
          this.setState({
            link: data.link
          })
        }
      },
      fail: () => {
        Taro.hideLoading()
        Taro.showToast({
          title: '发生错误，请稍后再试',
          icon: 'none'
        })
      }
    })

  }
  render() {
    return (
      <WebView src={this.state.link}></WebView>
    )
  }
}
