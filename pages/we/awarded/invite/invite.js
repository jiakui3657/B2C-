// pages/we/awarded/invite/invite.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalFlag: false,
    invitationList: [],
    securities: {},
    yorker: {}
  },

  pageQuery:null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this, flag = true, securities = {};
    that.pageQuery = options;
    app.showLoading()
      .then(() => {
        // 拉新页面数据初始化
        let obj = {
          type: 'coupon01'
        }
        return app.activity.getSystemCoupon(obj)
      })
      .then((res) => {
        console.log(res);
        that.setData({
          securities: res
        })
        console.log(that.data.securities);
        return Promise.resolve();
      })
      .then(() => {
        // 拉新页面数据初始化
        let obj = {
          type: 'coupon02'
        }
        return app.activity.getSystemCoupon(obj)
      })
      .then((res) => {
        console.log(res);
        that.setData({
          yorker: res
        })
        return Promise.resolve();
      })
      .then(() => {
        // 拉新人员排行榜
        let obj = {
          limit: 6
        }
        return app.user.pullNewRanking(obj)
      })
      .then((res) => {
        console.log(res);
        that.setData({
          invitationList: res.list
        })
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
      })
  },

  // 跳转邀请人详情
  consumerDetail: function (event) {
    wx.navigateTo({
      url: '../invited_record/invited_record?id=' + event.currentTarget.id
    })
  },

  // 邀请规则
  cancel: function () {
    this.setData({
      modalFlag: !this.data.modalFlag
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
    return {
      title: '好友邀你领红包啦~',
      path: '/pages/we/awarded/friends/friends?id='+app.globalData.userInfo.consumerId,
      imgUrl: '',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})