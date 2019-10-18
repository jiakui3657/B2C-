// pages/we/refund/edit_info/edit_info.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    regionId: '',
    name: '',
    address: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSrc: getApp().imgSrc
    });
  },

  // 获取寄件人
  get_name: function (event) {
    console.log(event.detail.value)
    this.setData({
      name: event.detail.value
    })
  },

  // 获取手机号
  get_phone: function (event) {
    console.log(event)
    this.setData({
      phone: event.detail.value
    })
  },

  // 获取详细地址
  get_address: function (event) {
    console.log(event)
    this.setData({
      address: event.detail.value
    })
  },

  // 选择地区
  bindRegionChange: function (e) {
    let region = e.detail.value;
    let regionId = e.detail.code[e.detail.code.length - 1];
    if (region == undefined || regionId == undefined || region == '' || regionId == '') {
      region = ['北京市', '北京市', '东城区'];
      regionId = 110101;
    }

    this.setData({
      region: region,
      regionId: regionId
    })
  },

  // 保存地址
  save: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        let params = {
          refundOrderNo: that.data.salesInfo[0].refundOrderNo,
          logisticsCompanyName: 1,
          logisticsNo: that.data.salesInfo[0].logisticsNo,
          deliveryAddressId: that.data.salesInfo[0].deliveryAddressId,
          logisticsAddressId: that.data.salesInfo[0].logisticsAddressId
        };
        return app.refund.submitLogistics(params)
      })
      .thrn(() => {
        app.showToast({
          title: '修改地址成功',
          icon: success
        })
      })
      .then(app.hideLoading)
      .catch(app.hideLoading);
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