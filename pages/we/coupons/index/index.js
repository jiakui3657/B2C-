// pages/we/coupons/index/index.js
let util = require('../../../../utils/util.js');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    currentTab: 0,
    couponsFlag: -1,
    myCoupon: {
      unusedNum: 0,
      usedNum: 0,
      expireNum: 0
    },
    unusedCouponList: {},
    usedCouponList: {},
    expireCouponList: {},
    imgSrc: app.imgSrc
  },

  // 点击跳转领劵中心
  welfare: function() {
    wx.navigateTo({
      url: '/pages/home/welfare/index/index?index=0'
    })
  },

  //点击tab切换
  swichNav: function(e) {
    let currentTab = e.target.dataset.current;
    var that = this;
    if (this.data.currentTab === currentTab) {
      return false;
    } else {
      that.setData({
        currentTab: currentTab
      })
      if (currentTab == 0 && JSON.stringify(that.data.unusedCouponList) == '{}') {
        if (!that.data.unusedCouponList || !that.data.unusedCouponList.pageIndex) {
          app.showLoading()
            .then(this.myCouponList(1, 'unusedCouponList'))
            .finally(app.hideLoading);
          return;
        }
        return;
      }
      console.log(that.data.usedCouponList, JSON.stringify(that.data.usedCouponList) == '{}');
      if (currentTab == 1 && JSON.stringify(that.data.usedCouponList) == '{}') {
        if (!that.data.usedCouponList || !that.data.usedCouponList.pageIndex) {
          app.showLoading()
            .then(this.myCouponList(2, 'usedCouponList'))
            .finally(app.hideLoading);
          return;
        }
        return;
      }
      console.log(that.data.expireCouponList, JSON.stringify(that.data.expireCouponList) == '{}');
      if (currentTab == 2 && JSON.stringify(that.data.expireCouponList) == '{}') {
        if (!that.data.expireCouponList || !that.data.expireCouponList.pageIndex) {
          app.showLoading()
            .then(this.myCouponList(3, 'expireCouponList'))
            .finally(app.hideLoading);
          return;
        }
        return;
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo: app.globalData.userInfo
    })
    app.showLoading()
      .then(this.myCouponList(1, 'unusedCouponList'))
      .finally(app.hideLoading);
  },

  /**
   * 我的优惠券
   * @param state 优惠券类型 1-有效2-已使用3-过期
   * @param 优惠券data的key
   */
  myCouponList: function(state, key) {
    console.log(key);
    let that = this;
    // let list = this.data[key], up = key;
    // let params = {
    //   state: state,
    //   pageIndex: list.pageIndex || 1,
    //   pageSize: app.pageSize
    // }
    // return app.activity.userCouponList(params)
    //   .then((data) => {
    //     that.setData({
    //       [up]: data
    //     });
    //     return Promise.resolve(data);
    //   })
    //   .catch ((e) => {
    //     app.hideLoading();
    //     return Promise.resolve();
    //   });
    let isEmpty = false;
    return app.activity.countUserCoupon()
      .then((data) => {
        that.setData({
          myCoupon: data
        });

        // if (state == 1) {
        //   isEmpty = (data.unusedNum == 0);
        // } else if (state == 2) {
        //   isEmpty = (data.usedNum == 0);
        // } else if (state == 3) {
        //   isEmpty = (data.expireNum == 0);
        // }

        if (!isEmpty) {
          let list = this.data[key];
          let params = {
            state: state,
            pageIndex: list.pageIndex || 1,
            pageSize: app.pageSize
          }
          return app.activity.userCouponList(params)
            .then((data) => {
              console.log(data);
              
              data.list.forEach((item) => {
                item.useStartTime = item.useStartTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
                item.useStartTime = item.useStartTime.replace(/[^0-9]/mg, '.');
                item.useEndTime = item.useEndTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
                item.useEndTime = item.useEndTime.replace(/[^0-9]/mg, '.');
              })
              that.setData({
                [key]: data
              });
              return Promise.resolve(data);
            });
        } else {
          return Promise.resolve();  
        }
      })
      .catch((e) => {
        app.hideLoading();
        return Promise.resolve();
      });
  },

  // 切换说明
  explainToggle: function(event) {
    console.log(event)
    if (this.data.couponsFlag == event.currentTarget.dataset.index) {
      this.setData({
        couponsFlag: -1
      })
    } else {
      this.setData({
        couponsFlag: event.currentTarget.dataset.index
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    var query = wx.createSelectorQuery().in(this);
    query.select('.order_Content').boundingClientRect();
    query.exec(res => {
      var searchHeight = res[0].height;
      var windowHeight = wx.getSystemInfoSync().windowHeight;
      var scrollHeight = windowHeight - searchHeight;
      this.setData({
        scrollHeight: scrollHeight
      });
    });
  },

  //滑动切换tab 
  bindChange: function(e) {
    var that = this, currentTab = e.detail.current;
    that.setData({
      currentTab: currentTab
    });

    if (currentTab == 0 && JSON.stringify(that.data.unusedCouponList) == '{}') {
      if (!that.data.unusedCouponList || !that.data.unusedCouponList.pageIndex) {
        app.showLoading()
          .then(this.myCouponList(1, 'unusedCouponList'))
          .finally(app.hideLoading);
        return;
      }
      return;
    }
    console.log(that.data.usedCouponList, JSON.stringify(that.data.usedCouponList) == '{}');
    if (currentTab == 1 && JSON.stringify(that.data.usedCouponList) == '{}') {
      if (!that.data.usedCouponList || !that.data.usedCouponList.pageIndex) {
        app.showLoading()
          .then(this.myCouponList(2, 'usedCouponList'))
          .finally(app.hideLoading);
        return;
      }
      return;
    }
    console.log(that.data.expireCouponList, JSON.stringify(that.data.expireCouponList) == '{}');
    if (currentTab == 2 && JSON.stringify(that.data.expireCouponList) == '{}') {
      if (!that.data.expireCouponList || !that.data.expireCouponList.pageIndex) {
        app.showLoading()
          .then(this.myCouponList(3, 'expireCouponList'))
          .finally(app.hideLoading);
        return;
      }
      return;
    }
  },

  // 优惠券加载更多
  myCouponListLower: function(state, pageIndex) {
    let that = this;
    app.showLoading()
      .then(() => {
        let params = {
          state: state,
          pageIndex: pageIndex,
          pageSize: app.pageSize
        }
        return app.activity.userCouponList(params)
      })
      .then((res) => {
        if (state == 1) {
          that.data.unusedCouponList.pageIndex = pageIndex;
          that.data.unusedCouponList.list = util.cycle(res.list, that.data.unusedCouponList.list);
          res.list.forEach((item) => {
            item.useStartTime = item.useStartTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
            item.useStartTime = item.useStartTime.replace(/[^0-9]/mg, '.');
            item.useEndTime = item.useEndTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
            item.useEndTime = item.useEndTime.replace(/[^0-9]/mg, '.');
          })
          that.setData({
            unusedCouponList: that.data.unusedCouponList
          })
        } else if (state == 2) {
          that.data.usedCouponList.pageIndex = pageIndex;
          that.data.usedCouponList.list = util.cycle(res.list, that.data.usedCouponList.list);
          res.list.forEach((item) => {
            item.useStartTime = item.useStartTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
            item.useStartTime = item.useStartTime.replace(/[^0-9]/mg, '.');
            item.useEndTime = item.useEndTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
            item.useEndTime = item.useEndTime.replace(/[^0-9]/mg, '.');
          })
          that.setData({
            usedCouponList: that.data.usedCouponList
          })
        } else if (state == 3) {
          that.data.expireCouponList.pageIndex = pageIndex;
          that.data.expireCouponList.list = util.cycle(res.list, that.data.expireCouponList.list);
          res.list.forEach((item) => {
            item.useStartTime = item.useStartTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
            item.useStartTime = item.useStartTime.replace(/[^0-9]/mg, '.');
            item.useEndTime = item.useEndTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
            item.useEndTime = item.useEndTime.replace(/[^0-9]/mg, '.');
          })
          that.setData({
            expireCouponList: that.data.expireCouponList
          })
        }
        return Promise.resolve();
      })
      .then(app.hideLoading);

  },

  // 触底加载更多
  lower: function() {
    let that = this;
    if (that.data.currentTab == 0 && that.data.unusedCouponList.pageIndex < that.data.unusedCouponList.pageCount) {
      let pageIndex = that.data.unusedCouponList.pageIndex + 1;
      that.myCouponListLower(1, pageIndex);
    } else if (that.data.currentTab == 1 && that.data.usedCouponList.pageIndex < that.data.usedCouponList.pageCount) {
      let pageIndex = that.data.usedCouponList.pageIndex + 1;
      that.myCouponListLower(2, pageIndex);
    } else if (that.data.currentTab == 2 && that.data.expireCouponList.pageIndex < that.data.expireCouponList.pageCount) {
      let pageIndex = that.data.expireCouponList.pageIndex + 1;
      that.myCouponListLower(3, pageIndex);
    }
  },

  // 立即使用
  use: function(event) {
    console.log(event)
    let couponId = event.currentTarget.dataset.couponid,
        couponsource = event.currentTarget.dataset.couponsource;

    wx.navigateTo({
      url: '/pages/home/welfare/use_coupons/use_coupons?couponId=' + couponId + '&couponSource=' + couponsource
    });
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
  onShareAppMessage: function(res) {
    let that = this;
    let shareObj = {
      title: "朋友，送你的优惠券，记得领哦！",
      imageUrl: that.data.imgSrc + '/images/online/home/recomm/giving.png',
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
        }
      },
      fail: function () {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      }
    };
    if (res.from == 'button') {
      let couponId = res.target.dataset.couponid;
      console.log(this.data.userInfo);
      if (couponId != '') {
        shareObj.path = '/pages/home/welfare/entry_coupon/entry_coupon?couponId=' + couponId + '&avatar=' + this.data.userInfo.avatar + '&nickName=' + this.data.userInfo.nickName + '&couponType=' + res.target.dataset.couponsource;
      }
    }
    return shareObj;
  }
})