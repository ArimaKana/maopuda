// eslint-disable-next-line no-unused-vars
import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Picker } from '@tarojs/components'
import { AtForm, AtInput, AtButton, AtTextarea, AtImagePicker } from 'taro-ui'
import './send.less'

export default class Publish extends Component {

  state = {
    content: '',
    topic: '',
    cover: [],
    card: 0,
    topics: [
      '每日打卡',
      '大橘为重',
      '田园猫也超美',
      '狸花猫',
      '吸猫',
      '可可爱爱'
    ],
    cardList: [],
    isLogin: false
  }

  componentWillMount() {
    this.getCard()
  }
  componentDidShow() {
    this.getInfo()
  }
  getCard() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'queryList',
        index: 1,
        type: 'my'
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          const cardList = res.result.data.map(i => {
            return i
          })
          this.setState({
            cardList
          })
        }
      })
  }
  setValue(key, value) {
    let data = {}
    data[key] = value
    this.setState(data)
  }
  handleCard(e) {
    this.setState({
      card: parseInt(e.target.value)
    })
  }
  handleDesc(content) {
    this.setState({
      content
    })
  }
  jump(url) {
    Taro.navigateTo({ url })
  }
  showWarn(text) {
    Taro.showToast({
      title: text,
      icon: 'none'
    })
  }

  async onSubmit() {
    if (!this.state.isLogin) {
      return false
    }
    if (this.state.content.length > 140) {
      this.showWarn('文字长度不能超过140')
      return false
    } else if (!this.state.cover.length) {
      this.showWarn('请至少上传一张猫咪图片')
      return false
    } else if (!this.state.cardList.length) {
      this.showWarn('请选择状态属于哪只猫咪')
      return false
    }
    Taro.showLoading({
      title: '正在上传图片'
    })
    let cover: any = []
    for (let i in this.state.cover) {
      const item: any = this.state.cover[i]
      if (item.url.indexOf('cloud://') === 0) {
        cover.push(item)
      } else {
        const url = await this.picUpload(item.url)
        cover.push({ url })
      }
    }
    Taro.hideLoading()
    const data = {
      optType: 'add',
      content: this.state.content,
      topic: this.state.topic,
      cover,
      cardId: this.state.cardList[this.state.card]._id
    }
    console.log(data)
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'dynamicOpt',
      data,
      success: (res: any) => {
        console.log(res.result)
        Taro.hideLoading()
        if (res.result.success) {
          Taro.showToast({
            title: '发布成功'
          })
          setTimeout(() => {
            Taro.reLaunch({ url: '/pages/index/index' })
          }, 800)
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
  getUserInfo(event) {
    if (!this.state.isLogin && event.detail.errMsg === 'getUserInfo:ok') {
      const info = event.detail.userInfo
      Taro.cloud.callFunction({
        // 要调用的云函数名称
        name: 'login',
        data: {
          info
        },
        success: (res: any) => {
          if (res.result.success) {
            if (res.result.mobile) {
              this.onSubmit()
            } else {
              Taro.navigateTo({ url: '/pages/login/index' })
            }
          }
        },
        fail: () => {
          Taro.showToast({
            title: '发生错误，请稍后再试',
            icon: 'none'
          })
        }
      })
    }
  }
  picUpload(img) {
    return new Promise(resolve => {
      let sp = img.split('.')
      let ext = sp.pop()
      let name = (sp.pop() || '').replace('wxfile://', '')
      ext = ext ? ext.toLowerCase() : ''
      const path = name + '.' + ext
      console.log('--------path', path)
      Taro.cloud.uploadFile({
        cloudPath: path,
        filePath: img,
        success: data => {
          console.log(data.fileID)
          resolve(data.fileID)
        }
      })
    })
  }
  getInfo() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getUserInfo',
      success: (res: any) => {
        console.log(res)
        if (res.result.success && res.result.record.mobile) {
          this.setState({
            isLogin: true
          })
        }
      }
    })
  }
  uploadCover(files, operationType, index) {
    console.log(files, operationType, index)
    this.setState({
      cover: files
    })
  }
  coverClick(index, file) {
    console.log(index, file)
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      success: res => {
        let img = res.tempFilePaths[0]
        const cover: any = this.state.cover
        cover[index].url = img
        this.setState({
          cover
        })
      }
    })
  }
  chooseTopic(topic) {
    this.setState({
      topic
    })
  }

  render() {
    return (
      <View className='send-dynamic'>
        <AtImagePicker
          length={4}
          count={4}
          files={this.state.cover}
          sizeType={['compressed']}
          sourceType={['album']}
          onChange={this.uploadCover.bind(this)}
          onImageClick={this.coverClick.bind(this)}
        />
        <View className='info-card'>
          <AtForm>
            <AtTextarea
              className='send-textarea'
              value={this.state.content}
              onChange={this.handleDesc.bind(this)}
              maxLength={140}
              placeholder='分享吸猫动态'
            />
            <View className='page-section'>
              {this.state.cardList.length
                ? <Picker
                  mode='selector'
                  range={this.state.cardList}
                  onChange={this.handleCard.bind(this)}
                  value={this.state.card}
                  rangeKey='name'
                >
                  <View className='picker'>
                    <View className='label'>选择猫咪</View>
                    <View className='text'> {this.state.cardList[this.state.card].name}</View>
                  </View>
                </Picker>
                : <View className='picker'>
                  <View className='label'>选择猫咪</View>
                  <View className='text' onClick={this.jump.bind(this, '/pages/ximao/publish')}>
                    还没有猫咪
                    <View className='add'>去登记</View>
                  </View>
                </View>
              }
            </View>
            <AtInput
              name='name'
              border={false}
              type='text'
              title='话题'
              placeholder='请输入话题'
              value={this.state.topic}
              onChange={this.setValue.bind(this, 'topic')}
            />
            <View className='chooseSex'>
              {
                this.state.topics.map(i =>
                  <View
                    key={i}
                    className={'sex' + (this.state.topic === i ? ' active' : '')}
                    onClick={this.chooseTopic.bind(this, i)}
                  >
                    #{i}
                  </View>)
              }
            </View>
            {
              this.state.isLogin
                ? <AtButton
                  className='submit'
                  type='primary'
                  onClick={this.onSubmit.bind(this)}
                >
                  确认提交
                </AtButton>
                : <AtButton
                  className='submit'
                  type='primary'
                  openType='getUserInfo'
                  onGetUserInfo={this.getUserInfo.bind(this)}
                >
                  登录/注册提交
                </AtButton>
            }
          </AtForm>
        </View>
      </View>
    )
  }
}
