import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'
import { AtCard } from 'taro-ui'
import './notice.less'

export default class Index extends Component {
  state = {
    type: 1,
    list: [],
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    this.setState({
      type: parseInt(Router.params.type) || 1
    }, this.getInfo.bind(this))
  }
  getInfo() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'queryNotice',
      data: {
        type: this.state.type
      },
      success: (res: any) => {
        const list = res.result.data.map(it => {
          if (it.type === 1) {
            it.msg = (it.user ? it.user.info.nickName : '游客') + '评论了你的状态'
          } else if (it.type === 2) {
            it.msg = (it.user ? it.user.info.nickName : '游客') + '回复了你的评论'
          } else if (it.type === 3) {
            it.msg = (it.user ? it.user.info.nickName : '游客') + '赞了你的状态'
          } else if (it.type === 4) {
            it.msg = (it.user ? it.user.info.nickName : '游客') + '关注了' + it.source.name
          }
          return it
        })
        this.setState({
          list
        })
      }
    })
  }
  jump(url) {
    Taro.navigateTo({
      url
    })
  }
  render() {
    return (
      <View className='notice'>
        {this.state.list.length
          ? <View>
            {this.state.list.map((item: any) =>
              <AtCard
                key={item._id}
                extra='去查看'
                title={item.msg}
                thumb={item.user ? item.user.info.avatarUrl : 'https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/app/avatar.png?sign=8254279da5604936d87cf1977254d0ac&t=1578852537'}
                onClick={this.jump.bind(this, item.type === 4 ? '/pages/ximao/card?id=' + item.source._id : '/pages/ximao/detail?id=' + item.source._id)}
              >
                {item.type === 4
                  ? <View className='card'>
                    <Image
                      className='cardImage'
                      src={item.source.avatar}
                      lazy-load='true'
                      mode='aspectFill'
                    />
                    <View className='name'>{item.source.name}</View>
                  </View>
                  : <View className='dynamic'>
                    <Image
                      className='cardImage'
                      src={item.source.cover[0].url}
                      lazy-load='true'
                      mode='aspectFill'
                    />
                    <View className='name'>{item.source.content}</View>
                  </View>}
              </AtCard>
            )}
          </View>
          : <View className='no-more'>
            <View className='icon icon-cat_missing' />
            没有新消息
          </View>}
      </View>
    )
  }
}
