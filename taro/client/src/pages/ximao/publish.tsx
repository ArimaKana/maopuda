import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image, Picker } from '@tarojs/components'
import { AtForm, AtInput, AtButton } from 'taro-ui'
import './publish.less'

export default class Publish extends Component {

  state = {
    detailId: '',
    avatar: '',
    name: '',
    brief: '',
    birth: '',
    sex: 1,
    poi: ['江苏省', '南京市', '玄武区'],
    tag: [],
    weight: 0,
    food: '',
    snack: '',
    jueyu: 1,
    isLogin: false,
    verified: false
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    this.setState({
      detailId: Router.params.id || Router.params.scene || ''
    }, this.getCard.bind(this))
    const poi = Taro.getStorageSync('poi') || ['江苏省', '南京市', '玄武区']
    this.setState({
      poi
    })
  }
  componentDidShow() {
    this.getInfo()
  }
  getCard() {
    if (!this.state.detailId) {
      return false
    }
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'query',
        id: this.state.detailId
      },
      success: (res: any) => {
        Taro.hideLoading()
        if (res.result.success) {
          let data = res.result.record
          Taro.setNavigationBarTitle({
            title: '编辑' + data.name
          })

          this.setState({
            avatar: data.avatar,
            name: data.name,
            brief: data.brief,
            birth: data.birth,
            sex: data.sex,
            poi: data.poi,
            tag: data.tag,
            weight: data.weight,
            food: data.food,
            snack: data.snack,
            jueyu: data.jueyu
          })
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
  setValue(key, value) {
    let data = {}
    data[key] = value
    this.setState(data)
  }
  handleBirth(e) {
    this.setState({
      birth: e.target.value
    })
  }
  /**
   * 处理地区
   * @param e 
   */
  handleRegion(e) {
    console.log(e.target.value)
    this.setState({
      poi: e.target.value
    })
  }
  /**
   * toast提示
   * @param text 
   */
  showWarn(text) {
    Taro.showToast({
      title: text,
      icon: 'none'
    })
    this.setState({
      verified: true
    })
  }
  /**
   * 提交
   */
  async onSubmit() {
    if (!this.state.isLogin) {
      return false
    }
    if (this.state.poi.findIndex(i => i === '全部') > -1) {
      this.showWarn('请选择具体的地区')
      return false
    }
    const weight = Number(this.state.weight)
    if (!this.state.avatar) {
      this.showWarn('请上传头像')
      return false
    } else if (!this.state.name) {
      this.showWarn('请输入昵称')
      return false
    } else if (!this.state.brief) {
      this.showWarn('请输入个性签名')
      return false
    } else if (!this.state.birth) {
      this.showWarn('请输入生日')
      return false
    } else if (!weight) {
      this.showWarn('请输入正确的体重')
      return false
    } else if (!this.state.food) {
      this.showWarn('请输入喜欢猫粮')
      return false
    } else if (!this.state.snack) {
      this.showWarn('请输入喜欢零食')
      return false
    }
    const data = {
      optType: 'add',
      avatar: this.state.avatar,
      name: this.state.name,
      brief: this.state.brief,
      birth: this.state.birth,
      sex: this.state.sex,
      poi: this.state.poi,
      tag: this.state.tag,
      weight,
      food: this.state.food,
      snack: this.state.snack,
      jueyu: this.state.jueyu
    }
    console.log(data)
    // return false
    Taro.showLoading({
      title: '加载中'
    })
    if (this.state.detailId) {
      data.optType = 'update'
      data.id = this.state.detailId
    }
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data,
      success: (res: any) => {
        console.log(res.result)
        Taro.hideLoading()
        if (res.result.success) {
          if (this.state.detailId) {
            Taro.showToast({
              title: '更新成功'
            })
          } else {
            Taro.showToast({
              title: '登记成功'
            })
          }
          setTimeout(() => {
            Taro.reLaunch({ url: '/pages/me/index' })
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
  /**
   * 登录
   */
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
  /**
   * 上传头像
   */
  upload() {
    this.picUpload()
      .then(res => {
        this.setState({
          avatar: res
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
  /**
   * 获取登录信息
   */
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
  deleteCard() {
    Taro.showModal({
      title: '确认删除',
      content: '删除后不可恢复，是否确认删除？',
    })
      .then(res => {
        if (res.confirm) {
          Taro.cloud.callFunction({
            // 要调用的云函数名称
            name: 'cardOpt',
            data: {
              optType: 'delete',
              id: this.state.detailId
            }
          }).then((doc: any) => {
            if (doc.result.success) {
              Taro.showToast({
                title: '已删除'
              })
              setTimeout(() => {
                Taro.reLaunch({ url: '/pages/me/index' })
              }, 800)
            } else {
              Taro.showToast({
                title: doc.result.msg,
                icon: 'none'
              })
            }
          })
        }
      })
  }
  render() {
    return (
      <View className='send-adopt'>
        <View className='uploadAvatar' onClick={this.upload.bind(this)}>
          {
            this.state.avatar
              ? <Image className='avatar' src={this.state.avatar} mode='aspectFill' />
              : <View className='icon icon-plus'></View>
          }
        </View>
        <View className='uploadText'>上传头像</View>
        <View className='info-card'>
          <AtForm onSubmit={this.onSubmit.bind(this)}>
            <AtInput
              error={!this.state.name && this.state.verified ? true : false}
              name='name'
              border={false}
              type='text'
              title='昵称'
              placeholder='请输入昵称'
              value={this.state.name}
              onChange={this.setValue.bind(this, 'name')}
            />
            <AtInput
              error={!this.state.brief && this.state.verified ? true : false}
              name='title'
              border={false}
              type='text'
              title='个性签名'
              placeholder='一句话简介'
              value={this.state.brief}
              onChange={this.setValue.bind(this, 'brief')}
            />
            <View className='page-section'>
              <Picker mode='date' onChange={this.handleBirth.bind(this)} value={this.state.birth}>
                <View className='picker'>
                  <View className='label'>猫咪生日</View>
                  <View className='text'>{this.state.birth || '选择日期'}</View>
                </View>
              </Picker>
            </View>
            <View className='chooseSex'>
              <View className='label'>猫咪性别</View>
              <View
                className={'sex' + (this.state.sex === 1 ? ' active' : '')}
                onClick={this.setValue.bind(this, 'sex', 1)}
              >
                <View className='icon icon-nan'></View>
                公喵
              </View>
              <View
                className={'sex' + (this.state.sex === 2 ? ' active' : '')}
                onClick={this.setValue.bind(this, 'sex', 2)}
              >
                <View className='icon icon-nv'></View>
                母喵
              </View>
            </View>
            <AtInput
              error={!this.state.weight && this.state.verified ? true : false}
              name='weight'
              border={false}
              type='number'
              title='体重(KG)'
              placeholder='请输入体重数'
              value={this.state.weight}
              onChange={this.setValue.bind(this, 'weight')}
            />
            <AtInput
              error={!this.state.food && this.state.verified ? true : false}
              name='food'
              border={false}
              type='text'
              title='喜欢猫粮'
              placeholder='喜欢的猫粮'
              value={this.state.food}
              onChange={this.setValue.bind(this, 'food')}
            />
            <AtInput
              error={!this.state.snack && this.state.verified ? true : false}
              name='snack'
              border={false}
              type='text'
              title='喜欢零食'
              placeholder='喜欢的零食'
              value={this.state.snack}
              onChange={this.setValue.bind(this, 'snack')}
            />
            <View className='chooseSex'>
              <View className='label'>绝育状态</View>
              <View
                className={'sex' + (this.state.jueyu === 1 ? ' active' : '')}
                onClick={this.setValue.bind(this, 'jueyu', 1)}
              >
                <View className='icon icon-nan'></View>
                已绝育
              </View>
              <View
                className={'sex' + (this.state.jueyu === 2 ? ' active' : '')}
                onClick={this.setValue.bind(this, 'jueyu', 2)}
              >
                <View className='icon icon-nv'></View>
                未绝育
              </View>
            </View>
            <View className='page-section'>
              <Picker mode='region' onChange={this.handleRegion.bind(this)} value={this.state.poi}>
                <View className='picker'>
                  <View className='label'>所在区域</View>
                  <View className='text'> {this.state.poi.join(' ')}</View>
                </View>
              </Picker>
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
            {
              this.state.detailId
                ? <AtButton
                  className='submit del'
                  type='primary'
                  onClick={this.deleteCard.bind(this)}
                >
                  删除猫咪
                </AtButton>
                : null
            }
          </AtForm>
        </View>
      </View>
    )
  }
}
