// pages/we/share/share.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    imgSrc: app.imgSrc,
    apiUrl: app.apiUrl
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.setData({
      userInfo: app.globalData.userInfo
    });
  },

  // 保存图片
  save: function() {
    wx.canvasToTempFilePath({ //canvas 生成图片 生成临时路径
      canvasId: 'canvas',
      quality: 1,
      success: function(res) {
        console.log(res)
        wx.saveImageToPhotosAlbum({ //下载图片
          filePath: res.tempFilePath,
          success: function() {
            wx.showToast({
              title: "保存成功",
              icon: "success",
            })
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this;
    let ctx = wx.createCanvasContext('canvas')
    let query = wx.createSelectorQuery().select('#share').boundingClientRect();
    query.exec(function(res) {
      let height = res[0].height;
      let width = res[0].width;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.draw(true);

      wx.getImageInfo({
        src: that.data.apiUrl + '/other/getWXPQRCode?consumerId=' + that.data.userInfo.consumerId,
        success(res) {
          ctx.drawImage(res.path, 13 * width / 64, 16 * height / 45, 19 * width / 32, 19 * width / 32);
          ctx.draw(true);
        }
      })

      ctx.drawImage('/images/online/home/logo.png', width / 16, 9 * height / 225, width / 8, 0.65 * width / 8);
      ctx.draw(true);

      ctx.font = 'normal bold 14px SourceHanSansSC-regular';
      ctx.fillStyle = '#000000';
      let x0 = 13 * width / 64;
      let y0 = 0.08 * height;
      let t0 = '中烟新商盟';
      ctx.fillText(t0, x0, y0);
      ctx.draw(true);

      ctx.font = 'normal bold 30px Arial';
      ctx.fillStyle = '#FF474C';
      let t1 = '百万店购';
      let x1 = (width - ctx.measureText(t1).width) / 2;
      let y1 = 2 * height / 9;
      ctx.fillText(t1, x1, y1);
      ctx.draw(true);

      ctx.font = 'normal bold 14px Arial';
      ctx.fillStyle = '#FF474C';
      let t2 = '美好生活 上百万店就购了';
      let x2 = (width - ctx.measureText(t2).width) / 2;
      let y2 = 13 * height / 45;
      ctx.fillText(t2, x2, y2);
      ctx.draw(true);

      ctx.font = 'normal 14px SourceHanSansSC-regular';
      ctx.fillStyle = '#353535';
      let t3 = '长按二维码 即可打开小程序';
      let x3 = (width - ctx.measureText(t3).width) / 2;
      let y3 = 8 * height / 9;
      ctx.fillText(t3, x3, y3);
      ctx.draw(true);
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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