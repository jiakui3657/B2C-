// pages/we/we_order_pay/we_order_pay.js
let app = getApp();
let util = require('../../../../utils/util.js');
let detailsTime = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalFlag: false,
    modalList: [],
    modalIndex: 0,
    sales: '',
    order_note: {},
    currentTab: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc,
      currentTab: options.currentTab
    });

    let that = this;
    console.log(options);
    // 待付款详情
    app.showLoading()
      .then(() => {
        let params = {
          orderNo: options.id,
          currentTab: options.currentTab
        };
        return app.order.getOrderDetail(params);
      }).then((data) => {
        console.log(data);

        that.setData({
          order_note: data
        });

        return Promise.resolve();
      })
      .then(() => {
        return app.order.orderReasonList();
      })
      .then((data) => {
        console.log(data);
        that.setData({
          modalList: data.list
        });
      })
      .then(() => {
        that.timeChange(that.data.order_note.expireTime);
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 选择退货原因
  reason: function (event) {
    console.log(event)
    this.setData({
      modalIndex: event.currentTarget.dataset.index
    });
  },

  // 确定退货原因
  confirm: function () {
    let that = this, index = this.data.modalIndex;
    that.setData({
      sales: that.data.modalList[index].name,
      modalFlag: !this.data.modalFlag
    });
    // 取消订单
    app.showLoading()
      .then(() => {
        let params = {
          orderNo: that.data.order_note.orderNo,
          cancelReasonCode: that.data.modalList[index].code,
          cancelReason: that.data.modalList[index].name
        };
        return app.order.orderCancel(params, true);
      })
      .then((data) => {
        console.log(data);
        app.showToast({title: '订单取消成功', icon: 'success'});

        // 刷新订单列表
        let pages = getCurrentPages();
        let beforePage = pages[pages.length - 2];
        console.log(beforePage);
        beforePage.onLoad({ order_code: that.data.currentTab });
        beforePage.data.good = {};

        return Promise.resolve();
      })
      .then(() => {
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/we/order/order_cancel/order_cancel?id=' + that.data.order_note.orderNo
          })
        }, 2000);
      })
      .then(app.hideLoading);
  },

  // 倒计时时间
  lightningActivityTimeInterval: null,
  timeChange: function (endtime) {
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

        that.lightningActivityTimeInterval = setInterval(function () {
          if (time > 0) {
            time = time - 1;
            date = util.time(time);
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

  // 支付订单
  pay: function () {
    let that = this;
    if (app.globalData.userInfo.walletId == undefined || app.globalData.userInfo.walletId == '') {
      wx.navigateTo({
        url: '/pages/register/register'
      })
    } else {
      app.showLoading()
        .then(() => {
          // 下订单
          let params = {
            orderNo: that.data.order_note.orderNo
          };
          return app.order.pay(params, true);
        })
        .then((data) => {
          console.log(data);
          return Promise.resolve(data);
        })
        .then((data) => {
          // 订单支付
          console.log(data);
          // let pay = JSON.parse(data);
          return app.pay(data.pay_info);
        })
        .then((res) => {
          console.log(res);
          wx.redirectTo({
            url: '/pages/cart/order_success/order_success?price=' + that.data.order_note.payAmount + '&orderNo=' + that.data.order_note.orderNo + '&orderState=' + that.data.order_note.logisticsType
          });
        })
        .catch((e) => {
          app.hideLoading();
        })
        .then(() => {
          app.hideLoading();
        });
    }
  },

  // 取消订单
  cancel: function () {
    this.setData({
      modalFlag: !this.data.modalFlag
    });
  },

  // 跳转积分兑换
  credits_exchange: function () {
    wx.navigateTo({
      url: '/pages/we/credits_exchange/index/index'
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

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(detailsTime);
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