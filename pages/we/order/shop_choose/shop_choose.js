// pages/we/shop_choose/shop_choose.js
let app = getApp();
var util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_share: [],
    orderNo: ''
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
    // 晒单列表
    app.showLoading()
      .then(() => {
        let obj = {
          orderNo: options.id
        }
        return app.order.orderShareGoods(obj);
      }).then((res) => {
        console.log(res);
        that.setData({
          order_share: res.list,
          orderNo: options.id
        })
        return Promise.resolve();
      })
      .then(app.hideLoading)
  },

  // 分享商品
  share_shop: function (event) {
    let that = this, index = event.currentTarget.dataset.index;
    that.data.order_share[index].orderNo = that.data.orderNo;
    wx.navigateTo({
      url: '../share_shop/share_shop',
      success: function (res) {
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: that.data.order_share[index] })
      }
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