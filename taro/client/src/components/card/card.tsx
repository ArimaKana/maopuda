import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'

import './card.less'

interface CatCard {
  _id: string
  avatar: string
  name: string
  sex: number
  age: number
  brief: string
  myFollow: boolean
  followNum: number
}
export default class Card extends Component {
  static options = {
    addGlobalClass: true
  }
  props: {
    card: CatCard
    onFollow: () => void
  }
  toDetail() {
    Taro.navigateTo({
      url: '/pages/ximao/card?id=' + this.props.card._id
    })
  }
  follow(e) {
    e.stopPropagation()
    this.props.onFollow()
  }
  render() {
    return (
      <View className='catCard' onClick={this.toDetail.bind(this)}>
        <Image
          className='cardImage'
          src={this.props.card.avatar}
          lazy-load='true'
          mode='aspectFill'
        />
        <View className='basicInfo'>
          <View className='chat'>
            {this.props.card.name}
          </View>
          <View className='fans'>
            {this.props.card.brief}
          </View>
          <View className='basic'>
            <View className={'sex icon ' + (this.props.card.sex === 1 ? 'icon-nan' : 'icon-nv')}>
            </View>
            <View className='age'>{this.props.card.age}周岁</View>
          </View>
        </View>
        <View className='follow' onClick={this.follow.bind(this)}>{this.props.card.myFollow ? '已关注' : '关注'}</View>
      </View>
    )
  }
}