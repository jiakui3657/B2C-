// pages/we/order/logistics_list/logistics_list.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logistics: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		imgSrc: getApp().imgSrc
	});
    let that = this;
    app.showLoading()
      .then(() => {
        let params = {
          orderNo: options.id
        }
        return app.order.getOrderLogisticsList(params, true);
      })
      .then((res) => {
        console.log(res);
        that.setData({
          logistics: res
        })
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 跳转物流详情
  logistics: function (event) {
    let that = this, index = event.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../logistics/logistics',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        let obj = {
          subOrderNo: that.data.logistics.list[index].subOrderNo,
          logisticsNo: that.data.logistics.list[index].logisticsNo,
          logisticsCompanyCode: that.data.logistics.list[index].logisticsCompanyCode,
          logisticsCompanyName: that.data.logistics.list[index].logisticsCompanyName
        }
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: obj })
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