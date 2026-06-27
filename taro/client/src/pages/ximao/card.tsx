import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image, Canvas } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import Card from '../../components/card/dynamic'
import './card.less'

export default class Detail extends Component {
  state = {
    // 页面用
    detailId: '',
    openid: '',
    next: true,
    page: 1,
    dynamicList: [],
    // 猫咪用
    cat: {
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
      age: 0,
      _openid: ''
    },
    followed: false,
    fans: 0
  }
  async onPullDownRefresh() {
    await this.getCard()
    Taro.stopPullDownRefresh()
  }

  onShareAppMessage() {
    return {
      title: this.state.title,
      path: '/pages/ximao/card?id=' + this.state.detailId
    }
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    Taro.showLoading({
      title: '加载中'
    })
    this.setState({
      detailId: Router.params.id || Router.params.scene
    })
    this.getUserInfo()
      .then(this.getCard.bind(this))
  }
  getCard() {
    this.getList(true)
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
          data.time = new Date(data.time).toLocaleDateString()
          const birth = new Date(data.birth).getTime()
          data.age = Math.floor((Date.now() - birth) / (1000 * 60 * 60 * 24 * 365))
          Taro.setNavigationBarTitle({
            title: data.name + '的主页'
          })
          this.setState({
            cat: data,
            followed: res.result.followed,
            fans: res.result.fans
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
  getUserInfo() {
    return new Promise(resolve => {
      Taro.cloud.callFunction({
        // 要调用的云函数名称
        name: 'getUserInfo',
        success: (res: any) => {
          console.log(res)
          if (res.result.success) {
            let data = { openid: res.result.record._openid }
            if (res.result.record.mobile) {
              data.isLogin = true
            }
            this.setState(data)
          }
          resolve()
        }
      })
    })
  }
  // 获取分享图
  createPic() {
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getQR',
      data: {
        page: 'pages/ximao/card',
        id: this.state.detailId
      },
      success: async (res: any) => {
        const ctx = Taro.createCanvasContext('canvas', this)
        ctx.rect(0, 0, 750, 1500)
        ctx.setFillStyle('#fff')
        ctx.fill()
        let avatar = await this.fetchImage(this.state.cat.avatar)
        let dir = avatar.height > avatar.width
        let clip = dir ? avatar.width : avatar.height
        ctx.drawImage(avatar.path, dir ? 0 : (avatar.width - avatar.height) / 2, dir ? (avatar.height - avatar.width) / 2 : 0, clip, clip, 0, 0, 750, 750)
        let mask = await this.fetchImage('cloud://maopuda-sv4uw.6d61-maopuda-sv4uw-1300869164/app/mask.png')
        ctx.drawImage(mask.path, 0, 1500 - 864, 750, 864)
        ctx.font = 'normal bold 48px Arial'
        ctx.setTextBaseline('top')
        ctx.setFillStyle('#000')
        let title = this.state.cat.name
        let text = '我是' + title.substring(0, 10) + (title.length > 10 ? '...' : '')
        ctx.fillText(text, 52, 943)
        ctx.fillText('快来吸我', 52, 1007)
        if (res.result.errMsg.indexOf('ok') > -1) {
          let img = await this.fetchImage(res.result.fileID)
          ctx.drawImage(img.path, 0, 0, 280, 280, 544, 1261, 160, 160)
        }
        ctx.font = '30px Arial'
        ctx.fillText(this.state.cat.brief, 179, 836)
        ctx.fillText('性别:' + (this.state.cat.sex === 1 ? '公喵' : '母喵'), 52, 1120)
        ctx.fillText('生日:' + this.state.cat.birth, 52, 1165)
        ctx.fillText('体重:' + this.state.cat.weight + 'kg', 52, 1210)
        ctx.draw(false, () => {
          Taro.canvasToTempFilePath({
            canvasId: 'canvas',
            fileType: 'jpg',
            success: (res) => {
              Taro.saveImageToPhotosAlbum({
                filePath: res.tempFilePath
              })
                .then((res: any) => {
                  if (res.errMsg === 'saveImageToPhotosAlbum:ok') {
                    Taro.hideLoading()
                    Taro.showToast({
                      title: '保存成功'
                    })
                  }
                })
            }
          })
        })
      },
      fail: () => {
        Taro.showToast({
          title: '发生错误，请稍后再试',
          icon: 'none'
        })
      }
    })
  }
  async fetchImage(fileID) {
    let { tempFilePath } = await Taro.cloud.downloadFile({ fileID })
    return await Taro.getImageInfo({ src: tempFilePath })
  }
  async getList(refresh = false) {
    let page = refresh ? 1 : this.state.page
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'queryDynamic',
        cardId: this.state.detailId,
        index: page
      }
    })
      .then(res => {
        if (res.result.success) {
          let list: any[] = []
          let index = page + 1
          if (!refresh) {
            list = this.state.dynamicList
          }
          list.push(...res.result.data)
          this.setState({
            next: res.result.data.length >= 10,
            page: index,
            dynamicList: list
          })
        }
      })
  }
  onReachBottom() {
    if (this.state.next) {
      this.getList()
    }
  }
  like(dynamicId, i) {
    let list: any = this.state.dynamicList
    list[i].myLike = !list[i].myLike
    if (list[i].myLike) {
      list[i].likeNum += 1
    } else {
      list[i].likeNum -= 1
    }
    this.setState({
      dynamicList: list
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
  follow() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'follow',
        status: this.state.followed ? 2 : 1,
        cardId: this.state.detailId
      }
    })
    let fans = this.state.fans
    if (this.state.followed) {
      fans--
    } else {
      fans++
    }
    this.setState({
      followed: !this.state.followed,
      fans
    })
  }
  jump(url) {
    Taro.navigateTo({ url })
  }
  render() {
    return (
      <View className='card'>
        <View className='catInfo'>
          <View className='row'>
            <Image
              className='cardImage'
              src={this.state.cat.avatar}
              lazy-load='true'
              mode='aspectFill'
            />
            <View className='info'>
              <View className='chat'>{this.state.cat.name}</View>
              <View className='basic'>
                <View className={'sex icon ' + (this.state.cat.sex === 1 ? 'icon-nan' : 'icon-nv')}>
                </View>
                <View className='age'>{this.state.cat.age}周岁</View>
                <View className='age'>{this.state.cat.weight}kg</View>
              </View>
            </View>
          </View>
          <View className='brief'>{this.state.cat.brief}</View>
          <View className='fans'><View className='num'>{this.state.fans}</View>粉丝</View>
          <View className='rightBtn'>
            <AtButton className='share' openType='share'>
              <View className='icon icon-Share'></View>
            </AtButton>
            <View className='shareQR icon icon-qrcode' onClick={this.createPic.bind(this)}></View>
            {this.state.openid === this.state.cat._openid
              ? <View className='follow' onClick={this.jump.bind(this, '/pages/ximao/publish?id=' + this.state.detailId)}>
                编辑
              </View>
              : <View className='follow' onClick={this.follow.bind(this)}>
                {this.state.followed ? '已关注' : '关注'}
              </View>
            }
          </View>
        </View>
        {this.state.dynamicList.length
          ? <View className='index-list'>
            <View className='col'>
              {this.state.dynamicList.map((it: any, i) => {
                if (i % 2 === 0) {
                  return <Card key={it._id} dynamic={it} onLike={this.like.bind(this, it._id, i)} />
                }
              })}
            </View>
            <View className='col'>
              {this.state.dynamicList.map((it: any, i) => {
                if (i % 2 === 1) {
                  return <Card key={it._id} dynamic={it} onLike={this.like.bind(this, it._id, i)} />
                }
              })}
            </View>
          </View>
          : <View className='no-more'>
            <View className='icon icon-cat_missing' />
            猫咪还没有动态～
        </View>}
        <Canvas canvasId='canvas' className='canvas' style='width: 750px; height: 1500px;'></Canvas>
      </View>
    )
  }
}
