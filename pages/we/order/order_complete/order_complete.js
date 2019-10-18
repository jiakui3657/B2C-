// pages/we/order_ complete/order_complete.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalFlag: false,
    shopNum: 0,
    shopPitch: [0],
    order_note: {}
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
          orderNo: options.id
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

  // 选择退货原因
  // reason: function (e) {
  //   console.log(e)
  //   let id = e.currentTarget.dataset.index;
  //   let arr = this.data.shopPitch;
  //   console.log(arr, arr.indexOf(id));

  //   let index = arr.indexOf(id);
  //   if (index > -1) {
  //     this.setData({
  //       shopPitch: this.data.shopPitch.remove(id)
  //     })
  //   } else {
  //     this.setData({
  //       shopPitch: this.data.shopPitch.push(id)
  //     })
  //   }
  // },

  // 晒单分享
  choose: function () {
    let that = this;
    let order = this.data.order_note;
    wx.navigateTo({
      url: '../shop_choose/shop_choose?id=' + order.orderNo,
      success: function (res) {
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: that.data.order_note.items })
      }
    })
  },

  // 确定退货原因
  // confirm: function () {
    
  // },

  // 重新下单
  cancel: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        // 下订单
        let obj = {
          orderNo: that.data.order_note.orderNo
        }
        return app.cart.addUserCart(obj);
      })
      .then((res) => {
        console.log(res);
        wx.switchTab({
          url: '/pages/cart/index/index'
        })
        return Promise.resolve(res);
      })
      .then(() => {
        app.hideLoading();
      })
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