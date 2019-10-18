// pages/we/awarded/invited_record/invited_record.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: {},
    id: ''
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
        // 拉新人员邀请记录
        let obj = {
          consumerId: options.id,
          pageIndex: 1,
          pageSize: app.pageSize
        }
        return app.user.pullNewList(obj)
      })
      .then((res) => {
        console.log(res);
        that.setData({
          list: res,
          id: options.id
        })
        return Promise.resolve();
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
    let that = this;
    if (that.data.list.pageIndex < that.data.list.pageCount) {
      let pageIndex = that.data.list.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 拉新人员邀请记录
          let obj = {
            consumerId: that.data.id,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          }
          return app.user.pullNewList(obj)
        })
        .then((res) => {
          console.log(res);

          that.data.list.list = util.cycle(res.list, that.data.list.list);
          that.data.list.pageIndex = pageIndex;

          that.setData({
            list: that.data.list
          })
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
    } 
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})