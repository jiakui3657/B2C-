// pages/cart/index/index.js
let util = require('../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    price: '',
    orderState: '',
    couponsState: false
  },

  linkTo(e){
    if (this.data.orderState == 3) {
      wx.redirectTo({
        url: '/pages/we/order/order_pick/order_pick?id=' + this.data.orderNo
      })
    } else {
      wx.redirectTo({
        url: '/pages/we/order/order_delivery/order_delivery?id=' + this.data.orderNo
      })
    }
  },

  switchTab(){
    wx.switchTab({
      url: '/pages/home/index/index'
    })
  },

  // 打开当前页面路径中的参数
  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this;

    that.pageQuery = options;
    console.log(options);
    app.showLoading()
      .then(() => {
        that.setData({
          price: that.pageQuery.price,
          orderNo: that.pageQuery.orderNo,
          orderState: that.pageQuery.orderState
        });
        return Promise.resolve();
      })
      .then(() => {
        // 获取推荐商品
        let obj = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        };
        return app.goods.recommendList(obj);
      })
      .then((data) => {
        console.log(data);
        that.setData({
          goodsList: data
        });
        return Promise.resolve();
      })
      .then(() => {
        let params = {
          type: 'coupon03'
        }
        return app.activity.getSystemCoupon(params)
      })
      .then((data) => {
        console.log(data)
        if (JSON.stringify(data) != '{}') {
          that.setData({
            couponInfo: data,
            couponsState: true
          })
        }
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
      })
  },

  close: function () {
    this.setData({
      couponsState: false
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
  onShareAppMessage: function (res) {
    let that = this;
    let shareObj = {
      path: '/pages/home/index/index',
      imageUrl: that.data.imgSrc + '/images/online/home/recomm/giving.png',
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
        }
      },
      fail: function () {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      }
    };
    if (res.from == 'button') {
      shareObj.title = '我的小确幸，希望你也了解';
    } else {
      shareObj.title = '美好生活上百万店就购了';
    }
    return shareObj;
  }
})