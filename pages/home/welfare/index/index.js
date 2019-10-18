// pages/home/welfare/welfare.js
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
    flashCurrentTab: 0,
    userInfo: {},
    ads: {},
    flashActivityList: [],
    flashActivityGoodsList: {},
    //待收货
    vipGoodsList: {},
    timeFlag: 0,
    scrollCode: true,
    indicatorIndex: 0,
    hour: '00',
    minute: '00',
    second: '00',
    couponList: {},
    serverTime: null,
    vipGoodsPaddingTop: '92rpx',
    cartNum: 0,
    coordinates: {
      x: 0,
      y: 0
    },
    activityId:'',
    imgSrc: app.imgSrc
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let userInfo = app.globalData.userInfo;
    let vipGoodsPaddingTop = '92rpx';
    if (userInfo.memberGradeCode == 'M103') {
      vipGoodsPaddingTop = '14rpx';
    }
    that.setData({
      currentTab: options.index,
      userInfo: userInfo,
      vipGoodsPaddingTop: vipGoodsPaddingTop
    });
    that.loadAllAds();

    if (options.index == 1) {
      return app.cart.getCartGoodsNum()
        .then((data) => {
          console.log(data);
          that.setData({
            cartNum: data.num
          })
        })
        .then(that.loadFlashActivity)
      return;
    }

    // 获取商品分类距离顶部的高
    util.getDom('#remind')
      .then(function (value) {
        that.setData({
          scrollTop: value.top - 40,
        });
      })
      .then(() => {
        return app.cart.getCartGoodsNum();
      })
      .then((data) => {
        console.log(data);
        that.setData({
          cartNum: data.num
        })
      })
      .then(that.get_content(options.index))
      .then(app.hideLoading);
  },

  // 切换说明
  explainToggle: function (event) {
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

  // 禁止滑动
  catchTouchMove: function (res) {
    return false
  },
  
  initFlashActivity: function() {
    let that = this;
    let srvDiffTime;
    return new Promise((resolve, reject) => {
        // 初始化秒杀时间
        that.data.flashActivityList.forEach((item, index) => {
          let obj = util.format(item.startTime);
          let date = 'flashActivityList[' + index + '].date';
          let time = 'flashActivityList[' + index + '].time';
          that.setData({
            [date]: obj.date,
            [time]: obj.time
          });
        });
        resolve();
      })
      .then(() => {
        return app.getServerTime()
        .catch(() => {
          return Promise.resolve(new Date().Format('yyyy-MM-dd hh:mm:ss'));
        });
      })
      .then((srvtime) => {
        that.setData({
          serverTime: srvtime
        });
        let time = new Date(srvtime).getTime();
        srvDiffTime = new Date().getTime() - time;
        let flashActivityList = that.data.flashActivityList;
        if (flashActivityList && flashActivityList.length > 0) {
          let activity = flashActivityList[0];
          let startTime = new Date(activity.startTime).getTime();
          let endTime = new Date(activity.endTime).getTime();
          let state = activity.state;
          
          // 秒杀倒计时
          let hour = null, minute = null, second = null;
          if (state == 1) {
            let up0 = 'flashActivityList[0].flag';
            that.setData({
              [up0]: true
            });
            startTime = time;
            console.log('startTime, endTime', startTime, endTime);
            that.seckillTime(startTime, endTime);
          } else {
            let up0 = 'flashActivityList[0].flag';
            that.setData({
              [up0]: false
            });
            time = startTime - time;
            if (time >= 0) {
              that.lightningActivityTimeInterval = setInterval(function () {
                time--;
                if (time == 0) {
                  clearInterval(that.lightningActivityTimeInterval);
                  that.setData({
                    [up0]: true
                  });
                  that.seckillTime(startTime, endTime);
                }
              }, 1000);
            }
            console.log('时间还没有到');
          }
        }
        return Promise.resolve();
      });
  },
  // 倒计时时间
  lightningActivityTimeInterval: null,
  seckillTime: function (startTime, endTime, clientDiffTime) {
    let that = this;
    let diffTime = (endTime - startTime) / 1000;
    let time = util.time(diffTime);
    that.setData({
      hour: time.hour,
      minute: time.minute,
      second: time.second
    });

    that.lightningActivityTimeInterval = setInterval(function () {
      diffTime = diffTime - 1;
      time = util.time(diffTime);
      that.setData({
        hour: time.hour,
        minute: time.minute,
        second: time.second
      });
      if (diffTime == 0) { 
        let up0 = 'flashActivityList[0].flag';
        that.setData({
          [up0]: false
        });
        clearInterval(that.lightningActivityTimeInterval);
        that.loadFlashActivity();
      }
    }, 1000);
  },

  // 跳转购物车
  go_cart: function () {
    wx.switchTab({
      url: '/pages/cart/index/index'
    })
  },

  // 获取banner轮播图的索引
  get_banner: function (event) {
    this.setData({
      indicatorIndex: event.detail.current
    })
  },

  get_content: function(a) {
    var that = this;
    if (a == 0) {
      this.getCouponList(1);
    } else if (a == 1) {
      app.showLoading()
        .then(that.getFlashActivityList)
        .then(that.initFlashActivity)
        .then(() => {
          let flashActivityList = this.data.flashActivityList;
          if (flashActivityList && flashActivityList.length > 0) {
            let activityId = flashActivityList[0].activityId;
            let goodsList = this.data.flashActivityGoodsList[activityId];
            let pageIndex = goodsList || 1;
            return that.getFlashActivityGoodsList(activityId, pageIndex);
          }
          return Promise.resolve();
        })
        .then(app.hideLoading)
        .catch(app.hideLoading);
    } else {
      app.showLoading()
      .then(that.getVipGoods(1))
      .then(app.hideLoading)
      .catch(app.hideLoading);
    }
  },

  get_top: function (e) {
    let that = this
    if (e.detail.scrollTop >= that.data.scrollTop) {
      that.setData({
        scrollCode: false
      });
    } else {
      that.setData({
        scrollCode: true
      });
    }
  },

  // 跳转分享劵
  share_coupon: function (e) {
    let couponId = e.currentTarget.dataset.couponid;
    wx.navigateTo({
      url: '../entry_coupon/entry_coupon?couponId=' + couponId
    });
  },

  // 跳转秒杀商品详情
  goods_detail: function (event) {
    let id = event.currentTarget.id;
    let goodsSpecId = event.currentTarget.dataset.goods_spec_id;
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id + '&goodsSpecId=' + goodsSpecId
    });
  },

  // 切换时间场次
  timeToggle: function (event) {
    console.log(event, event.currentTarget.dataset.index);
    let activityId = event.currentTarget.id; this.setData({
      timeFlag: event.currentTarget.dataset.index,
      flashCurrentTab: event.currentTarget.dataset.index
    });

    let flashActivityList = this.data.flashActivityList;
    if (flashActivityList && flashActivityList.length > 0) {
      let goodsList = this.data.flashActivityGoodsList[activityId];
      if (goodsList && goodsList.list && goodsList.list.length > 0) {
        return Promise.resolve();
      }
      let pageIndex = 1;
      return this.getFlashActivityGoodsList(activityId, pageIndex);
    }
  },
  //点击tab切换
  swichNav: function (e) {
    let that = this;
    let selectedTab = e.target.dataset.current;
    if (this.data.currentTab === selectedTab) {
      return false;
    } else {
      that.setData({
        currentTab: selectedTab
      });
      console.log(that.data.flashActivityGoodsList);
      if (selectedTab == 0 && JSON.stringify(that.data.couponList) == '{}' ) {
        this.getCouponList(1);
      } else if (selectedTab == 1 && JSON.stringify(that.data.flashActivityGoodsList) == '{}') {
        app.showLoading()
          .then(that.loadFlashActivity)
          .then(app.hideLoading)
          .catch(app.hideLoading);
      } else if (selectedTab == 2 && JSON.stringify(that.data.vipGoodsList) == '{}') {
        app.showLoading()
        .then(that.getVipGoods(1))
        .then(() => {
          // 初始化推荐商品终点坐标
          util.getDom('.cart').then((rect) => {
            console.log(rect);
            let coordinatesX = 'coordinates.x', coordinatesY = 'coordinates.y';
            that.setData({
              [coordinatesX]: rect[0].left + rect[0].width / 2,
              [coordinatesY]: rect[0].top + rect[0].height / 2
            });
            console.log(that.data.coordinates);
          });
        })
        .then(app.hideLoading)
        .catch(app.hideLoading);
      }
    }
  },
  loadFlashActivity: function() {
    let that = this;
    return that.getFlashActivityList()
      .then(that.initFlashActivity)
      .then(() => {
        let flashActivityList = that.data.flashActivityList;
        if (flashActivityList && flashActivityList.length > 0) {
          let activityId = flashActivityList[0].activityId;
          let goodsList = that.data.flashActivityGoodsList[activityId];
          let pageIndex = goodsList || 1;
          return that.getFlashActivityGoodsList(activityId, pageIndex);
        }
        return Promise.resolve();
      })
  },
  loadAllAds: function () {
    let that = this;
    let positionCodes = "C_COUPON";
    return that.loadBatchAds(positionCodes);
  },
  loadBatchAds: function (positionCodes) {
    let that = this;
    let params = {
      positionCode: positionCodes,
      latitude: app.latitude,
      longitude: app.longitude
    };
    return app.other.batchBannerList(params)
      .then((data) => {
        that.setData({
          ads: data
        });
        return Promise.resolve(data);
      })
      .catch((e) => {
        if (e) {
          console.error("加载广告出错", e);
        }
        return Promise.resolve();
      });
  },
  getCouponList: function (pageIndex) {
    let that = this;
    return app.showLoading()
      .then(() => {
        let params = {
          pageIndex: pageIndex || 1,
          pageSize: app.pageSize
        };
        return app.activity.couponList(params)
          .then((data) => {
            that.setData({
              couponList: data
            });
            return Promise.resolve(data);
          });
      })
      .then(() => {
        app.hideLoading();
        return Promise.resolve();
      })
      .catch((e) => {
        if (e) {
          console.error('领券中心-优惠券获取失败', e);
        }
        app.hideLoading();
        return Promise.resolve();
      });
  },
  getCoupon: function (couponId) {
    let that = this;
    let params = {
      couponId: couponId
    };
    return app.activity.getCoupon(params)
      .then((data) => {
        let obj = {
          title: '领取成功'
        };
        let couponList = that.data.couponList;
        couponList.list.forEach((coupon) => {
          if (coupon.couponId == couponId) {
            coupon.isTake = 1;
            coupon.getNum = coupon.getNum + 1;
          }
        });

        that.setData({
          couponList: couponList
        });
        app.showToast(obj);
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
        return Promise.resolve();
      })
      .catch((e) => {
        if (e) {
          console.error('领券中心-优惠券领取失败，couponId=' + couponId, e);
        }
        app.hideLoading();
        return Promise.resolve();
      });
  },
  getFlashActivityList: function() {
    let that = this;
    return app.activity.todayFlashActivityList()
    .then((data) => {
      that.setData({
        flashActivityList: data.list
      });
      return Promise.resolve(data.list);
    });
  },
  getFlashActivityGoodsList: function (activityId, pageIndex) {
    this.data.activityId = activityId;
    let that = this;
    let goodsList = this.data.flashActivityGoodsList[activityId];
    let params = {
      activityId: activityId,
      areaId: app.areaId,
      pageIndex: pageIndex || 1,
      pageSize: app.pageSize
    };
    return app.activity.lightningGoodsList(params)
      .then((data) => {
        let key = "flashActivityGoodsList." + activityId;
        that.setData({
          [key]: data
        });
        return Promise.resolve(data);
      });
  },
  getVipGoods: function (pageIndex) {
    let that = this;
    let params = {
      areaId: app.areaId,
      pageIndex: pageIndex,
      pageSize: app.pageSize
    }
    return app.goods.vipGoodsList(params)
    .then((data) => {
      that.setData({
        vipGoodsList: data
      });
      return Promise.resolve(data);
    });
  },
  // 跳转优惠券
  coupons: function () {
    wx.navigateTo({
      url: '/pages/we/coupons/index/index'
    });
  },

  // 立即使用
  use: function (event) {
    let couponId = event.currentTarget.dataset.couponid;
    wx.navigateTo({
      url: '../use_coupons/use_coupons?couponId=' + couponId + '&couponSource=' + 1
    });
  },

  // 领劵中心触底加载
  couponLower: function () {
    let that = this;
    if (that.data.couponList.pageIndex <= that.data.couponList.pageCount) {
      let pageIndex = that.data.couponList.pageIndex + 1;
      app.showLoading()
        .then(() => {
          let params = {
            pageIndex: pageIndex,
            pageSize: 10
          };
          return app.activity.couponList(params)
        })
        .then((data) => {
          let list = util.cycle(data.list, that.data.couponList.list);
          let index = 'couponList.pageIndex';
          let item = 'couponList.list'
          that.setData({
            [index]: pageIndex,
            [item]: list
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
        .catch(app.hideLoading)
    }
  },

  vipGoodslower: function () {
    let that = this;
    let pageIndex = that.data.vipGoodsList.pageIndex + 1;
    if (pageIndex > that.data.vipGoodsList.pageCount) {
      return;
    }
    app.showLoading()
      .then(() => {
        let params = {
          areaId: app.areaId,
          pageIndex: pageIndex,
          pageSize: app.pageSize
        }
        return app.goods.vipGoodsList(params)
          .then((data) => {
            let list = util.cycle(data.list, that.data.vipGoodsList.list);
            let index = 'vipGoodsList.pageIndex';
            let item = 'vipGoodsList.list'
            that.setData({
              [index]: pageIndex,
              [item]: list
            });
            return Promise.resolve(data);
          });
        
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 闪电购分页
  seckillLower:function(){
    let that = this;
    let activityId = this.data.activityId;
    let goodsList = that.data.flashActivityGoodsList[activityId];
    let pageIndex = goodsList.pageIndex + 1;
    if (pageIndex > goodsList.pageCount) {
      return;
    }
    let params = {
      activityId: activityId,
      areaId: app.areaId,
      pageIndex: pageIndex,
      pageSize: app.pageSize
    };
    app.showLoading()
    .then(()=>{
      return app.activity.lightningGoodsList(params)
        .then((data) => {
          let list = util.cycle(data.list, goodsList.list);
          goodsList.pageIndex = pageIndex;
          let key1 = "flashActivityGoodsList." + activityId +'.list';
          let key2 = "flashActivityGoodsList." + activityId +'.pageIndex';
          that.setData({
            [key1]: list,
            [key2]: pageIndex
          });
          return Promise.resolve(data);
        });
      }).then(app.hideLoading)
      .catch(app.hideLoading)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成--计算无限加载滚动的高度
   */

  onReady: function () {
    var that = this;
    var query = wx.createSelectorQuery().in(this);
    query.select('.order_Content').boundingClientRect();
    query.exec(res => {
      var searchHeight = res[0].height;
      var windowHeight = wx.getSystemInfoSync().windowHeight;
      var scrollHeight = windowHeight - searchHeight + 40;
      this.setData({ scrollHeight: scrollHeight });
    });
  },

  // 获取购物车的数量
  get_cart_num: function (res) {
    console.log(res);
    this.setData({
      cartNum: res.detail.num
    })
  },

  getCouponBtn: function (e) {
    let couponId = e.currentTarget.dataset.id, that = this;
    console.log(e);
    if (e.currentTarget.dataset.isvipcoupon == 1 && app.globalData.userInfo.memberGradeCode != 'M103') {
      let obj = {
        title: ' ',
        content: '该劵开通VIP会员可领',
        cancelText: '暂不领取',
        confirmText: '立即开通'
      }
      util.showModal(obj)
        .then(() => {
          wx.navigateTo({
            url: '/pages/we/vip_club/open_vip/open_vip',
          })
        })
        .catch(() => {

        })
    } else {
      this.getCoupon(couponId);
    }
  },
  //滑动切换tab 
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  flashBindChange: function (e) {
    var that = this;
    console.log(e);
    that.setData({ flashCurrentTab: e.detail.current });
  },
  catchTouchMove: function (res) {
    return false
  },
  //转发
  onShareAppMessage: function (res) {
    let that = this;
    let shareObj = {
      // path: '/pages/home/welfare/entry_coupon/entry_coupon?couponId=' + couponId,
      title: "朋友，送你的优惠券，记得领哦！",
      imageUrl: that.data.imgSrc+'/images/online/home/recomm/giving.png',
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
      if (couponId != '') {
        shareObj.path = '/pages/home/welfare/entry_coupon/entry_coupon?couponId=' + couponId + '&avatar=' + this.data.userInfo.avatar + '&nickName=' + this.data.userInfo.nickName;
      }
    }
    return shareObj;
    
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
  // onShareAppMessage: function () {

  // }
})