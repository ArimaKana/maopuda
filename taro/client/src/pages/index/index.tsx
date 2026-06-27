// eslint-disable-next-line no-unused-vars
import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Picker, Swiper, SwiperItem, Image,Ad } from '@tarojs/components'
import { AtActionSheet, AtSearchBar } from 'taro-ui'
import Card from '../../components/card/index'
import Bottom from '../../components/bottom/index'
import './index.less'
const menu=[
  {
    image: '',
    value: '领养',
    link: '/pages/adopt/index'
  },
  {
    image: '',
    value: '送养',
    link: '/pages/adopt/publish'
  },
  {
    image: '',
    value: '吸猫',
    link: '/pages/ximao/dynamic'
  },
  {
    image: '',        
    value: '小卖铺',
    link: 'wx45420ceeff868b05'
  },
  {
    image: '',
    value: '公众号',
    link: '/pages/static/index'
  }
]

export default class Index extends Component {
  state = {
    current: 0,
    adoptList: [],
    cardList: [],
    newsList: [],
    dynamicList: [],
    poi: ['全部', '全部', '全部'],
    nav: [],
    value: '',
    topBar: {
      top: 0,
      height: 70
    },
    showPub: false,
    showPublish: false,
    guide: false,
    step: 1
  }
  async onPullDownRefresh() {
    await this.getConfig()
    Taro.stopPullDownRefresh()
  }

