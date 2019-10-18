// pages/we/mail_address/mail_address.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    salesInfo: [],
    index: 0,
    courierList: [],
    logisticsNo: ''
  },

  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;

    that.pageQuery = options;
    that.pageQuery.applyDetails = JSON.parse(that.pageQuery.applyDetails);
    console.log(that.pageQuery.applyDetails[0].logisticsEndTime);

    that.timeChange(that.pageQuery.applyDetails[0].logisticsEndTime);

    this.setData({
      imgSrc: getApp().imgSrc,
      salesInfo: that.pageQuery.applyDetails
    });

    app.showLoading()
      .then(() => {
        // 快递列表
        return app.refund.getLogisticsompany()
      })
      .then((data) => {
        let courierList = [];
        data.list.forEach((item) => {
          courierList.push(item.name);
        })
        that.setData({
          courierList: courierList
        })
        return Promise.resolve()
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 倒计时时间
  lightningActivityTimeInterval: null,
  timeChange: function(endtime) {
    let that = this;
    return app.getServerTime()
      .catch(() => {
        return Promise.resolve(new Date().Format('yyyy-MM-dd hh:mm:ss'));
      })
      .then((serverTime) => {
        let startTime = new Date(serverTime.replace(/-/g, '/'));
        let endTime = new Date(endtime.replace(/-/g, '/'));
        let time = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        console.log(startTime, endTime, time);
        let date = util.time(time);
        that.data.failure = time > 0 ? false : true;

        that.lightningActivityTimeInterval = setInterval(function() {
          if (time > 0) {
            time = time - 1;
            date = util.time(time);
            date.day = parseInt(date.hour / 24);
            date.hour = date.hour % 24;
            console.log(date);
            that.setData({
              time: date
            });
          } else {
            that.setData({
              failure: true
            });
            console.log('time parse failed')
            clearInterval(that.lightningActivityTimeInterval);
          }
        }, 1000);
        return Promise.resolve();
      });
  },

  // 扫一扫
  scanning: function() {
    let that = this;
    wx.scanCode({
      success(res) {
        console.log(res);
        that.setData({
          logisticsNo: res.result
        })
      }
    })
  },

  bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },

  // 提交退货邮寄信息
  submit: function(event) {
    let that = this;
    app.showLoading()
      .then(() => {
        let params = {
          refundOrderNo: that.data.salesInfo[0].refundOrderNo,
          logisticsCompanyName: that.data.courierList[that.data.index],
          logisticsNo: that.data.logisticsNo,
          deliveryAddressId: that.data.salesInfo[0].deliveryAddressId,
          logisticsAddressId: that.data.salesInfo[0].logisticsAddressId
        };
        return app.refund.submitLogistics(params)
      })
      .then((data) => {
        app.hideLoading()
        app.showToast({
          title: '提交退货信息成功',
          icon: 'success'
        })
        setTimeout(function() {
          util.getPreviousPage(1).postSuccess();
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      })
      .catch(app.hideLoading);
  },

  // 跳转编辑寄件信息
  edit_info: function() {
    wx.navigateTo({
      url: '../edit_info/edit_info'
    })
  },

  // 输入快递单号
  inputLogisticsNo: function(e) {
    this.data.logisticsNo = e.detail.value;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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
    clearInterval(this.lightningActivityTimeInterval);
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