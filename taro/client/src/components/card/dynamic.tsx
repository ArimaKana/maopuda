import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import React, { Component }  from 'react'

import './dynamic.less'

interface Dynamic {
  _id: string
  content: string
  topic: string
  cover: { url: string }[]
  commentNum: number
  myLike: boolean
  likeNum: number
}
export default class Card extends Component {
  static options = {
    addGlobalClass: true
  }
  props: {
    dynamic: Dynamic
    onLike: () => void
  }
  toDetail() {
    Taro.navigateTo({
      url: '/pages/ximao/detail?id=' + this.props.dynamic._id
    })
  }
  like(e) {
    e.stopPropagation()
    this.props.onLike()
  }
  render() {
    return (
      <View className='dynamicCard' onClick={this.toDetail.bind(this)}>
        <Image
          className='cardImage'
          src={this.props.dynamic.cover[0].url}
          lazy-load='true'
          mode='aspectFill'
        />
        <View className='chat'>
          {this.props.dynamic.content}
        </View>
        {this.props.dynamic.topic
          ? <View className='topic'>
            <View className='icon icon-huati'></View>
            {this.props.dynamic.topic}
          </View>
          : null}
        <View className='opt'>
          <View className='comment'>评论{this.props.dynamic.commentNum}</View>
          <View className={'icon ' + (this.props.dynamic.myLike ? 'icon-heart-fill' : 'icon-heart')} onClick={this.like.bind(this)}></View>
          <View>{this.props.dynamic.likeNum}</View>
        </View>
      </View>
    )
  }
}