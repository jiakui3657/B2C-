// pages/we/awarded/help/help.js
let app = getApp()
let util = require('../../../../utils/util.js');
let setTime = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalFlag: false,
    helpFlag: false,
    bangingCoupon: {},
    time: {},
    failure: false
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
        // 用户进行中的帮帮领券
        return app.activity.getBangingCoupon();
      })
      .then((res) => {
        console.log(res);

        that.timeChange(res.endTime);

        that.setData({
          bangingCoupon: res,
          // time: date,
          failure: that.data.failure
        })
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
      })
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

        that.setData({
          time: date
        });

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
      });
  },

  // 邀请规则
  cancel: function () {
    console.log(111)
    this.setData({
      modalFlag: !this.data.modalFlag
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
    clearInterval(this.lightningActivityTimeInterval);
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
  onShareAppMessage: function (res) {
    console.log(res);
    let that = this;
    if (res.from == 'button') {
      return {
        title: '拜托帮我点一下，你也可以领福利！',
        path: '/pages/we/awarded/help_couple/help_couple?id=' + that.data.bangingCoupon.id + '&consumerId=' + app.globalData.userInfo.consumerId,
        imageUrl: that.data.imgSrc +'/images/online/we/awarded/shareImage.png',
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
  }
})