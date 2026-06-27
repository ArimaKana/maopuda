import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image, Button } from '@tarojs/components'
import { AtList, AtListItem, AtButton } from 'taro-ui'
import Bottom from '../../components/bottom/index'
import './index.less'

export default class Index extends Component {

  state = {
    current: 4,
    // roleList: {
    //   '-1': '黑名单',
    //   '1': '注册用户',
    //   '2': '管理员',
    // },
    topBar: {
      top: 0,
      height: 70
    },
    record: {
      info: {
        avatarUrl: '',
        nickName: ''
      },
      role: 1,
      mobile: ''
    },
    cart: [],
    cardList: [],
    fold: false,
    likeNum: 0,
    followNum: 0,
    adoptNum: 0
  }

  componentWillMount() {
    try {
      const topBar = Taro.getMenuButtonBoundingClientRect()
      this.setState({
        topBar
      })
    } catch (e) {

    }
    this.getCard()
    this.getLike()
    this.getFollow()
    this.getAdopt()
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
        type: 'my',
        index: 1
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          const cardList = res.result.data.map(i => {
            i.birth = new Date(i.birth)
            i.age = Math.floor((Date.now() - i.birth) / (1000 * 60 * 60 * 24 * 365))
            return i
          })
          this.setState({
            cardList
          })
        }
      })
  }
  getLike() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'dynamicOpt',
      data: {
        optType: 'myLike',
        index: 1
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          this.setState({
            likeNum: res.result.total
          })
        }
      })
  }
  getFollow() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'myFollow',
        index: 1
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          this.setState({
            followNum: res.result.total
          })
        }
      })
  }
  getAdopt() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'adoptOpt',
      data: {
        optType: 'queryMy',
        index: 1
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          this.setState({
            adoptNum: res.result.total
          })
        }
      })
  }
  onLogin(mobile) {
    let record = this.state.record
    record.mobile = mobile
    this.setState({
      record
    })
  }
  getInfo() {
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getUserInfo',
      success: (res: any) => {
        console.log(res)
        Taro.hideLoading()
        if (res.result.success) {
          this.setState({
            record: res.result.record
          })
        }
      }
    })
  }
  login(data) {
    if (data.target.errMsg === 'getUserInfo:ok') {
      Taro.showLoading({
        title: this.state.record.info.avatarUrl ? '更新中' : '注册中'
      })
      Taro.cloud.callFunction({
        // 要调用的云函数名称
        name: 'login',
        data: {
          info: data.target.userInfo
        },
        success: (res: any) => {
          if (res.result.success) {
            Taro.hideLoading()
            Taro.showToast({
              title: this.state.record.info.avatarUrl ? '更新成功' : '注册成功'
            })
            this.getInfo()
            if (!res.result.mobile) {
              Taro.navigateTo({ url: '/pages/login/index' })
            }
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
  }
  jump(url) {
    Taro.navigateTo({ url })
  }
  read(receive) {
    if (receive) {
      Taro.navigateTo({ url: '/pages/me/read?type=receive' })
    } else {
      Taro.navigateTo({ url: '/pages/me/read' })
    }
  }
  switchFold() {
    this.setState({
      fold: !this.state.fold
    })
  }
  get loginText() {
    if (this.state.record.info.nickName && this.state.record.mobile) {
      return '更新个人信息'
    } else if (this.state.record.info.nickName) {
      return '验证手机号'
    }
    return '点击登录'
  }
  get topStyle() {
    return {
      // height: `${this.state.topBar.height + this.state.topBar.top}px`,
      paddingTop: `${this.state.topBar.height + this.state.topBar.top + 10}px`
    }
  }
  get more() {
    let total = 0
    for (let i = 0; i < this.state.cart.length; i++) {
      const it: any = this.state.cart[i]
      if (i > 0) {
        total += it.count
      }
    }
    return total
  }
  get calcLike() {
    const n = this.state.likeNum
    if (n > 9999) {
      return Math.floor(n / 10000) + 'w'
    } else if (n > 999) {
      return Math.floor(n / 1000) + 'k'
    }
    return n
  }
  get calcFollow() {
    const n = this.state.followNum
    if (n > 9999) {
      return Math.floor(n / 10000) + 'w'
    } else if (n > 999) {
      return Math.floor(n / 1000) + 'k'
    }
    return n
  }
  render() {
    return (
      <View className='me'>
        <View className='me-box'>
          <View className='me-profile' style={this.topStyle}>
            {
              this.state.record.info.avatarUrl
                ? <Image
                  className='avatar'
                  mode='aspectFill'
                  src={this.state.record.info.avatarUrl}
                />
                : null
            }
            <View className='info'>
              <View className='name'>{this.state.record.info.nickName || '未注册'}</View>
              <Button className='setting' open-type='getUserInfo' onGetUserInfo={this.login.bind(this)}>
                <View className='icon icon-edit-square' />
                {this.loginText}
              </Button>
            </View>
          </View>
          {
            this.state.cardList.length ?
              <View className='myCard'>
                {this.state.cardList.map((item: any, index) =>
                  <View
                    className={'card' + (this.state.fold || index === 0 ? '' : ' hide')}
                    key={item._id}
                    onClick={this.jump.bind(this, '/pages/ximao/card?id=' + item._id)}
                  >
                    <View className='info'>
                      <View className='chat'>
                        {item.name}
                        <View className='tip'>点击卡片查看</View>
                      </View>
                      <View className='basic'>
                        <View className={'sex icon ' + (item.sex === 1 ? 'icon-nan' : 'icon-nv')}>
                        </View>
                        <View className='age'>{item.age}周岁</View>
                        {item.fans
                          ? <View>
                            {item.fans}个粉丝
                          </View> : ''
                        }
                      </View>
                      <View className='fans'>
                        体重{item.weight}kg
                      </View>
                      <View className='fans'>
                        {item.brief}
                      </View>
                      <View className='fans'>
                        主粮 {item.food} / 零食 {item.snack}
                      </View>
                    </View>
                    <Image
                      className='cardImage'
                      src={item.avatar}
                      lazy-load='true'
                      mode='aspectFill'
                    />
                  </View>
                )}
                {this.state.cardList.length == 1
                  ? <View className='another' onClick={this.jump.bind(this, '/pages/ximao/publish')}>再加一只</View>
                  : <View className='anotherList'>
                    <View className='fold' onClick={this.switchFold.bind(this)}><View className={'icon ' + (this.state.fold ? 'icon-up' : 'icon-down')}></View>{this.state.fold ? '收起' : '展开'}</View>
                    <View className='add' onClick={this.jump.bind(this, '/pages/ximao/publish')}>再加一只</View>
                  </View>
                }
                <View>

                </View>
              </View>
              :
              <View
                className='add-card'
                onClick={this.jump.bind(this, '/pages/ximao/publish')}
              >
                <View className='main'>登记猫咪</View>
                <View className='sub'>记录猫咪生活</View>
              </View>
          }
          <View className='adopt'>
            <View className='adopt-item'
              onClick={this.jump.bind(this, '/pages/me/myAdopt')}
            >
              <View className='num'>{this.state.adoptNum}</View>
              <View className='adopt-status'>我的送养</View>
            </View>
            <View className='adopt-item'
              onClick={this.jump.bind(this, '/pages/ximao/index?type=1')}
            >
              <View className='num'>{this.calcFollow}</View>
              <View className='adopt-status'>关注猫咪</View>
            </View>
            <View className='adopt-item'
              onClick={this.jump.bind(this, '/pages/ximao/dynamic?type=2')}
            >
              <View className='num'>{this.calcLike}</View>
              <View className='adopt-status'>我点赞的</View>
            </View>
          </View>
          <AtButton className='contact' openType='contact'><View className='icon icon-service'></View>联系客服</AtButton>
          {
            this.state.record.role === 2
              ? <View className='list'>
                <AtList>
                  <AtListItem
                    title='公告管理'
                    arrow='right'
                    onClick={this.jump.bind(this, '/pages/manage/news')}
                    iconInfo={{
                      size: 18,
                      value: 'eye',
                      prefixClass: 'icon'
                    }}
                  />
                  <AtListItem
                    title='基础设置'
                    arrow='right'
                    onClick={this.jump.bind(this, '/pages/manage/setting')}
                    hasBorder={false}
                    iconInfo={{
                      size: 18,
                      value: 'setting-fill',
                      prefixClass: 'icon'
                    }}
                  />
                </AtList>
              </View>
              : null
          }
        </View>
        <Bottom current={this.state.current} />
      </View>
    )
  }
}
