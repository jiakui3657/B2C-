// pages/we/awarded/friends/friends.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: {},
    coupons: {},
    navHeight: ''
  },
  // 打开当前页面路径中的参数
  pageQuery: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSrc: app.imgSrc,
      navHeight: app.navHeight
    });

    let that = this, flag = true;
    that.pageQuery = options;
    app.showLoading()
      .then(() => {
        // 消费者拉新
        let params = {
          consumerId: options.id ? options.id : that.pageQuery.id
        };
        return app.user.savePullRelation(params)
      })
      .then((data) => {
        console.log(data);
        return Promise.resolve();
      })
      .catch(() => {
        wx.switchTab({
          url: '/pages/home/index/index'
        })
        return Promise.resolve();
      })
      .then(() => {
        // 新客福利券
        let params = {
          site: 1
        }
        return app.activity.getNewConsumerCoupon(params);
      })
      .then((data) => {
        console.log(data);
        if (data.state == 0){
          wx.switchTab({
            url: '/pages/home/index/index'
          });
        } else {
          that.setData({
            coupons: data
          });
        }
        return Promise.resolve();
      })
      .then(() => {
        // 获取推荐商品
        let params = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        }
        return app.goods.recommendList(params)
      })
      .then((data) => {
        that.setData({
          goodsList: data
        })
        return Promise.resolve()
      })
      .finally((e) => {
        if (e) {
          console.error(e);
        }
        app.hideLoading();
      })
  },

  // 跳转使用优惠券页面
  use_coupons: function () {
    wx.navigateTo({
      url: '/pages/home/welfare/use_coupons/use_coupons?couponId=' + this.data.coupons.couponId,
    })
  },

  // 返回首页
  home: function () {
    wx.switchTab({
      url: '/pages/home/index/index'
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
    this.pageQuery = null;
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