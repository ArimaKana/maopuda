import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Picker } from '@tarojs/components'
import Card from '../../components/card/index'
import Bottom from '../../components/bottom/index'
import './index.less'

export default class Index extends Component {

  state = {
    current: 1,
    page: 1,
    adoptList: [],
    next: true,
    poi: ['全部', '全部', '全部'],
    showPublish: false
  }
  async onPullDownRefresh() {
    await this.getList(true)
    Taro.stopPullDownRefresh()
  }

  componentWillMount() {
    const poi = Taro.getStorageSync('poi')
    this.setState({
      poi: poi || ['全部', '全部', '全部']
    }, this.getList.bind(this))
    this.getPublishConfig()
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

  onShareAppMessage() {
    return {
      title: '猫普达Maopuda',
      imageUrl: 'https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/app/share.jpg?sign=a3d67103cfb1d0389e5aac0028e78211&t=1579160095'
    }
  }
  async getList(refresh = false) {
    let page = refresh ? 1 : this.state.page
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'adoptOpt',
      data: {
        optType: 'queryList',
        index: page,
        poi: this.state.poi
      }
    })
      .then(res => {
        if (res.result.success) {
          let list: any[] = []
          let index = page + 1
          if (!refresh) {
            list = this.state.adoptList
          }
          list.push(...res.result.data)
          this.setState({
            next: res.result.data.length >= 10,
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
  handleRegion(e) {
    this.setState({
      poi: e.detail.value
    }, this.getList.bind(this, true))
    Taro.setStorageSync('poi', e.detail.value)
  }
  jump(url) {
    Taro.navigateTo({ url })
  }
  get region() {
    if (this.state.poi[2] !== '全部') {
      return this.state.poi[2]
    } else if (this.state.poi[1] !== '全部') {
      return this.state.poi[1]
    } else if (this.state.poi[0] !== '全部') {
      return this.state.poi[0]
    } else {
      return '全国'
    }
  }
  render() {
    return (
      <View className='container'>
        <View className={'index-filter' + (this.state.showPublish ? '' : ' hide')}>

          <Picker mode='region' custom-item='全部' onChange={this.handleRegion.bind(this)} value={this.state.poi}>
            <View className='index-region'>
              <View className='icon icon-location' />
              {this.region}
            </View>
          </Picker>
          <View className='toSend' onClick={this.jump.bind(this, '/pages/adopt/publish')}>我要送养</View>
        </View>
        {this.state.adoptList.length
          ?
          <View className='index-list'>
            {this.state.adoptList.map((adopt: any) => <Card adopt={adopt} key={adopt._id} />)}
          </View>
          : <View className='no-more'>
            <View className='icon icon-cat_missing' />
            这里没有猫，切换地区试试～
        </View>}
        <Bottom current={this.state.current} />
      </View>
    )
  }
}
