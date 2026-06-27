import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './news.less'

export default class Index extends Component {
  state = {
    allList: [],
    adopts: {
      page: 1,
      next: true
    },
    statusList: {
      '-1': '黑名单',
      '1': '正常',
      '2': '已删除',
    }
  }

  componentWillMount() {
    this.moreAdopt()
  }
  onReachBottom() {
    this.moreAdopt()
  }
  moreAdopt() {
    if (this.state.adopts.next) {
      this.getAdoptList()
    }
  }
  async getAdoptList(refresh = false) {
    let index = refresh ? 1 : this.state.adopts.page
    Taro.showLoading({
      title: '加载中'
    })
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'queryAllNews',
      data: {
        index
      }
    }).then(res => {
      Taro.hideLoading()
      if (res.result.success) {
        let adopts: any = this.state.adopts
        adopts.next = res.result.data.length >= 10
        adopts.page = index + 1
        let allList: any = refresh ? [] : this.state.allList
        allList.push(...res.result.data)
        this.setState({
          adopts,
          allList
        })
      }
    })
  }
  setAdoptBlack(id) {
    Taro.showModal({
      title: '确认删除',
      content: '删除后不可恢复，是否确认删除？',
    })
      .then(res => {
        if (res.confirm) {
          Taro.cloud.callFunction({
            // 要调用的云函数名称
            name: 'delNews',
            data: {
              id,
              status: 2
            }
          }).then(res => {
            if (res.result.success) {
              console.log(res)
              let allList = this.state.allList
              let user: any = allList.find((i: any) => i._id === id)
              user.status = 2
              Taro.showToast({
                title: '删除成功'
              })
              this.setState({
                allList
              })
            } else {
              Taro.showToast({
                title: res.result.msg,
                icon: 'none'
              })
            }
          })
        }
      })
  }
  toDetail(id) {
    Taro.navigateTo({
      url: '/pages/news/read?id=' + id
    })
  }
  toEdit(id) {
    Taro.navigateTo({
      url: '/pages/manage/publish?id=' + id
    })
  }
  toPublish() {
    Taro.navigateTo({
      url: '/pages/manage/publish'
    })
  }
  render() {
    return (
      <View className='allNews'>
        <AtButton type='primary' onClick={this.toPublish.bind(this)}>添加公告</AtButton>
        {this.state.allList.map((item: any) =>
          <View className='my-card' key={item._id}>
            <Image className='card-avatar' mode='aspectFill' src={item.cover} />
            <View className='card-title'>[{this.state.statusList[item.status]}]</View>
            <View className='at-article__info'>{new Date(item.time).toLocaleDateString()}</View>
            <AtButton className='card-btn' size='small' circle type='primary' onClick={this.toDetail.bind(this, item._id)}>查看</AtButton>
            <AtButton className='card-btn' size='small' circle type='primary' onClick={this.toEdit.bind(this, item._id)}>编辑</AtButton>
            <AtButton className='card-btn card-btn-del' size='small' circle type='primary' onClick={this.setAdoptBlack.bind(this, item._id)}>删除</AtButton>
          </View>
        )}
      </View>
    )
  }
}
