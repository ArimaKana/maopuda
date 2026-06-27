import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image, Picker } from '@tarojs/components'
import { AtForm, AtInput, AtButton, AtTextarea, AtCheckbox, AtImagePicker } from 'taro-ui'
import './publish.less'

export default class Publish extends Component {

  state = {
    sex: 0,
    jueyu: 1,
    quchong: 1,
    yimiao: 1,
    title: '',
    age: 0,
    desc: '',
    ages: ['3个月以下', '4-6个月', '7-12个月', '一岁', '两岁', '三岁', '四岁及以上', '不清楚'],
    verified: false,
    poi: ['江苏省', '南京市', '玄武区'],
    checkboxOption: [
      {
        value: 'check',
        label: '已阅读并同意送养须知'
      }
    ],
    cover: [],
    send: '',
    checkedList: [],
    isLogin: false
  }

  componentWillMount() {
    const poi = Taro.getStorageSync('poi') || ['江苏省', '南京市', '玄武区']
    this.setState({
      poi
    })
    // this.getInfo()
    this.getConfig()
  }
  componentDidShow() {
    this.getInfo()
  }
  handleTitle(title) {
    this.setState({
      title
    })
  }
  handleAge(e) {
    this.setState({
      age: parseInt(e.target.value)
    })
  }
  handleDesc(desc) {
    this.setState({
      desc
    })
  }
  handleChoose(key, value) {
    let data = {}
    data[key] = value
    this.setState(data)
  }
  handleRegion(e) {
    console.log(e.target.value)
    this.setState({
      poi: e.target.value
    })
  }
  handleChange(value) {
    this.setState({
      checkedList: value
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
  subscribeMessage() {
    const id = 'WciV4I7PaLf_3rajAEhlEBzfMu63F0PMZfKsCshSemU'
    return new Promise(resolve => {
      Taro.requestSubscribeMessage({
        tmplIds: [id],
        complete: res => {
          resolve(res)
        }
      })
    })
  }

  async onSubmit() {
    if (!this.state.isLogin) {
      return false
    }
    if (!this.state.checkedList.length) {
      Taro.showToast({
        title: '请先阅读并同意送养须知',
        icon: 'none'
      })
      return false
    }
    if (this.state.poi.findIndex(i => i === '全部') > -1) {
      this.showWarn('请选择具体的地区')
      return false
    }
    if (!this.state.title) {
      this.showWarn('请输入标题')
      return false
    } else if (!this.state.desc) {
      this.showWarn('请输入猫咪简介')
      return false
    } else if (this.state.title.length > 16) {
      this.showWarn('标题长度请不要超过16个字')
      return false
    } else if (this.state.desc.length > 200) {
      this.showWarn('简介长度请不要超过200个字')
      return false
    } else if (!this.state.cover.length) {
      this.showWarn('请至少上传一张猫咪图片')
      return false
    }
    await this.subscribeMessage()
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
      title: this.state.title,
      sex: this.state.sex,
      jueyu: this.state.jueyu,
      quchong: this.state.quchong,
      yimiao: this.state.yimiao,
      age: this.state.age,
      poi: this.state.poi,
      cover,
      desc: this.state.desc
    }
    console.log(data)
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'adoptOpt',
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
  getConfig() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getConfig',
      success: (res: any) => {
        if (res.result.success) {
          this.setState({
            send: res.result.send
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

  render() {
    return (
      <View className='send-adopt'>
        <View className='info-card'>
          <AtImagePicker
            length={4}
            count={4}
            files={this.state.cover}
            sizeType={['compressed']}
            sourceType={['album']}
            onChange={this.uploadCover.bind(this)}
            onImageClick={this.coverClick.bind(this)}
          />
        </View>
        <View className='info-card'>
          <AtForm>
            <AtInput
              error={!this.state.title && this.state.verified ? true : false}
              name='title'
              border={false}
              type='text'
              title='标题'
              placeholder='请输入展示的标题'
              value={this.state.title}
              onChange={this.handleTitle.bind(this)}
            />
            <View className='page-section'>
              <Picker mode='selector' range={this.state.ages} onChange={this.handleAge.bind(this)} value={this.state.age}>
                <View className='picker'>
                  <View className='label'>猫咪年龄</View>
                  <View className='text'> {this.state.ages[this.state.age]}</View>
                </View>
              </Picker>
            </View>
            <View className='page-section'>
              <Picker mode='region' onChange={this.handleRegion.bind(this)} value={this.state.poi}>
                <View className='picker'>
                  <View className='label'>所在区域</View>
                  <View className='text'> {this.state.poi.join(' ')}</View>
                </View>
              </Picker>
            </View>
            <View className='chooseSex'>
              <View className='label'>猫咪性别</View>
              <View
                className={'sex' + (this.state.sex === 0 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'sex', 0)}
              >
                <View className='icon icon-nan'></View>
                公喵
              </View>
              <View
                className={'sex' + (this.state.sex === 1 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'sex', 1)}
              >
                <View className='icon icon-nv'></View>
                母喵
              </View>
              <View
                className={'sex' + (this.state.sex === 2 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'sex', 2)}
              >
                <View className='icon icon-question-circle'></View>
                不清楚
              </View>
            </View>
            <View className='chooseSex'>
              <View className='label'>绝育状态</View>
              <View
                className={'sex' + (this.state.jueyu === 1 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'jueyu', 1)}
              >
                已绝育
              </View>
              <View
                className={'sex' + (this.state.jueyu === 2 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'jueyu', 2)}
              >
                未绝育
              </View>
              <View
                className={'sex' + (this.state.jueyu === 3 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'jueyu', 3)}
              >
                不清楚
              </View>
            </View>
            <View className='chooseSex'>
              <View className='label'>驱虫状态</View>
              <View
                className={'sex' + (this.state.quchong === 1 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'quchong', 1)}
              >
                已驱虫
              </View>
              <View
                className={'sex' + (this.state.quchong === 2 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'quchong', 2)}
              >
                未驱虫
              </View>
              <View
                className={'sex' + (this.state.quchong === 3 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'quchong', 3)}
              >
                不清楚
              </View>
            </View>
            <View className='chooseSex'>
              <View className='label'>疫苗状态</View>
              <View
                className={'sex' + (this.state.yimiao === 1 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'yimiao', 1)}
              >
                已接种
              </View>
              <View
                className={'sex' + (this.state.yimiao === 2 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'yimiao', 2)}
              >
                未接种
              </View>
              <View
                className={'sex' + (this.state.yimiao === 3 ? ' active' : '')}
                onClick={this.handleChoose.bind(this, 'yimiao', 3)}
              >
                不清楚
              </View>
            </View>
            <AtTextarea
              className='send-textarea'
              value={this.state.desc}
              onChange={this.handleDesc.bind(this)}
              maxLength={200}
              placeholder='请输入猫咪简介,如果担心沟通不及时可以留下自己的联系方式'
            />
            {/* <AtButton className='subscribe' onClick={this.subscribeMessage.bind(this)}>
              订阅领养提醒
            </AtButton> */}
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
        <View className='info-card'>
          <AtCheckbox
            options={this.state.checkboxOption}
            selectedList={this.state.checkedList}
            onChange={this.handleChange.bind(this)}
          />
          <View className='at-article__p'>
            {this.state.send}
          </View>
        </View>
      </View>
    )
  }
}
