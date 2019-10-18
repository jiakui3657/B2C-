// pages/home/entry_coupon/entry_coupon.js
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    userInfo: {},
    coupon: {},
    navHeight: ''
  },

  // 打开当前页面路径中的参数
  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("分享优惠券详情页面：",options);
    this.setData({
      imgSrc: getApp().imgSrc,
      navHeight: app.navHeight
    });

    let that = this;
    that.pageQuery = options;
    console.log(that.pageQuery);
    let couponId = that.pageQuery.couponId;
    if (!couponId) {
      let obj = {
        title: '优惠券不存在'
      }
      app.showToast(obj, () => {
        wx.redirectTo({
          url: '/pages/home/index/index'
        });
      });
    }
    that.setData({
      avatar: that.pageQuery.avatar,
      nickName: that.pageQuery.nickName,
      couponType: that.pageQuery.couponType || 1
    });
    app.showLoading()
      .then(that.couponDetail({ couponId }))
      .then(that.recommend_goods)
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 跳转首页
  home: function () {
    wx.switchTab({
      url: '/pages/home/index/index'
    });
  },

  // 领劵
  securities: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        let params = {
          couponId: that.data.coupon.couponId
        }
        return app.activity.getCoupon(params, true)
      })
      .then((data) => {
        let isRecieved = 'coupon.isRecieved';
        that.setData({
          [isRecieved]: 1
        })
        app.showToast({title: '领劵成功', icon: 'success'});
        app.hideLoading();
      })
      .catch(() => {
        app.hideLoading();
        // app.showToast({ title: '优惠券已领完' });
      })
  },

  // 领取店铺优惠券
  securitiesShop: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        let params = {
          couponId: that.data.coupon.couponId
        }
        return app.shop.getShopCoupon(params, true)
      })
      .then((data) => {
        let isRecieved = 'coupon.isRecieved';

        that.setData({
          hasGetNum: that.data.hasGetNum + 1
        })

        if (that.data.hasGetNum >= that.data.getNumLimit) {
          that.setData({
            [isRecieved]: 1
          })
        }
        
        app.showToast({ title: '领劵成功', icon: 'success' });
        app.hideLoading();
      })
      .catch(() => {
        app.hideLoading();
        // app.showToast({title: '优惠券已领完'});
      })
  },

  // 立即使用
  employ: function (){
    wx.navigateTo({
      url: '../use_coupons/use_coupons?couponId=' + this.data.coupon.couponId + '&&couponSource=' + this.data.couponType
    })
  },

  // 跳转领卷中心
  go_securities: function () {
    wx.navigateTo({
      url: '../index/index?index=0'
    })
  },

  // 获取优惠券详情
  couponDetail(couponId) {
    let that = this;
    if (that.data.couponType == 2) {
      return app.shop.getShopCouponInfo(couponId)
        .then((data) => {
          data.getEndTime = new Date(data.useEndTime).Format('yyyy-MM-dd');
          data.useStartTime = data.useStartTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
          data.useStartTime = data.useStartTime.replace(/[^0-9]/mg, '.');
          data.useEndTime = data.useEndTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
          data.useEndTime = data.useEndTime.replace(/[^0-9]/mg, '.');
          that.setData({
            avatar: that.data.avatar || data.shopLogo,
            nickName: that.data.nickName || data.shopName,
            coupon: data,
            getNumLimit: data.getNumLimit,
            hasGetNum: data.hasGetNum
          });
          return Promise.resolve(data);
        });
    } else {
      return app.activity.getCouponInfo(couponId)
        .then((data) => {
          data.getEndTime = new Date(data.useEndTime).Format('yyyy-MM-dd');
          data.useStartTime = data.useStartTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
          data.useStartTime = data.useStartTime.replace(/[^0-9]/mg, '.');
          data.useEndTime = data.useEndTime.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
          data.useEndTime = data.useEndTime.replace(/[^0-9]/mg, '.');
          that.setData({
            coupon: data
          });
          return Promise.resolve(data);
        });
    }
  },

  // 获取推荐商品
  recommend_goods: function (event) {
    let params = {
      areaId: app.areaId,
      pageIndex: 1,
      pageSize: app.pageSize
    }
    return app.goods.recommendList(params)
      .then(data => {
        that.setData({
          goodsList: data
        });
        return Promise.resolve();
      })
      .catch(() => {
        return Promise.resolve();
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