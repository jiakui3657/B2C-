// pages/we/we_order_ delivery/we_order_ delivery.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_note: {},
    orderNo: '',
    // 申请退款提交成功
    allpyRefundMoneySuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this;
    // 待发货详情
    this.data.orderNo = options.id;
    this.orderDetail();
  },

  orderDetail:function(){
    let that = this;
    app.showLoading()
      .then(() => {
        let obj = {
          orderNo: this.data.orderNo
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

  // 跳转退货
  afterType: function(e) {
    console.log(e)
    wx.navigateTo({
      url: '/pages/we/refund/after_type/after_type?goods=' + JSON.stringify(e.currentTarget.dataset.goods) + '&finish=0'
    })
  },

  // 跳转物流
  logistics: function() {
    wx.navigateTo({
      url: '../logistics_list/logistics_list?id=' + this.data.order_note.orderNo
    })
  },

  // 跳转积分兑换
  credits_exchange: function() {
    wx.navigateTo({
      url: '/pages/we/credits_exchange/index/index'
    })
  },

  // 申请退款成功后刷新列表
  allpyRefundMoneySuccess: function() {
    this.data.allpyRefundMoneySuccess = true;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.allpyRefundMoneySuccess) {
      this.data.allpyRefundMoneySuccess = false;
      this.orderDetail();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})