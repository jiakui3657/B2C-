// pages/we/vip_club/index/index.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ads: {},
    privilegeList: [
      
    ],
    userInfo: {},
    vipCouponList: [],
    vipGoodsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this;

    // 会员特权
    app.showLoading()
      .then(() => {
        // 查询vip商品
        let params = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: 9
        };
        app.goods.vipGoodsList(params)
        .then((data) => {
          that.setData({
            vipGoodsList: data.list
          });
        });

        // 加载广告
        return that.loadAllAds();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading);
  },
  loadAllAds: function (positionCode) {
    let that = this;
    let positionCodes = "C_VIP";
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
        console.error("加载广告出错", e);
        return Promise.resolve();
      });
  },
  getCouponList: function () {
    let that = this;
    let params = {
      pageIndex: 1,
      pageIndex: 10,
      vipOnly: 1
    };
    return app.activity.couponList(params)
      .then((data) => {

        data.list.forEach((item) => {
          item.remark = item.remark.split('：')[0];
        })

        that.setData({
          vipCouponList: data.list
        });
      })
      .then(() => {
        app.hideLoading();
        return Promise.resolve();
      })
      .catch((e) => {
        console.error('领券中心-优惠券获取失败');
        app.hideLoading();
        return Promise.resolve();
      });
  },

  // 领取优惠券
  getCoupon: function (e) {
    let that = this;
    let couponId = e.currentTarget.dataset.couponid;
    let params = {
      couponId: couponId
    };
    return app.activity.getCoupon(params)
      .then((data) => {
        let obj = {
          title: '领取成功'
        };
        let vipCouponList = that.data.vipCouponList;
        vipCouponList.forEach((coupon) => {
          if (coupon.couponId == couponId) {
            coupon.isTake = 1;
            coupon.getNum = coupon.getNum + 1;
          }
        });

        that.setData({
          vipCouponList: vipCouponList
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

  // 跳转积分兑换
  credits_exchange: function (event) {
    wx.navigateTo({
      url: '/pages/we/credits_exchange/index/index?tabIndex=' + event.currentTarget.dataset.index
    })
  },

  // 跳转购买会员页
  open_vip: function () {
    wx.navigateTo({
      url: '../open_vip/open_vip'
    })
  },

  // 跳转使用优惠券
  go_coupons: function (event) {
    wx.navigateTo({
      url: '/pages/home/welfare/use_coupons/use_coupons?couponId=' + event.currentTarget.id
    })
  },

  // 跳转特权
  privilege: function () {
    wx.navigateTo({
      url: '../privilege_list/privilege_list'
    })
  },

  toGoodsDetail: function(event) {
    let id = event.currentTarget.id
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id
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
    let that = this;
    app.refreshUserInfo()
    .then(data => {
      that.setData({
        userInfo: data
      });

      return Promise.resolve(data);
    })
    .then((data) => {
      // 获取会员权益
      let params = {
        memberGradeCode: data.memberGradeCode
      };
      return app.user.privilegeList(params);   
    })
    .then((data) => {
      that.setData({
        privilegeList: data.privilegeList
      });
    });

    // 获取优惠券列表
    that.getCouponList();
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