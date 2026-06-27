import Taro from '@tarojs/taro'
import { View, Picker } from '@tarojs/components'
import React, { Component }  from 'react'
import { AtTabs, AtSearchBar } from 'taro-ui'
import Card from '../../components/card/card'
import Dynamic from '../../components/card/dynamic'
import Adopt from '../../components/card/index'
import Item from '../../components/card/item'
import './search.less'

export default class Index extends Component {
  state = {
    current: 0,
    page: 1,
    adoptList: [],
    next: true,
    nav: [
      { title: '领养' },
      { title: '吸猫' },
      { title: '猫咪' },
      // { title: '商品' }
    ],
    value: '',
    word: ''
  }
  async onPullDownRefresh() {
    await this.getList(true)
    Taro.stopPullDownRefresh()
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    this.setState({
      word: Router.params.word || ''
    }, this.getList.bind(this))
  }
  onShareAppMessage() {
    return {
      title: '猫普达Maopuda',
      imageUrl: 'https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/app/share.jpg?sign=a3d67103cfb1d0389e5aac0028e78211&t=1579160095'
    }
  }
  onChange(value) {
    this.setState({
      word: value
    })
  }
  async getList(refresh = false) {
    if (!this.state.word) {
      return false
    }
    let page = refresh ? 1 : this.state.page
    let type = 'queryAdopt'
    if (this.state.current === 1) {
      type = 'queryDynamic'
    } else if (this.state.current === 2) {
      type = 'queryCard'
    } else if (this.state.current === 3) {
      type = 'queryItem'
    }
    Taro.showLoading({
      title: '加载中'
    })
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'search',
      data: {
        optType: type,
        text: this.state.word,
        index: page
      }
    })
      .then((res: any) => {
        Taro.hideLoading()
        if (res.result.success) {
          let data = res.result.data
          if (this.state.current === 2) {
            data = res.result.data.map(i => {
              i.birth = new Date(i.birth)
              i.age = Math.floor((Date.now() - i.birth) / (1000 * 60 * 60 * 24 * 365))
              return i
            })
          }
          let list: any[] = []
          let index = page + 1
          if (!refresh) {
            list = this.state.adoptList
          }
          list.push(...data)
          this.setState({
            next: data.length >= 10,
            page: index,
            adoptList: list
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
      current: i,
      adoptList:[]
    }, this.getList.bind(this, true))
  }
  like(dynamicId, i) {
    let list: any = this.state.adoptList
    list[i].myLike = !list[i].myLike
    if (list[i].myLike) {
      list[i].likeNum += 1
    } else {
      list[i].likeNum -= 1
    }
    this.setState({
      adoptList: list
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
  follow(cardId, i) {
    let list: any = this.state.adoptList
    list[i].myFollow = !list[i].myFollow
    if (list[i].myFollow) {
      list[i].followNum += 1
    } else {
      list[i].followNum -= 1
    }
    this.setState({
      adoptList: list
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
      <View className='search'>
        <AtSearchBar
          value={this.state.word}
          placeholder='搜索:猫咪/动态/商品'
          onChange={this.onChange.bind(this)}
          onActionClick={this.getList.bind(this, true)}
        />
        <AtTabs
          current={this.state.current}
          scroll
          tabList={this.state.nav}
          onClick={this.handleClick.bind(this)}
        />
        {this.state.adoptList.length && this.state.current === 0
          ? <View className='index-list'>
            {this.state.adoptList.map((adopt: any) => <Adopt key={adopt._id} adopt={adopt} />)}
          </View>
          : null}
        {this.state.adoptList.length && this.state.current === 1
          ? <View className='dynamic-list'>
            <View className='col'>
              {this.state.adoptList.map((it: any, i) => {
                if (i % 2 === 0) {
                  return <Dynamic key={it._id} dynamic={it} onLike={this.like.bind(this, it._id, i)} />
                }
              })}
            </View>
            <View className='col'>
              {this.state.adoptList.map((it: any, i) => {
                if (i % 2 === 1) {
                  return <Dynamic key={it._id} dynamic={it} onLike={this.like.bind(this, it._id, i)} />
                }
              })}
            </View>
          </View>
          : null}
        {this.state.adoptList.length && this.state.current === 2
          ? <View className='index-list'>
            {this.state.adoptList.map((it: any, i) => <Card key={it._id} card={it} onFollow={this.follow.bind(this, it._id, i)} />)}
          </View>
          : null}
        {this.state.adoptList.length && this.state.current === 3
          ? <View className='item-list'>
            {this.state.adoptList.map((adopt: any) => <Item key={adopt._id} item={adopt} />)}
          </View>
          : null}
        {!this.state.adoptList.length
          ? <View className='no-more'>
            <View className='icon icon-cat_missing' />
            什么都没搜到
          </View>
          : null}
      </View>
    )
  }
}
