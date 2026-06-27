import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'
import { AtTabs } from 'taro-ui'
import Card from '../../components/card/dynamic'
import './dynamic.less'

export default class Index extends Component {

  state = {
    current: 0,
    page: 1,
    dynamicList: [],
    next: true,
    nav: [
      { title: '全部' },
      { title: '关注' },
      { title: '赞过' },
      { title: '我的' }
    ]
  }
  async onPullDownRefresh() {
    await this.getList(true)
    Taro.stopPullDownRefresh()
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    this.setState({
      current: parseInt(Router.params.type) || 0
    }, this.getList.bind(this))
  }
  onShareAppMessage() {
    return {
      title: '猫普达Maopuda',
      imageUrl: 'https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/app/share.jpg?sign=a3d67103cfb1d0389e5aac0028e78211&t=1579160095'
    }
  }
  async getList(refresh = false) {
    let page = refresh ? 1 : this.state.page
    let type = 'all'
    if (this.state.current === 3) {
      type = 'my'
    } else if (this.state.current === 2) {
      type = 'like'
    } else if (this.state.current === 1) {
      type = 'follow'
    }
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'dynamicOpt',
      data: {
        optType: 'queryList',
        type,
        index: page
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          let list: any[] = []
          let index = page + 1
          if (!refresh) {
            list = this.state.dynamicList
          }
          list.push(...res.result.data)
          this.setState({
            next: res.result.data.length,
            page: index,
            dynamicList: list
          })
        }
      })
  }
  onReachBottom() {
    if (this.state.next) {
      this.getList()
    }
  }
  jump(url) {
    Taro.navigateTo({ url })
  }
  handleClick(i) {
    this.setState({
      current: i
    }, this.getList.bind(this, true))
  }
  like(dynamicId, i) {
    let list: any = this.state.dynamicList
    list[i].myLike = !list[i].myLike
    if (list[i].myLike) {
      list[i].likeNum += 1
    } else {
      list[i].likeNum -= 1
    }
    this.setState({
      dynamicList: list
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'dynamicOpt',
      data: {
        optType: 'like',
        status: list[i].myLike ? 1 : 2,
        dynamicId
      }
    })
  }
  render() {
    return (
      <View className='dynamic'>
        <AtTabs
          current={this.state.current}
          scroll
          tabList={this.state.nav}
          onClick={this.handleClick.bind(this)}
        />
        {
          this.state.current === 0 ?
            <View className='topicSquire hide'>
              <View className='topicTitle' onClick={this.jump.bind(this, '/pages/ximao/index')}>
                <View className='text'><View className='icon icon-fire'></View>热门话题</View>
              </View>
              <View className='topicList'>
                <View className='topicItem'>
                  <Image className='topicImage' mode='aspectFill' src='https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/tmp_5d7501ef6cbfebd2288e08fd6115279cf46d60844077bc5c.jpg' />
                  <View className='topicName'>#ashdja</View>
                </View>
              </View>
            </View>
            : null
        }
        {this.state.dynamicList.length
          ? <View className='index-list'>
            <View className='col'>
              {this.state.dynamicList.map((it: any, i) => {
                if (i % 2 === 0) {
                  return <Card key={it._id} dynamic={it} onLike={this.like.bind(this, it._id, i)} />
                }
              })}
            </View>
            <View className='col'>
              {this.state.dynamicList.map((it: any, i) => {
                if (i % 2 === 1) {
                  return <Card key={it._id} dynamic={it} onLike={this.like.bind(this, it._id, i)} />
                }
              })}
            </View>
          </View>
          : <View className='no-more'>
            <View className='icon icon-cat_missing' />
            还没有动态～
        </View>}
        <View className='importantBtn icon icon-plus' onClick={this.jump.bind(this, '/pages/ximao/send')}></View>
      </View>
    )
  }
}
