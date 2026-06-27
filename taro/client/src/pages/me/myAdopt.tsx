import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './myAdopt.less'

export default class Index extends Component {

  state = {
    page: 1,
    adoptList: [],
    next: true,
    statusList: {
      '-1': '黑名单',
      '1': '正常',
      '2': '已删除',
    }
  }

  componentWillMount() {
    this.more()
  }
  onReachBottom() {
    this.more()
  }
  more() {
    if (this.state.next) {
      this.getList()
    }
  }
  async getList(refresh = false) {
    let index = refresh ? 1 : this.state.page
    Taro.showLoading({
      title: '加载中'
    })
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'adoptOpt',
      data: {
        optType: 'queryMy',
        index
      }
    }).then(res => {
      Taro.hideLoading()
      if (res.result.success) {
        let list: any = refresh ? [] : this.state.adoptList
        let page = index + 1
        list.push(...res.result.data)
        this.setState({
          next: res.result.data.length >= 10,
          page,
          adoptList: list
        })
      }
    })
  }
  deleteAdopt(id) {
    Taro.showModal({
      title: '确认删除',
      content: '删除后不可恢复，是否确认删除？',
    })
      .then(res => {
        if (res.confirm) {
          Taro.cloud.callFunction({
            // 要调用的云函数名称
            name: 'adoptOpt',
            data: {
              optType: 'deleteAdopt',
              id
            }
          }).then(res => {
            if (res.result.success) {
              console.log(res)
              let adoptList = this.state.adoptList
              let user: number = adoptList.findIndex((i: any) => i._id === id)
              adoptList.splice(user, 1)
              Taro.showToast({
                title: '删除成功'
              })
              this.setState({
                adoptList
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
  refresh(id) {
    Taro.showLoading({
      title: '刷新中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'adoptOpt',
      data: {
        optType: 'refresh',
        id
      }
    }).then(res => {
      Taro.hideLoading()
      if (res.result.success) {
        Taro.showToast({
          title: '刷新成功'
        })
        this.getList(true)
      } else {
        Taro.showToast({
          title: res.result.msg,
          icon: 'none'
        })
      }
    })
  }
  toDetail(id) {
    Taro.navigateTo({
      url: '/pages/adopt/detail?id=' + id
    })
  }
  render() {
    return (
      <View className='me'>
        {this.state.adoptList.length ? null : <View className='no-more'>
          <View className='icon icon-cat_missing' />
          还没有记录，快去送养吧
        </View>}
        {this.state.adoptList.map((item: any) =>
          <View className='my-card' key={item._id}>
            <Image className='card-avatar' mode='aspectFill' src={item.avatar || item.cover[0].url} />
            <View className='card-title'><View className='title-text'>{item.title}</View><View className='title-status'>[{this.state.statusList[item.status]}]</View></View>
            <View className='at-article__info'>{new Date(item.time).toLocaleDateString()}</View>
            <AtButton className='card-btn' size='small' circle type='primary' onClick={this.toDetail.bind(this, item._id)}>查看</AtButton>
            <AtButton className='card-btn' size='small' circle type='primary' onClick={this.refresh.bind(this, item._id)}>刷新</AtButton>
            {/* <AtButton className='card-btn' size='small' circle type='primary'>编辑</AtButton> */}
            <AtButton className='card-btn card-btn-del' size='small' circle type='primary' onClick={this.deleteAdopt.bind(this, item._id)}>删除</AtButton>
          </View>
        )}
      </View>
    )
  }
}
