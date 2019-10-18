// pages/we/order_cancel/order_cancel.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    // 待付款详情
    app.showLoading()
      .then(() => {
        let params = {
          orderNo: options.id
        }
        return app.order.getOrderDetail(params, true);
      })
      .then((res) => {
        console.log(res);
        that.setData({
          order_note: res
        });
        return Promise.resolve();
      })
      .then(app.hideLoading);
  },

  // 删除订单
  order_del: function () {
    let that = this;
    // 删除订单
    app.showLoading()
      .then(() => {
        let params = {
          orderNo: that.data.order_note.orderNo
        };
        return app.order.orderDelete(params, true);
      })
      .then((res) => {
        console.log(res);
        app.showToast({title: '删除成功', icon: 'success'});

        // 刷新订单列表
        let pages = getCurrentPages();
        let beforePage = pages[pages.length - 2];
        console.log(beforePage);
        beforePage.onLoad({ order_code: 0 });

        return Promise.resolve();
      })
      .then(() => {
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 2000);
      })
      .then(app.hideLoading);
  },

  // 重新下单
  order_place: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        // 下订单
        let params = {
          orderNo: that.data.order_note.orderNo
        };
        return app.cart.addUserCart(params, true);
      })
      .then((res) => {
        console.log(res);
        wx.switchTab({
          url: '/pages/cart/index/index'
        });
        return Promise.resolve(res);
      })
      .then(() => {
        app.hideLoading();
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