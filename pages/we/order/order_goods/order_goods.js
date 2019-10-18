// pages/we/order_ goods/order_good.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_note: {},
    currentTab: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		imgSrc: getApp().imgSrc
	});
    let that = this;
    console.log(options);
    // 待发货详情
    app.showLoading()
      .then(() => {
        let obj = {
          orderNo: options.id,
          currentTab: options.currentTab
        }
        return app.order.getOrderDetail(obj);
      }).then((res) => {
        console.log(res);
        that.setData({
          order_note: res
        })
        return Promise.resolve();
      })
      .then(app.hideLoading)
  },

  // 确认收货
  pay: function () {
    let that = this;
    // 确认收货
    app.showLoading()
      .then(() => {
        let obj = {
          orderNo: that.data.order_note.orderNo
        }
        return app.order.orderReceive(obj);
      }).then((res) => {
        console.log(res, that.data.currentTab);
        app.showToast({ title: '收货成功', icon: 'success'});
        let pages = getCurrentPages();
        let beforePage = pages[pages.length - 2];
        console.log(beforePage);
        beforePage.onLoad({ order_code: that.data.currentTab});
        return Promise.resolve();
      })
      .then(() => {
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/we/order/order_complete/order_complete?id=' + that.data.order_note.orderNo
          })
        }, 2000)
        return Promise.resolve();
      })
      .then(app.hideLoading)
  },

  // 跳转物流
  logistics: function () {
    wx.navigateTo({
      url: '../logistics_list/logistics_list?id=' + this.data.order_note.orderNo
    })
  },

  // 跳转积分兑换
  credits_exchange: function () {
    wx.navigateTo({
      url: '/pages/we/credits_exchange/index/index'
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