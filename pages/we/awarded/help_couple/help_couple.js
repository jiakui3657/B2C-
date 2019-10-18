// pages/we/awarded/help_couple/help_couple.js
let app = getApp();
let util = require('../../../../utils/util.js');
let helpTime = '', securitiesTimer = '', time = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalFlag: false,
    helpFlag: true,
    maskFlag: true,
    bangingCoupon: {},
    helpTime: {},
    failure: false,
    helpInfo: {},
    bangCoupon: {},
    securitiesTime: {},
    status: '',
    navHeight: ''
  },

  // 打开当前页面路径中的参数
  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc,
      navHeight: app.navHeight
    });

    this.pageQuery = options;

    let that = this;
    console.log(options);
    app.showLoading()
      .then(() => {
        // 帮好友
        let obj = {
          activityId: that.pageQuery.id
        }
        console.log("1============帮帮领券");
        return app.activity.doBangCoupon(obj);
      })
      .catch(() => {
        console.log("2============帮帮领券");
        wx.switchTab({
          url: '/pages/home/index/index'
        })
      })
      .then((data) => {
        console.log("3============帮帮领券", data);
        // 用户进行中的帮帮领券
        let obj = {
          activityId: that.pageQuery.id
        }
        return app.activity.getBangingActivityInfo(obj);
      })
      .then((res) => {
        console.log("4============帮帮领券", res);
        console.log(res);

        that.setData({
          helpInfo: res
        })

        // 时间转换
        // let startTime = new Date();
        // let endTime = new Date(res.endTime);
        // let time = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        // console.log(startTime, endTime, time);
        // let date = util.time(time);
        // console.log(date);

        // that.setData({
        //   helpInfo: res,
        //   helpTime: date
        // })
        // console.log(that.data.helpInfo);

        // // 倒计时时间
        // helpTime = setInterval(function () {
        //   if (time > 0) {
        //     time = time - 1;
        //     date = util.time(time);
        //     console.log(date);
        //     that.setData({
        //       helpTime: date
        //     });
        //   } else {
        //     clearInterval(helpTime)
        //   }
        // }, 1000);

        that.helpTime(res.endTime);
        
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 邀请规则
  cancel: function () {
    this.setData({
      modalFlag: !this.data.modalFlag
    })
  },

  // 领劵
  securities: function () {
    let that = this, status = '', securitiesTime = {};
    app.showLoading()
      .then(() => {
        // 判断是否有帮帮领劵
        return app.activity.checkBangCoupon();
      })
      .then((res) => {
        console.log(res);
        status = res.status;
        that.setData({
          status: res.status
        })
        return Promise.resolve();
      })
      .then((res) => {
        if (status == 0) {
          // 查询系统的帮帮领券信息
          return app.activity.getBangCoupon();
        }
        return Promise.resolve();
      })
      .then((res) => {
        console.log(res);
        if (status == 0) {

          // 清理新客户倒计时
          clearInterval(that.helpTime);

          // 初始化倒计时
          let seconds = res.timeLength * 60 * 60;
          let day = that.sec_to_time(seconds);
          console.log(day);
          day = day.split(':');
          console.log(day);
          securitiesTime.hour = day[0];
          securitiesTime.minute = day[1];
          securitiesTime.seconds = day[2];

          securitiesTimer = setInterval(function () {
            if (seconds > 0) {
              seconds = seconds - 1;
              let day = that.sec_to_time(seconds);
              day = day.split(':');
              securitiesTime.hour = day[0];
              securitiesTime.minute = day[1];
              securitiesTime.seconds = day[2];
              that.setData({
                securitiesTime: securitiesTime
              });
            } else {
              clearInterval(securitiesTimer);
            }
          }, 1000);

          that.setData({
            bangCoupon: res,
            securitiesTime: securitiesTime,
            helpFlag: false,
            securitiesFlag: true
          })
        }
        return Promise.resolve();
      })
      .catch(() => {
        app.showToast({ title: '暂无活动' });
        return Promise.reject();
      })
      .then((res) => {
        if (status == 0 && that.data.bangCoupon.joinedTimesDaily < that.data.bangCoupon.joinTimesLimitDaily){
          // 发起帮帮领券
          return app.activity.joinBangCoupon();
        } else {
          return Promise.resolve();
        }
      })
      .then(() => {
        // 用户进行中的帮帮领券
        return app.activity.getBangingCoupon();
      })
      .then((res) => {
        console.log(res);

        // 清理新客户倒计时
        clearInterval(that.helpTime);

        // 时间转换
        let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
        startTime = new Date(startTime.replace(/-/g, '/'));
        let endTime = new Date(res.endTime.replace(/-/g, '/'));
        let times = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        console.log(startTime, endTime, times);
        let date = util.time(times);
        that.data.failure = times > 0 ? false : true;
        console.log(date);

        // 倒计时时间
        time = setInterval(function () {
          if (times > 0) {
            console.log(times);
            times = times - 1;
            console.log(times);
            date = util.time(times);
            console.log(date);
            that.setData({
              time: date
            });
          } else {
            that.setData({
              failure: true
            })
            clearInterval(time)
          }
        }, 1000);
        
        that.setData({
          time: date
        })
        if (status == 1){
          clearInterval(helpTime);
          clearInterval(securitiesTimer);
          
          that.setData({
            bangingCoupon: res,
            // time: date,
            helpFlag: false,
            maskFlag: false,
            failure: that.data.failure
          })
        } else {
          that.setData({
            bangingCoupon: res
          })
        }
        return Promise.resolve();
      })
      .finally((e) => {
        if (e) {
          console.error(e);
        }
        app.hideLoading();
      })
  },

  // 倒计时时间
  lightningActivityTimeInterval: null,
  helpTime: function (endtime) {
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

        that.helpTime = setInterval(function () {
          if (time > 0) {
            time = time - 1;
            date = util.time(time);
            that.setData({
              helpTime: date
            });
          } else {
            // that.setData({
            //   failure: true
            // });
            console.log('time parse failed');
            clearInterval(that.helpTime);
          }
        }, 1000);
      });
  },

  // 时间转换
  sec_to_time: function (s) {
    var t;
    if (s > -1) {
      var hour = Math.floor(s / 3600);
      var min = Math.floor(s / 60) % 60;
      var sec = s % 60;
      if (hour < 10) {
        t = '0' + hour + ":";
      } else {
        t = hour + ":";
      }

      if (min < 10) { t += "0"; }
      t += min + ":";
      if (sec < 10) { t += "0"; }
      t += sec.toFixed(0);
    }
    return t;
  },

  // 返回首页
  home: function () {
    wx.switchTab({
      url: '/pages/home/index/index'
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
    clearInterval(helpTime);
    clearInterval(securitiesTimer);
    clearInterval(time);
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
      if (that.data.status == 0) {
        that.setData({
          helpFlag: false,
          maskFlag: false,
          securitiesFlag: false
        })
        clearInterval(helpTime);
        clearInterval(securitiesTimer);
      }
      // 转发
      return {
        title: '拜托帮我点一下，你也可以领福利！',
        path: '/pages/we/awarded/help_couple/help_couple?id=' + that.data.bangingCoupon.id + '&consumerId=' + app.globalData.userInfo.consumerId,
        imageUrl: that.data.imgSrc +'/images/online/we/awarded/shareImage.png',
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
          console.log('222');
        }
      }
    }
  }
})