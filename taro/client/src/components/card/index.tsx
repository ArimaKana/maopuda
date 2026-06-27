import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'

// import '../../assets/iconfont.less'
import './index.less'

interface Adopt {
  _id: string
  title: string
  avatar: string
  area: number
  poi: string[]
  desc: string
  sex: number
  age: string | number
  cover: { url: string }[]
}
export default class Card extends Component {
  static options = {
    addGlobalClass: true
  }
  props: {
    adopt: Adopt
  }
  state = {
    ages: ['3个月以下', '4-6个月', '7-12个月', '一岁', '两岁', '三岁', '四岁及以上', '不清楚'],
  }
  toDetail() {
    Taro.navigateTo({
      url: '/pages/adopt/detail?id=' + this.props.adopt._id
    })
  }
  render() {
    return (
      <View className='adoptCard' onClick={this.toDetail.bind(this)}>
        <Image
          className='cardImage'
          src={this.props.adopt.avatar || this.props.adopt.cover[0].url}
          lazy-load='true'
          mode='aspectFill'
        />
        <View className='des-box'>
          <View className='title'>
            {this.props.adopt.title}
          </View>
          <View className='desc'>
            {this.props.adopt.desc}
          </View>
          <View className='tool clearfix'>
            <View className='source'>
              <View className='icon icon-location' />
              {
                this.props.adopt && this.props.adopt.poi[2]
              }
            </View>
            {
              this.props.adopt.sex !== 2
                ? <View className='pills'>
                  {this.props.adopt.sex === 0 ? '公' : '母'}
                </View>
                : null
            }
            {
              this.props.adopt
                ? <View className='pills'>
                  {typeof this.props.adopt.age === 'string' ? this.props.adopt.age : this.state.ages[this.props.adopt.age]}
                </View>
                : null
            }
          </View>
        </View>
      </View>
    )
  }
}