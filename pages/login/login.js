// pages/login/login.js
let util = require('../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSuccess: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSrc: app.imgSrc
    });
    console.log(getCurrentPages()[0].route);
  },

  // 登录
  bindGetUserInfo: function () {
    let that = this;
    app.isTokenResetting.status = false;
    app.resetToken()
      .then(()=>{
        let page = getCurrentPages()[0];
        if (page.route != 'pages/login/login') {
          page.onLoad(page.pageQuery);
          wx.navigateBack({
            delta: 1
          });
        } else {
          wx.redirectTo({
            url: '/pages/home/index/index'
          });
        }
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
    console.log("login页面onHide执行==============");
    app.setGlobalData("jumpStatus", true);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (!this.data.isSuccess) {
      
    }
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