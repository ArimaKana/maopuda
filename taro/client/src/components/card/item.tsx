import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'

// import '../../assets/iconfont.less'
import './item.less'

interface Item {
  _id: string
  name: string
  price: number
  cover: { url: string }[]
}
export default class Card extends Component {
  props: {
    item: Item
  }
  toDetail() {
    Taro.navigateTo({
      url: '/pages/mall/detail?id=' + this.props.item._id
    })
  }
  render() {
    return (
      <View
        className='item-good'
        onClick={this.toDetail.bind(this)}
        key={this.props.item._id}
      >
        <Image
          className='good-cover'
          src={this.props.item.cover[0].url}
          lazy-load='true'
          mode='aspectFill'
        />
        <View className='title'>{this.props.item.name}</View>
        <View className='prize'>¥{this.props.item.price}</View>
        <View className='buy'>购买</View>
      </View>
    )
  }
}