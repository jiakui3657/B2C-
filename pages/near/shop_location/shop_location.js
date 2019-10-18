// pages/near/shop_location/shop_location.js
let util = require('../../../utils/util.js');
let map = require('../../../utils/mapUtil.js');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
    current: 0
  },

  shopNavi(e) {
    if (this.data.shop.shopId == -1) {
      return
    }
    map.startNavi({
      latitude: this.data.shop.latitude,
      longitude: this.data.shop.longitude,
      name: this.data.shop.shopName,
      address: this.data.shop.address
    })
  },

  goShop() {
    if (this.data.shop.shopId == -1){
      return
    }
    wx.navigateTo({
      url: '/pages/near/shop/shop?id=' + this.data.shop.shopId
    });
  },

  regionchange(e) {
    if (e.type == 'end' && e.causedBy == 'drag') {
      var that = this;
      this.mapCtx.getCenterLocation({
        success: function (res) {
          that.loadShop(res.longitude, res.latitude);
        }
      })
    }
  },

  // 获取商家信息
  markertap(event) {
    console.log(event)
    let iconPath = 'markers[' + event.markerId + '].iconPath',
      iconWidth = 'markers[' + event.markerId + '].width',
      iconHeight = 'markers[' + event.markerId + '].height'
    this.data.markers.forEach((item) => {
      item.iconPath = "https://b2ctest.huala.com/res/app/consumer/images/online/near/map_shop2.png"
      item.width = 26
      item.height = 26
    })
    this.setData({
      markers: this.data.markers,
      [iconPath]: 'https://b2ctest.huala.com/res/app/consumer/images/online/near/map_shop1.png',
      [iconWidth]: 40,
      [iconHeight]: 40
    })

    this.setData({
      shop: this.data.markers[event.markerId]
    })
  },

  loadShop(longitude = app.longitude, latitude = app.latitude) {
    var that = this;
    map.locationToAddress(longitude, latitude).then(res => {
      that.setData({
        address: res.address
      })
    })
    app.showLoading()
      .then(() => {
        let params = {
          longitude: longitude,
          latitude: latitude,
          pageIndex: 1,
          distance: 5,
          pageSize: 1000
        };
        return app.shop.list(params);
      })
      .then((data) => {
        data.list.sort(function (a, b) {
          return a.distance - b.distance;
        });
        data.list.forEach((item, index) => {
          if(item.distance > 1000){
            let num = item.distance / 1000;
            item.distance = num.toFixed(1) + "km";
          }else{
            item.distance = item.distance + "m";
          }
          item.iconPath = "https://b2ctest.huala.com/res/app/consumer/images/online/near/map_shop2.png";
          item.id = index;
          item.width = 26;
          item.height = 26;
          if (index == 0) {
            item.callout = {
              content: '离我最近',
              bgColor: '#000',
              color: '#fff',
              textAlign: 'center',
              borderRadius: 5,
              padding: 5,
              fontSize: 10,
              display: 'ALWAYS'
            }
          }
        });
        let shop;
        if (data.list.length > 0){
          shop = data.list[0]
        }else{
          shop={
            shopName:'附近暂无店铺',
            distance:'0',
            shopId:-1
          }
        }
        that.setData({
          markers: data.list,
          shop: shop
        })
        app.hideLoading();
      })
  },

  // 获取当前轮播图索引
  get_current: function (event) {
    this.setData({
      current: event.detail.current
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSrc: app.imgSrc
    });

    this.mapCtx = wx.createMapContext('shopMap')
    this.setData({
      longitude: app.longitude,
      latitude: app.latitude,
    });
    this.loadShop();
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