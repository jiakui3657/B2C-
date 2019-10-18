// pages/we/credits_exchange/detail/detail.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderRs: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		imgSrc: getApp().imgSrc
	});
    let that = this;
    that.integralExchangeOrderList(1);
  },
  integralExchangeOrderList: function(pageIndex) {
    let that = this;
    return app.showLoading()
      .then(() => {
        // 获取积分兑换商品明细
        let params = {
          pageIndex: pageIndex || 1,
          pageSize: app.pageSize
        }
        return app.user.integralExchangeOrderList(params);
      })
      .then((data) => {
        data.list = util.cycle(data.list, that.data.orderRs.list || []);
        that.setData({
          orderRs: data
        });
        return Promise.resolve();
      })
      .finally(() => {
        app.hideLoading();
        return Promise.resolve();
      });
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
    let that = this, pageIndex = that.data.orderRs.pageIndex + 1;
    if (that.data.orderRs.pageIndex < that.data.orderRs.pageCount) {
      that.integralExchangeOrderList(pageIndex);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})