import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Input, Button, Image, ScrollView } from '@tarojs/components'
import './dialog.less'

export default class Index extends Component {
  state = {
    receive: '',
    ipx: false,
    list: [],
    value: '',
    scroll: ''
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    let model = Taro.getSystemInfoSync().model
    if (model.search('iPhone X') > -1 || model.search('iPhone1') > -1) {
      this.setState({
        ipx: true
      })
    }
    this.setState({
      receive: Router.params.id || Router.params.scene
    }, this.getInfo.bind(this))
  }
  getInfo() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'queryMessage',
      data: {
        id: this.state.receive
      },
      success: res => {
        const list = res.result.data.reverse().map((i, index) => {
          i.id = index
          if (i.type === 'adopt') {
            i.cat = res.result.cats.find(it => it._id === i.adopt)
          }
          return i
        })
        console.log(list)
        const user = res.result.users.find(i => i._id === this.state.receive).info
        Taro.setNavigationBarTitle({
          title: `${user.nickName}`
        })
        this.setState({
          list,
          scroll: `card-${list.length - 1}`
        })
      }
    })
  }
  changeValue(e) {
    this.setState({
      value: e.detail.value
    })
  }
  subscribeMessage() {
    const id = 'WciV4I7PaLf_3rajAEhlEBzfMu63F0PMZfKsCshSemU'
    Taro.requestSubscribeMessage({
      tmplIds: [id]
    })
  }
  sendMessage() {
    // this.subscribeMessage()
    if (typeof this.state.value !== 'string' || !this.state.value) {
      return false
    }
    Taro.showLoading({
      title: '发送中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'sendMessage',
      data: {
        id: this.state.receive,
        text: this.state.value
      },
      success: res => {
        Taro.hideLoading()
        if (res.result.success) {
          let list: any = this.state.list
          let message = {
            id: list.length,
            type: 'text',
            text: this.state.value
          }
          list.push(message)
          this.setState({
            list,
            value: '',
            scroll: `card-${list.length - 1}`
          })
        }
      }
    })
  }
  detail(id) {
    Taro.navigateTo({
      url: '/pages/adopt/detail?id=' + id
    })
  }
  render() {
    return (
      <View className='dialog'>
        <ScrollView
          className='dialog-box'
          scrollWithAnimation
          scrollY
          scrollIntoView={this.state.scroll}
        >
          {this.state.list.map((item: any) =>
            <View
              key={item.id}
              id={`card-${item.id}`}
              className={`${item.type}-card-${item.send === this.state.receive ? 'receive' : 'send'}`}
            >
              {
                item.type === 'adopt'
                  ? <View className='adopt-card' onClick={this.detail.bind(this, item.adopt)}>
                    <Image
                      className='adopt-avatar'
                      mode='aspectFill'
                      src={item.cat.avatar}
                    />
                    <View className='adopt-text'>我想领养[{item.cat.title}]点击查看详情</View>
                  </View>
                  : item.text
              }
            </View>
          )}
        </ScrollView>
        <View className={'operate-bar' + (this.state.ipx ? ' ipx' : '')}>
          <Input
            className='send-input'
            type='text'
            value={this.state.value}
            onInput={this.changeValue.bind(this)}
            placeholder='输入发送的内容'
          />
          <Button className='send-btn' onClick={this.sendMessage.bind(this)}><View className='icon icon-enter'></View></Button>
        </View>
      </View>
    )
  }
}
