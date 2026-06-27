import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View } from '@tarojs/components'
import { AtForm, AtGrid, AtButton, AtTextarea, AtDivider, AtSwitch } from 'taro-ui'
import './setting.less'

export default class Publish extends Component {

  state = {
    ipx: false,
    send: '',
    receive: '',
    verified: false,
    showPub: true,
    icons: [
      {
        image: 'https://img.fanwei.love/mpd/card-1.png',
        value: '领养'
      },
      {
        image: 'https://img.fanwei.love/mpd/card-1.png',
        value: '送养'
      },
      {
        image: 'https://img.fanwei.love/mpd/card-1.png',
        value: '吸猫'
      },
      {
        image: 'https://img.fanwei.love/mpd/card-1.png',
        value: '公告'
      },
      {
        image: 'https://img.fanwei.love/mpd/card-1.png',
        value: '小卖部'
      },
    ]
  }

  componentWillMount() {
    this.getConfig()
  }
  handleChange(event) {
    this.setState({
      showPub: event
    })
  }
  handleDesc(send) {
    this.setState({
      send
    })
  }
  handleReceive(receive) {
    this.setState({
      receive
    })
  }

  showWarn(text) {
    Taro.showToast({
      title: text,
      icon: 'none'
    })
    this.setState({
      verified: true
    })
  }

  onSubmit(event) {
    if (!this.state.send) {
      this.showWarn('请输入送养须知')
      return false
    } else if (!this.state.receive) {
      this.showWarn('请输入领养须知')
      return false
    }
    const data = {
      showPub: this.state.showPub,
      send: this.state.send,
      receive: this.state.receive,
      icons: this.state.icons.map(i => i.image)
    }
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'setConfig',
      data,
      success: res => {
        console.log(res.result)
        Taro.hideLoading()
        if (res.result.success) {
          Taro.showToast({
            title: '设置成功'
          })
        } else {
          Taro.showToast({
            title: res.result.msg,
            icon: 'none'
          })
        }
      },
      fail: err => {
        console.log(err)
        Taro.showToast({
          title: '发生错误，请稍后再试',
          icon: 'none'
        })
      }
    })
  }
  upload() {
    this.picUpload()
      .then(res => {
        this.setState({
          cover: res
        })
      })
  }
  changePic(item, i) {
    this.picUpload()
      .then((res: string) => {
        let icons = this.state.icons
        icons[i].image = res
        this.setState({
          icons
        })
      })
  }
  picUpload() {
    return new Promise(resolve => {
      Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: res => {
          let img = res.tempFilePaths[0]
          let sp = img.split('.')
          let ext = sp.pop()
          let name = (sp.pop() || '').replace('wxfile://', '')
          ext = ext ? ext.toLowerCase() : ''
          const path = name + '.' + ext
          console.log('--------path', path)
          Taro.showLoading({
            title: '上传中'
          })
          Taro.cloud.uploadFile({
            cloudPath: path,
            filePath: img,
            success: data => {
              console.log(data.fileID)
              Taro.hideLoading()
              resolve(data.fileID)
            }
          })
        }
      })
    })
  }
  getConfig() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getConfig',
      success: res => {
        if (res.result.success) {
          const icon = res.result.iconsNew || ['', '', '', '']
          const icons = this.state.icons.map((i, index) => {
            i.image = icon[index]
            return i
          })
          this.setState({
            showPub: res.result.showPub,
            send: res.result.send,
            receive: res.result.receive,
            icons
          })
        }
      }
    })
  }

  render() {
    return (
      <View className='publish'>
        {/* {
          this.state.cover
            ? <Image className='avatar' onClick={this.upload.bind(this)} src={this.state.cover} lazy-load='true' mode='aspectFill' />
            : <View className='upload-pic' onClick={this.upload.bind(this)}>
              <View className='at-icon at-icon-add'></View>
              <View>上传图片</View>
            </View>
        } */}
        <View className='info-card'>
          <AtSwitch title='开启送养' checked={this.state.showPub} onChange={this.handleChange.bind(this)} />
          <AtForm onSubmit={this.onSubmit.bind(this)}>
            <AtDivider content='送养须知' />
            <AtTextarea
              value={this.state.send}
              onChange={this.handleDesc.bind(this)}
              placeholder='送养须知'
              maxLength={1000}
            />
            <AtDivider content='领养须知' />
            <AtTextarea
              value={this.state.receive}
              onChange={this.handleReceive.bind(this)}
              placeholder='领养须知'
              maxLength={1000}
            />
            <AtGrid data={this.state.icons} hasBorder={false} columnNum={5} onClick={this.changePic.bind(this)} />
            <AtButton className='submit' type='primary' formType='submit'>保存修改</AtButton>
          </AtForm>
        </View>
      </View>
    )
  }
}
