import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image, Canvas, SwiperItem, Swiper } from '@tarojs/components'
import { AtButton } from 'taro-ui'
// import '../../assets/iconfont.less'
import './detail.less'

export default class Detail extends Component {

  state = {
    detailId: '',
    ipx: false,
    sex: 0,
    jueyu: 3,
    quchong: 3,
    yimiao: 3,
    age: '',
    avatar: '',
    cover: [],
    desc: '',
    title: '',
    time: 0,
    ages: ['3个月以下', '4-6个月', '7-12个月', '一岁', '两岁', '三岁', '四岁及以上', '不清楚'],
    poi: [],
    isLogin: false,
    receive: ''
  }
  onShareAppMessage() {
    return {
      title: this.state.title,
      path: '/pages/adopt/detail?id=' + this.state.detailId
    }
  }

  componentWillMount() {
    let model = Taro.getSystemInfoSync().model
    const Router=Taro.getCurrentInstance().router
    if (model.search('iPhone X') !== -1 || model.search('iPhone1') !== -1) {
      this.setState({
        ipx: true
      })
    }
    Taro.showLoading({
      title: '加载中'
    })
    this.setState({
      detailId: Router.params.id || Router.params.scene
    }, this.getCatDetail.bind(this))
    // this.getUserInfo()
    this.getConfig()

  }
  componentDidShow() {
    this.getUserInfo()
  }
  getConfig() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getConfig',
      success: (res: any) => {
        if (res.result.success) {
          this.setState({
            receive: res.result.receive
          })
        }
      }
    })
  }
  getCatDetail() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'adoptOpt',
      data: {
        optType: 'query',
        id: this.state.detailId
      },
      success: (res: any) => {
        Taro.hideLoading()
        if (res.result.success) {
          let data = res.result.record
          let time = new Date(data.time).toLocaleDateString()
          Taro.setNavigationBarTitle({
            title: data.title
          })
          const jueyu = data.jueyu || 3
          const quchong = data.quchong || 3
          const yimiao = data.yimiao || 3
          this.setState({
            sex: data.sex,
            age: data.age,
            jueyu,
            quchong,
            yimiao,
            avatar: data.avatar,
            desc: data.desc,
            title: data.title,
            time,
            cover: data.cover || [],
            poi: data.poi
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
          if (res.result.success && res.result.record.mobile) {
            this.setState({
              isLogin: true
            })
          }
          resolve()
        }
      })
    })
  }
  createPic() {
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getQR',
      data: {
        page: 'pages/adopt/detail',
        id: this.state.detailId
      },
      success: async res => {
        const ctx = Taro.createCanvasContext('canvas', this)
        ctx.rect(0, 0, 750, 1500)
        ctx.setFillStyle('#fff')
        ctx.fill()
        let avatar = await this.fetchImage(this.state.avatar || this.state.cover[0].url)
        let dir = avatar.height > avatar.width
        let clip = dir ? avatar.width : avatar.height
        ctx.drawImage(avatar.path, dir ? 0 : (avatar.width - avatar.height) / 2, dir ? (avatar.height - avatar.width) / 2 : 0, clip, clip, 0, 0, 750, 750)
        let mask = await this.fetchImage('cloud://maopuda-sv4uw.6d61-maopuda-sv4uw-1300869164/app/mask2.png')
        ctx.drawImage(mask.path, 0, 1500 - 864, 750, 864)
        ctx.font = 'normal bold 48px Arial'
        ctx.setTextBaseline('top')
        ctx.setFillStyle('#000')
        let title = this.state.title
        let text = title.substring(0, 12) + (title.length > 12 ? '...' : '')
        ctx.fillText(text, 52, 943)
        ctx.fillText('带我回家', 52, 1007)
        if (res.result.errMsg.indexOf('ok') > -1) {
          let img = await this.fetchImage(res.result.fileID)
          ctx.drawImage(img.path, 0, 0, 280, 280, 544, 1261, 160, 160)
          ctx.setFontSize(40)
        }
        ctx.font = '30px Arial'
        ctx.fillText(this.state.poi.join(' '), 179, 836)
        if (this.state.sex !== 2) {
          ctx.fillText('性别:' + (this.state.sex === 1 ? '母喵' : '公喵'), 52, 1120)
        }
        ctx.fillText('绝育状态:' + (this.state.jueyu === 1 ? '已绝育' : '未绝育'), 52, 1165)
        ctx.fillText('驱虫状态:' + (this.state.quchong === 1 ? '已驱虫' : '未驱虫'), 52, 1210)
        ctx.fillText('疫苗状态:' + (this.state.yimiao === 1 ? '已接种' : '未接种'), 52, 1255)
        ctx.draw(false, () => {
          Taro.canvasToTempFilePath({
            canvasId: 'canvas',
            fileType: 'jpg',
            success: res => {
              Taro.saveImageToPhotosAlbum({
                filePath: res.tempFilePath
              })
                .then(res => {
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
  sendAdopt() {
    Taro.showModal({
      title: '确认申请',
      content: '确定要申请领养这只猫咪么？',
    })
      .then((doc: any) => {
        if (doc.confirm) {
          Taro.cloud.callFunction({
            // 要调用的云函数名称
            name: 'sendAdoptMessage',
            data: {
              id: this.state.detailId
            },
            success: (res: any) => {
              if (res.result.success) {
                Taro.navigateTo({ url: '/pages/message/dialog?id=' + res.result.receive })
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
      })
  }
  adopt(data) {
    if (data.detail.errMsg === 'getUserInfo:ok') {
      const info = data.detail.userInfo
      Taro.cloud.callFunction({
        // 要调用的云函数名称
        name: 'login',
        data: {
          info
        },
        success: (res: any) => {
          if (res.result.success) {
            if (res.result.mobile) {
              this.sendAdopt()
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
  preview(current) {
    let option: Taro.previewImage.Option = {
      current,
      urls: [current]
    }
    if (!this.state.avatar) {
      option.urls = this.state.cover.map((it: any) => it.url)
    }
    Taro.previewImage(option)
  }
  render() {
    return (
      <View className='detail'>
        {this.state.avatar
          ? <Image
            className='avatar'
            src={this.state.avatar}
            lazy-load='true'
            mode='widthFix'
            onClick={this.preview.bind(this, this.state.avatar)}
          />
          : <Swiper
            className='covers'
            circular
            indicatorDots
            autoplay
          >
            {this.state.cover.map((item: any) =>
              <SwiperItem key={item.url}>
                <Image
                  className='avatar'
                  src={item.url}
                  lazy-load='true'
                  mode='aspectFill'
                  onClick={this.preview.bind(this, item.url)}
                />
              </SwiperItem>
            )}
          </Swiper>
        }
        <View className='info-card'>
          <View className='title'>
            {this.state.title}
          </View>
          <View className='age'>
            {typeof this.state.age === 'string' ? this.state.age : this.state.ages[this.state.age]}
          </View>
          <View className='tags'>
            {
              this.state.sex === 2
                ? null
                : <View className='tag'>
                  {this.state.sex === 0 ? '公喵' : '母喵'}
                </View>
            }
            {
              this.state.jueyu === 3
                ? null
                : <View className='tag'>
                  {this.state.jueyu === 1 ? '已绝育' : '未绝育'}
                </View>
            }
            {
              this.state.quchong === 3
                ? null
                : <View className='tag'>
                  {this.state.quchong === 1 ? '已驱虫' : '未驱虫'}
                </View>
            }
            {
              this.state.yimiao === 3
                ? null
                : <View className='tag'>
                  {this.state.yimiao === 1 ? '已接种' : '未接种'}
                </View>
            }
          </View>
          <View className='extra'>
            <View className='poi'>
              <View className='icon icon-location'></View>
              {this.state.poi.join(' ')}
            </View>
            <View className='time'>
              更新时间：{this.state.time}
            </View>
          </View>
          <View className='p'>
            <View className='pTitle'>
              基本信息
            </View>
            <View className='content'>
              {this.state.desc}
            </View>
          </View>
        </View>
        <View className='notice'>
          <View className='p'>
            <View className='pTitle'>
              领养须知
            </View>
            <View className='content'>
              {this.state.receive}
            </View>
          </View>
        </View>
        <View className={'bottom-bar' + (this.state.ipx ? ' ipx' : '')}>
          <AtButton className='share-btn' openType='share'>发给好友</AtButton>
          <AtButton className='share-pic-btn' onClick={this.createPic.bind(this)}>生成图片</AtButton>
          {this.state.isLogin
            ? <AtButton
              className='adopt-btn'
              onClick={this.sendAdopt.bind(this)}
            >
              我要领养
            </AtButton>
            : <AtButton
              className='adopt-btn'
              size='small'
              circle
              type='primary'
              openType='getUserInfo'
              onGetUserInfo={this.adopt.bind(this)}
            >
              我要领养
              </AtButton>
          }
        </View>
        <Canvas canvasId='canvas' className='canvas' style='width: 750px; height: 1500px;'></Canvas>
      </View>
    )
  }
}
