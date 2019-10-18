// pages/we/credits_exchange/change/change.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: '',
    shop: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({

      imgSrc: getApp().imgSrc

    });

    let that = this;
    const eventChannel = this.getOpenerEventChannel();

    app.showLoading()
    .then(() => {
      eventChannel.on('acceptDataFromOpenerPage', function (data) {
        console.log(data)
        that.setData({
          shop: data.data
        })
      })
      
      return app.user.deliveryAddressList();
    })
    .then((res) => {
      let address = res.list.filter((item) => item.isDefault == 1);
      that.setData({
        address: address[0]
      })

      return Promise.resolve();
    })
    .then(() => {
      util.hideLoading();
    })
  },

  // 选择地址
  get_address: function () {
    let that = this;
    wx.navigateTo({
      url: '/pages/we/address/index/index?exchange_address=true',
      events: {
        // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        someEvent: function (data) {
          console.log(data)
          that.setData({
            address: data.data
          })
        }
      }
    })
  },

  // 兑换商品
  exchange: function (event) {
    let that = this;
    app.showLoading()
      .then(() => {
        // 积分兑换商品
        let obj = {
          goodsId: that.data.shop.id,
          goodsNum: that.data.shop.goods_number,
          deliveryAddressId: that.data.address.id
        }

        return app.user.exchangeGoods(obj);
      })
      .then((res) => {
        console.log(res);

        // 刷新页面
        let pages = getCurrentPages();
        let beforePage = pages[pages.length - 2];
        console.log(pages, beforePage);
        beforePage.onLoad();

        app.showToast({ title: '兑换成功' }, () => {
          return Promise.resolve();
        });
      })
      .then(() => {
        util.hideLoading();
        setTimeout(() => {
          wx.redirectTo({
            url: '../detail/detail'
          })
        }, 2000)
      })
      .catch(() => {
        app.showToast({title: '兑换失败'});
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
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