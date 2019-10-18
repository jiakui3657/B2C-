// pages/registered/registered.js
let util = require('../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: '获取验证码',
    flag: true,
    phone: '',
    code_start: '',
    code: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    console.log(options);
  },

  // 获取协议的选中状态
  checkboxChange: function (event) {
    console.log()
    if (event.detail.value[0]){
      this.setData({
        code_start: true
      })
    } else {
      this.setData({
        code_start: false
      })
    }
  },

  // 获取手机号
  get_phone: function (event) {
    console.log(event.detail.value);
    this.setData({
      phone: event.detail.value
    })
  },

  // 获取验证码
  get_code: function (event) {
    this.setData({
      code: event.detail.value
    })
  },

  // 点击验证码
  code: function () {
    let that = this, myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (that.data.flag) {
      console.log(that.data.phone)
      if (that.data.phone.length == 0) {
        let obj = {
          title: '输入的手机号为空'
        }
        app.showToast(obj)
        return false;
      } else if (that.data.phone.length < 11) {
        let obj = {
          title: '手机号长度有误！'
        }
        app.showToast(obj)
        return false;
      } else if (!myreg.test(that.data.phone)) {
        let obj = {
          title: '手机号有误！'
        }
        app.showToast(obj)
        return false;
      } else {
        app.showLoading()
          .then(() => {
            let num = 120
            that.setData({
              num: num
            })
            let time = setInterval(function () {
              if (num <= 0) {
                clearInterval(time)
                that.setData({
                  num: '获取验证码',
                  flag: true
                })
              } else {
                num--
                that.setData({
                  num: num,
                  flag: false
                })
              }
            }, 1000)
          }).then(() => {
            // 发送手机验证码
            let obj = {
              mobile: that.data.phone
            }
            return app.wallet.verifyCode(obj)
          })
          .then((res) => {
            console.log(res);
            return Promise.resolve();
          })
          .then(app.hideLoading)
      }
    }
  },

  // 注册验证码
  register: function () {
    let that = this;
    if (that.data.code_start) {
      app.showLoading()
        .then(() => {
          // 注册钱包账号
          let obj = {
            mobile: that.data.phone,
            verificationCode: that.data.code
          }
          return app.wallet.memberCreate(obj, true)
        })
        .then((res) => {
          console.log(res);

          // 提示注册成功
          app.showToast({ title: '百万店购用户注册协议', icon: 'success' });
          return Promise.resolve();
        })
        .then(app.refreshUserInfo)
        .then(() => {
          wx.navigateBack({
            delta: 1
          })
          return Promise.resolve();
        })
        .then(app.hideLoading)
        .catch(app.hideLoading)
    } else {
      app.showToast({ title: '百万店购用户注册协议'});
    }
    
  },

  registerProtocol:function(){
    wx.navigateTo({
      url: '/pages/we/register_protocol/register_protocol',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})