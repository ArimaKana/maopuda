import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View } from '@tarojs/components'
import { AtList, AtListItem, AtNoticebar } from 'taro-ui'
import Bottom from '../../components/bottom/index'
import './index.less'

export default class Index extends Component {
  state = {
    current: 3,
    list: [],
    follow: 0,
    comment: 0,
    like: 0,
    showPublish: false
  }

  componentWillMount() {
    this.getPublishConfig()
  }
  componentDidShow() {
    this.getInfo()
  }
  getPublishConfig() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getConfig'
    })
      .then(async (res: any) => {
        this.setState({
          showPublish: res.result.showPub
        })
      })
  }
  getInfo() {
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'queryMyMessage',
      data: {
        index: 1
      },
      success: (res: any) => {
        Taro.hideLoading()
        if (res.result.success) {
          let list: any = []
          for (const i of res.result.data) {
            const user = i.send === res.result.me ? i.receive : i.send
            i.read = i.receive === res.result.me ? i.read : true
            const item = list.findIndex(i => i.user === user)
            if (item > -1) {
              list[item].content.push(i)
            } else {
              list.push({
                user,
                content: [i],
                info: res.result.users.find(it => it._id === user).info
              })
            }
          }
          for (const i of list) {
            i.count = i.content.filter(it => !it.read).length
          }
          console.log(list)
          this.setState({
            list,
            follow: res.result.follow,
            like: res.result.like,
            comment: res.result.comment
          })
        }
      }
    })
  }
  jump(url) {
    Taro.navigateTo({ url })
  }

  render() {
    return (
      <View className='message'>
        <AtNoticebar icon='bell' single showMore onGotoMore={this.jump.bind(this, '/pages/static/index')}>点击关注公众号 消息推送不迟到</AtNoticebar>
        <View className={'notice' + (this.state.showPublish ? '' : ' hide')}>
          <View className='col' onClick={this.jump.bind(this, '/pages/message/notice?type=1')}>
            <View className='icon icon-message'></View>
            <View className='text'>
              评论
              {this.state.comment ? <View className='dot'>{this.state.comment}</View> : null}
            </View>
          </View>
          <View className='col' onClick={this.jump.bind(this, '/pages/message/notice?type=2')}>
            <View className='icon icon-heart-fill like'></View>
            <View className='text'>
              点赞
              {this.state.like ? <View className='dot'>{this.state.like}</View> : null}
            </View>
          </View>
          <View className='col' onClick={this.jump.bind(this, '/pages/message/notice?type=3')}>
            <View className='icon icon-team fans'></View>
            <View className='text'>
              粉丝
              {this.state.follow ? <View className='dot'>{this.state.follow}</View> : null}
            </View>
          </View>
        </View>
        {this.state.list.length
          ? <AtList>
            {this.state.list.map((item: any) =>
              <AtListItem
                key={item._id}
                title={item.info.nickName}
                note={item.content[item.content.length - 1].type === 'adopt' ? '[猫咪信息]' : item.content[item.content.length - 1].text}
                thumb={item.info.avatarUrl}
                extraText={item.count || ''}
                onClick={this.jump.bind(this, '/pages/message/dialog?id=' + item.user)}
              />
            )}
          </AtList>
          : <View className='no-more'>
            <View className='icon icon-cat_missing' />
            还没有消息
        </View>}
        <Bottom current={this.state.current} />
      </View>
    )
  }
}
