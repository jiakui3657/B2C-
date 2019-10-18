// pages/we/order_pick/order_pick.js
let app = getApp();
var util= require('../../../../utils/util.js')

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
    const width = wx.getSystemInfoSync().windowWidth;
    const rate = 750 / width;
    const code_w = 360 / rate;
    console.log(options);
    // 待付款详情
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
      .then(() => {
        // 获取二维码
        let obj = {
          dom: 'canvas',
          text: this.data.order_note.ladeCode + '',
          image: that.data.imgSrc+ '/images/test/code.jpg',
          width: code_w,
          height: code_w,
          colorDark: "#000",
          colorLight: "white",
        }
        util.get_code(obj);
        return Promise.resolve();
      })
      .then(app.hideLoading)
    
  },

  // 打开地图
  map_go: function () {
    let obj = {
      latitude: this.data.order_note.latitude,
      longitude: this.data.order_note.longitude,
      scale: 18,
      name: this.data.order_note.shopName,
      address: this.data.order_note.shopAddress
    }
    util.openLocation(obj);
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