// pages/we/address/index/index.js
let app = getApp()
let util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [
    ],
    exchange_address: '',
    order_address: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		imgSrc: getApp().imgSrc
	});
    let that = this;
    console.log(options)
    
    if (options) {
      that.setData({
        exchange_address: options.exchange_address ? options.exchange_address : false,
        order_address: options.order_address ? options.order_address : false
      })
    }
    
    app.showLoading().then(() => {
      // 获取收货地址列表
      return app.user.deliveryAddressList()
    }).then((res) => {
      console.log(res)
      that.setData({
        addressList: res.list
      })
    }).then(() => {
      app.hideLoading();
    })
  },

  // 跳转添加地址
  add_address: function () {
    wx.navigateTo({
      url: '../add_address/add_address'
    })
  },

  // 跳转地址详情页
  go_address: function (event) {
    let id = event.currentTarget.id
    wx.navigateTo({
      url: '../add_address/add_address?id=' + id
    })
  },

  // 获取当前地址
  get_address: function (event) {
    let that = this, index = event.currentTarget.dataset.index, eventChannel = this.getOpenerEventChannel()
    if (that.data.exchange_address || that.data.order_address) {
      eventChannel.emit('someEvent', { data: that.data.addressList[index] });
      wx.navigateBack({
        delta: 1
      })
    }
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