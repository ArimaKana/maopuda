import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image, SwiperItem, Swiper,Ad } from '@tarojs/components'
import { AtButton, AtTextarea } from 'taro-ui'
// import '../../assets/iconfont.less'
import './detail.less'

export default class Detail extends Component {
  state = {
    // 页面用
    detailId: '',
    isLogin: false,
    showComment: false,
    value: '',
    replyId: '',
    page: 1,
    next: true,
    // 状态用
    cover: [],
    commentList: [],
    content: '',
    topic: '',
    time: '',
    card: {
      _id: '',
      avatar: '',
      name: '',
      sex: 0,
      age: 0
    },
    followed: false,
    liked: false,
    likeNum: 0,
    self: false
  }
  onShareAppMessage() {
    return {
      content: this.state.content,
      path: '/pages/ximao/detail?id=' + this.state.detailId
    }
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    Taro.showLoading({
      title: '加载中'
    })
    this.setState({
      detailId: Router.params.id || Router.params.scene
    }, this.getCatDetail.bind(this))
  }
  componentDidShow() {
    this.getUserInfo()
  }
  getCatDetail() {
    this.getComment()
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'dynamicOpt',
      data: {
        optType: 'query',
        id: this.state.detailId
      },
      success: (res: any) => {
        Taro.hideLoading()
        if (res.result.success) {
          let data = res.result.record
          let time = new Date(data.time).toLocaleDateString()
          res.result.card.birth = new Date(res.result.card.birth)
          res.result.card.age = Math.floor((Date.now() - res.result.card.birth) / (1000 * 60 * 60 * 24 * 365))
          Taro.setNavigationBarTitle({
            title: data.content
          })
          this.setState({
            cover: data.cover || [],
            content: data.content,
            topic: data.topic,
            time,
            card: res.result.card,
            self: data.self,
            likeNum: res.result.like.likeNum,
            liked: res.result.like.liked,
            followed: res.result.followed
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
  async getComment(refresh = false) {
    let page = refresh ? 1 : this.state.page
    await Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'dynamicOpt',
      data: {
        optType: 'queryComment',
        id: this.state.detailId,
        index: page
      }
    })
      .then((res: any) => {
        if (res.result.success) {
          res.result.comment = res.result.comment.map((it: any) => {
            it.time = new Date(it.time).toLocaleString()
            return it
          })
          let list: any[] = []
          let index = page + 1
          if (!refresh) {
            list = this.state.commentList
          }
          list.push(...res.result.comment)
          this.setState({
            next: res.result.comment.length >= 10,
            page: index,
            commentList: list
          })
        }
      })
  }
  onReachBottom() {
    if (this.state.next) {
      this.getComment()
    }
  }
  getInfo(data) {
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
  openComment(showComment) {
    let data = {
      showComment,
    }
    if (!showComment) {
      data.value = ''
      data.replyId = ''
    }
    this.setState(data)
  }
  toDetail() {
    Taro.navigateTo({
      url: '/pages/ximao/card?id=' + this.state.card._id
    })
  }
  handleValue(value) {
    this.setState({
      value
    })
  }
  showWarn(text) {
    Taro.showToast({
      title: text,
      icon: 'none'
    })
  }
  onSubmit() {
    if (this.state.value.length > 140) {
      this.showWarn('文字长度不能超过140')
      return false
    } else if (!this.state.value) {
      this.showWarn('请输入评论内容')
      return false
    }
    const data = {
      optType: 'comment',
      content: this.state.value,
      dynamicId: this.state.detailId,
      replyId: this.state.replyId
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
            title: '评论成功'
          })
          this.openComment(false)
          this.getComment(true)
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
  stop(e) {
    e.stopPropagation()
  }
  replyComment(replyId) {
    this.setState({
      replyId
    }, this.openComment.bind(this, true))
  }
  get replyContent() {
    if (this.state.replyId) {
      return this.state.commentList.find(i => i._id === this.state.replyId).content
    }
    return ''
  }
  like() {
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'dynamicOpt',
      data: {
        optType: 'like',
        status: this.state.liked ? 2 : 1,
        detailId: this.state.detailId
      }
    })
    let likeNum = this.state.likeNum
    if (this.state.liked) {
      likeNum--
    } else {
      likeNum++
    }
    this.setState({
      liked: !this.state.liked,
      likeNum
    })
  }
  follow(e) {
    e.stopPropagation()
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name: 'cardOpt',
      data: {
        optType: 'follow',
        status: this.state.followed ? 2 : 1,
        cardId: this.state.card._id
      }
    })
    this.setState({
      followed: !this.state.followed
    })
  }
  deleteDynamic() {
    Taro.showModal({
      title: '确认删除',
      content: '删除后不可恢复，是否确认删除？',
    })
      .then(res => {
        if (res.confirm) {
          Taro.cloud.callFunction({
            // 要调用的云函数名称
            name: 'dynamicOpt',
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
                Taro.reLaunch({ url: '/pages/index/index' })
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
  preview(current) {
    let option: Taro.previewImage.Option = {
      current,
      urls: this.state.cover.map((it: any) => it.url)
    }
    Taro.previewImage(option)
  }
  render() {
    return (
      <View className='dynamicDetail'>
        <View className='content'>
          <Swiper
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
          <View className='float-tool'>
            <AtButton className='share' openType='share'>
              <View className='icon icon-Share'></View>
            </AtButton>
            {this.state.self
              ? <View className='icon icon-delete' onClick={this.deleteDynamic.bind(this)}></View>
              : null}
          </View>
          <View className='text'>
            {this.state.content}
          </View>
          {this.state.topic
            ? <View className='topic'>
              <View className='icon icon-huati'></View>
              {this.state.topic}
            </View>
            : null}
          <View className='tool'>
            <View className='time'>
              {this.state.time}
            </View>
            <View>{this.state.likeNum}</View>
            <View className={'icon ' + (this.state.liked ? 'icon-heart-fill' : 'icon-heart')} onClick={this.like.bind(this)}></View>
          </View>
        </View>
        <View className='catCard' onClick={this.toDetail.bind(this)}>
          <Image
            className='cardImage'
            src={this.state.card.avatar}
            lazy-load='true'
            mode='aspectFill'
          />
          <View className='basicInfo'>
            <View className='chat'>
              {this.state.card.name}
            </View>
            <View className='basic'>
              <View className={'sex icon ' + (this.state.card.sex === 1 ? 'icon-nan' : 'icon-nv')}>
              </View>
              <View className='age'>{this.state.card.age}周岁</View>
            </View>
          </View>
          <View className='follow' onClick={this.follow.bind(this)}>{this.state.followed ? '已关注' : '关注'}</View>
        </View>
        <View className='sendComment'>
          <View className='total'>全部评论</View>
          <AtButton
            className='send'
            type='primary'
            onClick={this.openComment.bind(this, true)}
          >
            我要评论
          </AtButton>
        </View>
        <View className='commentList'>
          {this.state.commentList.map((it: any) =>
            <View className='comment-block' key={it._id}>
              <Image className='avatar' mode='aspectFill' src={it.user[0].info.avatarUrl} />
              <View className='comment-right'>
                <View className='username'>
                  {it.user[0].info.nickName}
                </View>
                {it.reply.length
                  ? <View className='to-comment'>回复 {it.reply[0].content}</View>
                  : null}
                <View className='comment'>{it.content}</View>
                <View className='comment-tool'>
                  <View>{it.time}</View>
                  <View className='reply' onClick={this.replyComment.bind(this, it._id)}>
                    <View className='icon icon-message'></View>
                    回复
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
        {this.state.showComment
          ? <View className='comment-mask' onClick={this.openComment.bind(this, false)}>
            <View className='comment-bar' onClick={this.stop.bind(this)}>
              <AtTextarea
                className='send-textarea'
                value={this.state.value}
                onChange={this.handleValue.bind(this)}
                maxLength={140}
                placeholder={this.state.replyId ? '回复 ' + this.replyContent : '写评论'}
              />
              {
                this.state.isLogin
                  ? <AtButton className='send-btn icon icon-enter' onClick={this.onSubmit.bind(this)}>
                  </AtButton>
                  : <AtButton
                    className='send-btn icon icon-enter'
                    openType='getUserInfo'
                    onGetUserInfo={this.getInfo.bind(this)}
                  ></AtButton>
              }
            </View>
          </View>
          : null
        }
        <Ad unit-id='adunit-d44e811538c97d21'></Ad>
      </View >
    )
  }
}
