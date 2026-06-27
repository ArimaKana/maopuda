import Taro from '@tarojs/taro'
import React, { Component }  from 'react'
import { View, Image } from '@tarojs/components'
import { AtForm, AtInput, AtButton } from 'taro-ui'
import './publish.less'

export default class Publish extends Component {

  state = {
    cover: '',
    link: '',
    verified: false,
    showPub: true,
    editId: null
  }

  componentWillMount() {
    const Router=Taro.getCurrentInstance().router
    if (Router.params.id) {
      this.setState({
        editId: Router.params.id
      })
      Taro.showLoading({
        title: '加载中'
      })
      Taro.cloud.callFunction({
        // 要调用的云函数名称
        name: 'queryArticleDetail',
        data: {
          id: Router.params.id
        },
        success: (res: any) => {
          Taro.hideLoading()
          if (res.result.success) {
            let data = res.result.record
            this.setState({
              link: data.link,
              cover: data.cover
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
  }
  handleTitle(link) {
    this.setState({
      link
    })
  }

  showWarn(text) {
    Taro.showToast({
      title: text,
      icon: 'none'
    })
    this.setState({
      verified: true
    })
  }

  onSubmit() {
    if (!this.state.link) {
      this.showWarn('请输入标题')
      return false
    } else if (!this.state.cover) {
      this.showWarn('请输入封面')
      return false
    }
    const data = {
      link: this.state.link,
      cover: this.state.cover,
      id: this.state.editId
    }
    console.log(data)
    let name = this.state.editId ? 'updateNews' : 'addNews'
    Taro.showLoading({
      title: '加载中'
    })
    Taro.cloud.callFunction({
      // 要调用的云函数名称
      name,
      data,
      success: (res: any) => {
        console.log(res.result)
        Taro.hideLoading()
        if (res.result.success) {
          Taro.showToast({
            title: '发布成功'
          })
          setTimeout(() => {
            Taro.redirectTo({ url: '/pages/manage/news' })
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
  upload() {
    this.picUpload()
      .then(res => {
        this.setState({
          cover: res
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

  render() {
    return (
      <View className={'publish' + (this.state.showPub ? '' : ' hide')}>
        {
          this.state.cover
            ? <Image className='avatar' onClick={this.upload.bind(this)} src={this.state.cover} lazy-load='true' mode='aspectFill' />
            : <View className='upload-pic' onClick={this.upload.bind(this)}>
              <View className='at-icon at-icon-add'></View>
              <View>上传图片</View>
            </View>
        }
        <View className='info-card'>
          <AtForm onSubmit={this.onSubmit.bind(this)}>
            <AtInput
              error={!this.state.link && this.state.verified ? true : false}
              name='link'
              title='链接'
              type='text'
              placeholder='请输入链接'
              value={this.state.link}
              onChange={this.handleTitle.bind(this)}
            />
            <AtButton className='submit' type='primary' formType='submit'>确认提交</AtButton>
          </AtForm>
        </View>
      </View>
    )
  }
}
