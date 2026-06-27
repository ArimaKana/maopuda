import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Picker } from '@tarojs/components'
import { AtTabs } from 'taro-ui'
import Card from '../../components/card/card'
import './index.less'

export default class Index extends Component {

  state = {
    current: 0,
    page: 1,
    cardList: [],
    next: true,
    nav: [
      { title: '全部' },
      { title: '关注' },
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
    if (this.state.current === 2) {
      type = 'my'
    } else if (this.state.current === 1) {
      type = 'follow'
    }
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'queryList',
        type,
        index: page
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          const data = res.result.data.map(i => {
            i.birth = new Date(i.birth)
            i.age = Math.floor((Date.now() - i.birth) / (1000 * 60 * 60 * 24 * 365))
            return i
          })
          let list: any[] = []
          let index = page + 1
          if (!refresh) {
            list = this.state.cardList
          }
          list.push(...data)
          this.setState({
            next: data.length,
            page: index,
            cardList: list
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
  follow(cardId, i) {
    let list: any = this.state.cardList
    list[i].myFollow = !list[i].myFollow
    if (list[i].myFollow) {
      list[i].followNum += 1
    } else {
      list[i].followNum -= 1
    }
    this.setState({
      cardList: list
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'follow',
        status: list[i].myFollow ? 1 : 2,
        cardId
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
        {this.state.cardList.length
          ? <View className='index-list'>
            {this.state.cardList.map((it: any, i) => <Card key={it._id} card={it} onFollow={this.follow.bind(this, it._id, i)} />)}
          </View>
          : <View className='no-more'>
            <View className='icon icon-cat_missing' />
            还没有猫咪～
        </View>}
      </View>
    )
  }
}
