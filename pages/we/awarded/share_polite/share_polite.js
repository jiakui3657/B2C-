// pages/we/awarded/share_polite/share_polite.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shareInfo: {},
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.setData({
      imgSrc: getApp().imgSrc,
      userInfo: app.globalData.userInfo
    });

    app.showLoading()
      .then(() => {
        // 获取分享有礼信息
        return app.user.getShareAndIntegralRule();
      })
      .then((data) => {
        console.log(data);
        that.setData({
          shareInfo: data
        })
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 跳转兑换记录
  record: function () {
    wx.navigateTo({
      url: '../record/record'
    })
  },

  // 跳转分享商品列表
  goods_list: function () {
    wx.navigateTo({
      url: '../share_goods/share_goods?flag=0'
    })
  },

  goods_list1: function () {
    wx.navigateTo({
      url: '../share_goods/share_goods?flag=1'
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