  componentWillMount() {
    Taro.showShareMenu({
      menus:['shareAppMessage','shareTimeline']
    })
    const guide = !Taro.getStorageSync('guide')
    const poi = Taro.getStorageSync('poi') || ['全部', '全部', '全部']
    this.setState({
      poi,
      guide
    })
    try {
      const topBar = Taro.getMenuButtonBoundingClientRect()
      this.setState({
        topBar
      })
    } catch (e) {

    }
    this.getNews()
    this.getConfig()
  }
  getNews() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'queryArticle',
      data: {
        index: 1
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          this.setState({
            newsList: res.result.data
          })
        }
      })
  }
  onShareAppMessage() {
    return {
      title: '猫普达Maopuda',
      imageUrl: 'https://6d61-maopuda-sv4uw-1300869164.tcb.qcloud.la/app/share.jpg?sign=a3d67103cfb1d0389e5aac0028e78211&t=1579160095'
    }
  }
  async getConfig() {
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getConfig'
    })
      .then(async (res: any) => {
        const icon = res.result.iconsNew || ['', '', '', '']
        const nav = menu.map((i, index) => {
          i.image = icon[index]
          return i
        })
        this.setState({
          nav,
          showPublish: res.result.showPub
        })
        this.getCard()
        this.getDynamic()
        await this.getList()
      })
  }
  toRead(id) {
    Taro.navigateTo({
      url: '/pages/news/read?id=' + id
    })
  }
  toCard(id) {
    Taro.navigateTo({
      url: '/pages/ximao/card?id=' + id
    })
  }
  getCard() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'querySample'
      }
    })
      .then((res:any) => {
        if (res.result.success) {
          this.setState({
            cardList: res.result.data
          })
        }
      })
  }
  getDynamic() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'dynamicOpt',
      data: {
        optType: 'queryList',
        index: 1
      }
    })
      .then((res:any) => {
        if (res.result.success) {
          this.setState({
            dynamicList: res.result.data
          })
        }
      })
  }
  async getList() {
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'adoptOpt',
      data: {
        optType: 'queryList',
        index: 1,
        poi: this.state.poi
      }
    })
      .then((res:any) => {
        if (res.result.success) {
          this.setState({
            adoptList: res.result.data
          })
        }
      })
  }
  onChange(value) {
    this.setState({
      value
    })
  }
  onActionClick() {
    Taro.navigateTo({
      url: '/pages/index/search?word=' + this.state.value
    })
  }
  handleRegion(e) {
    this.setState({
      poi: e.detail.value
    }, this.getList.bind(this))
    Taro.setStorageSync('poi', e.detail.value)
  }
  get topStyle() {
    return {
      height: `${this.state.topBar.height + this.state.topBar.top}px`,
      paddingTop: `${this.state.topBar.top}px`
    }
  }
  get regionHeight() {
    return {
      height: `${this.state.topBar.height}px`,
      lineHeight: `${this.state.topBar.height}px`,
      marginTop: `${this.state.topBar.top}px`
    }
  }
  jump(item, i) {
    if (i === 3) {
      Taro.navigateToMiniProgram({
        appId: item.link
      })
    } else if (i >= 1 || i < 3 || i === 4) {
      Taro.navigateTo({ url: item.link })
    } else {
      Taro.redirectTo({ url: item.link })
    }
  }
  toLink(url) {
    Taro.navigateTo({ url })
  }
  switchPub(showPub) {
    this.setState({
      showPub
    })
  }
  toAdopt() {
    Taro.redirectTo({ url: '/pages/adopt/index' })
  }
  like(dynamicId, i, e) {
    e.stopPropagation()
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
  follow(cardId, i, e) {
    e.stopPropagation()
    let list: any = this.state.cardList
    list[i].myFollow = !list[i].myFollow
    if (list[i].myFollow) {
      list[i].followNum += 1
    } else {
      list[i].followNum -= 1
    }
    this.setState({
      cardList: list
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'follow',
        status: list[i].myFollow ? 1 : 2,
        cardId
      }
    })
  }
  get region() {
    if (this.state.poi[2] !== '全部') {
      return this.state.poi[2]
    } else if (this.state.poi[1] !== '全部') {
      return this.state.poi[1]
    } else if (this.state.poi[0] !== '全部') {
      return this.state.poi[0]
    } else {
      return '全国'
    }
  }
  preventDefault(e) {
    e.stopPropagation()
    e.preventDefault()
  }
  closeGuide() {
    this.setState({
      guide: false
    })
    Taro.setStorageSync('guide', true)
  }
  nextStep() {
    let step = this.state.step
    if (step === 5) {
      this.closeGuide()
      return false
    }
    step += 1
    this.setState({
      step
    })
  }
  render() {
    return (
      <View className='container'>
        <View className='index-header' style={this.topStyle}>
          <Picker mode='region' custom-item='全部' onChange={this.handleRegion.bind(this)} value={this.state.poi}>
            <View className='index-region' style={this.regionHeight}>
              <View className='icon icon-location' />
              {this.region}
            </View>
          </Picker>
          <View className='index-title' style={`height:${this.state.topBar.height}px`}></View>
        </View>
        <AtSearchBar
          className={this.state.showPublish ? '' : 'hide'}
          value={this.state.value}
          placeholder='搜索:猫咪/动态'
          onChange={this.onChange.bind(this)}
          onActionClick={this.onActionClick.bind(this)}
        />
        <Swiper
          className='index-slide'
          circular
          indicatorDots
          autoplay
        >
          {this.state.newsList.map((item: any) =>
            <SwiperItem key={item._id}>
              <Image
                className='newsCover'
                src={item.cover}
                lazy-load='true'
                mode='aspectFill'
                onClick={this.toRead.bind(this, item._id)}
              />
            </SwiperItem>
          )}
        </Swiper>
        <View className='mainMenu'>
          {this.state.nav.map((item: any, i) =>
            <View
              key={item.image}
              className='menuItem'
              onClick={this.jump.bind(this, item, i)}
            >
              <Image className='menuImage' mode='widthFix' src={item.image} />
              <View className='menuText'>{item.value}</View>
            </View>
          )}
        </View>
        <View className='part texture'>
          <View className='partTitle' onClick={this.toLink.bind(this, '/pages/ximao/dynamic')}>
            <View className='text'><View className='icon icon-cat_wool_ball'></View>吸猫动态</View>
            <View className='moreText'>更多&gt;</View>
          </View>
          <View className='dynamic'>
            {this.state.dynamicList.map((adopt: any, i) =>
              <View
                key={adopt._id}
                className='dynamicCard'
                onClick={this.toLink.bind(this, '/pages/ximao/detail?id=' + adopt._id)}
              >
                <Image
                  className='cardImage'
                  src={adopt.cover[0].url}
                  lazy-load='true'
                  mode='aspectFill'
                />
                <View className='chat'>
                  {adopt.content}
                </View>
                {adopt.topic
                  ? <View className='topic'>
                    <View className='icon icon-huati'></View>
                    {adopt.topic}
                  </View>
                  : null}
                <View className='opt'>
                  <View className='comment'>{adopt.commentNum}条评论</View>
                  <View className={'icon ' + (adopt.myLike ? 'icon-heart-fill' : 'icon-heart')} onClick={this.like.bind(this, adopt._id, i)}></View>
                  <View>{adopt.likeNum}</View>
                </View>
              </View>
            )}
          </View>
        </View>
        <View className='part'>
          <View className='partTitle' onClick={this.toLink.bind(this, '/pages/ximao/index')}>
            <View className='text'><View className='icon icon-cat_fish_bones'></View>看看猫咪</View>
            <View className='moreText'>更多&gt;</View>
          </View>
          <View className='hot'>
            {this.state.cardList.map((card: any, i) =>
              <View key={card._id} className='hotCard'>
                <Image
                  className='cardImage'
                  src={card.avatar}
                  lazy-load='true'
                  mode='aspectFill'
                  onClick={this.toCard.bind(this, card._id)}
                />
                <View className='chat' onClick={this.toCard.bind(this, card._id)}>
                  {card.name}
                </View>
                <View className='fans'>
                  粉丝数:{card.followNum || 0}
                </View>
                <View className='follow' onClick={this.follow.bind(this, card._id, i)}>
                  {card.myFollow ? '已关注' : '关注'}
                </View>
              </View>
            )}
          </View>
        </View>
        {this.state.adoptList.length
          ? <View className='index-list'>
            <View className='part'>
              <View className='partTitle'>
                <View className='text'><View className='icon icon-compass'></View>领养列表</View>
                <View className='moreText' onClick={this.toAdopt.bind(this)}>更多&gt;</View>
              </View>
            </View>
            {this.state.adoptList.map((adopt: any) => <Card adopt={adopt} key={adopt._id} />)}
            <View className='more' onClick={this.toAdopt.bind(this)}>进入领养频道</View>
          </View>
          : <View className='no-more'>
            <View className='icon icon-cat_missing' />
            这里没有猫，切换地区试试～
          </View>
        }
        <Ad unit-id='adunit-d44e811538c97d21'></Ad>
        <View className='importantBtn icon icon-plus' onClick={this.switchPub.bind(this, true)}></View>
        <AtActionSheet isOpened={this.state.showPub} cancelText='取消' onClose={this.switchPub.bind(this, false)} onCancel={this.switchPub.bind(this, false)}>
          <View className='sendPanel'>
            {/* <View className='send' onClick={this.toLink.bind(this, '/pages/adopt/publish')}>
              <View className='icon icon-cat_bell_collar'></View>
              领养简历
            </View> */}
            <View className='send' onClick={this.toLink.bind(this, '/pages/adopt/publish')}>
              <View className='icon icon-cat_bell_collar'></View>
              送养猫咪
            </View>
            <View className='send' onClick={this.toLink.bind(this, '/pages/ximao/send')}>
              <View className='icon icon-cat_wool_ball'></View>
              发布动态
            </View>
          </View>
        </AtActionSheet>
        <Bottom current={this.state.current} />
        {this.state.guide ?
          <View className='guideMask' onTouchMove={this.preventDefault.bind(this)}>
            <View className={'guide1' + (this.state.step === 1 ? '' : ' hide')}>
              <View className='guideText'>点击右上角添加到我的小程序</View>
              <View className='guideText'>一键直达随时使用</View>
              <Image
                className='cardImage'
                src='cloud://maopuda-sv4uw.6d61-maopuda-sv4uw-1300869164/app/shoucang.jpg'
                lazy-load='true'
                mode='widthFix'
              />
            </View>
            <View className={'guide2' + (this.state.step === 2 ? '' : ' hide')}>
              <Image
                className='cardImage'
                src='cloud://maopuda-sv4uw.6d61-maopuda-sv4uw-1300869164/app/opt1.jpg'
                lazy-load='true'
                mode='widthFix'
              />
              <View className='guideText'>点击领养按钮查看待领养的猫咪</View>
            </View>
            <View className={'guide2' + (this.state.step === 3 ? '' : ' hide')}>
              <Image
                className='cardImage'
                src='cloud://maopuda-sv4uw.6d61-maopuda-sv4uw-1300869164/app/opt2.jpg'
                lazy-load='true'
                mode='widthFix'
              />
              <View className='guideText'>点击送养按钮送养猫咪</View>
            </View>
            <View className={'guide2' + (this.state.step === 4 ? '' : ' hide')}>
              <Image
                className='cardImage'
                src='cloud://maopuda-sv4uw.6d61-maopuda-sv4uw-1300869164/app/opt3.jpg'
                lazy-load='true'
                mode='widthFix'
              />
              <View className='guideText'>点击吸猫按钮查看吸猫动态</View>
            </View>
            <View className={'guide2' + (this.state.step === 5 ? '' : ' hide')}>
              <Image
                className='cardImage'
                src='cloud://maopuda-sv4uw.6d61-maopuda-sv4uw-1300869164/app/opt4.jpg'
                lazy-load='true'
                mode='widthFix'
              />
              <View className='guideText'>点击右下角蓝色按钮</View>
              <View className='guideText'>发布吸猫动态或者送养猫咪</View>
            </View>
            <View className='guideBtn'>
              <View className={'next' + (this.state.step === 5 ? ' hide' : '')} onClick={this.closeGuide.bind(this)}>跳过引导</View>
              <View className='next' onClick={this.nextStep.bind(this)}>{this.state.step === 5 ? '完成' : '下一步'}</View>
            </View>
          </View>
          : null}
      </View>
    )
  }
}
