// pages/we/notice/notice/notice.js
let app = getApp();
let util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: {},
    messageUrlType: null
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
        // 获取消息列表
        let params = {
          messageId: options.id
        };
        return app.other.messageDetail(params);
      })
      .then((data) => {
        let urlType = null;
        wx.setNavigationBarTitle({
          title: data.title || '消息通知'
        });
        if (data.url && data.url) {
          if (data.url.indexOf("/pages/") == 0) {
            urlType = 0;// 小程序页跳转
            wx.redirectTo({
              url: data.url,
            });
            return Promise.resolve();
          }

          if (data.url.indexOf("https://") == 0) {
            urlType = 1;// 网页链接
          }
        }
        if (data.content) {
          data.content = data.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto;display:block;"');
        }
        that.setData({
          message: data,
          messageUrlType: urlType
        });
        return Promise.resolve();
      })
      .then(app.hideLoading());
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