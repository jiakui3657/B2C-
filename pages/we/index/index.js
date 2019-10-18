// pages/we/index/index.js
let util = require('../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    ads: {},
    goodsList: [],
    serviceList: [
      // {
      //   path: '',
      //   src: 'https://b2ctest.huala.com/res/app/consumer/images/online/we/group.png',
      //   text: '我的拼团'
      // },
      {
        path: '../coupons/index/index',
        src: getApp().imgSrc +'/images/online/we/coupons.png',
        text: '优惠券'
      },
      {
        path: '../awarded/invite/invite',
        src: getApp().imgSrc +'/images/online/we/invitation.png',
        text: '邀请有礼'
      },
      {
        path: '../vip_club/index/index',
        src: getApp().imgSrc +'/images/online/we/member.png',
        text: '会员俱乐部'
      },
      {
        path: '../credits_exchange/index/index',
        src: getApp().imgSrc +'/images/online/we/integral.png',
        text: '积分兑换'
      },
      {
        path: '../notice/index/index',
        src: getApp().imgSrc +'/images/online/we/address.png',
        text: '消息中心'
      },
      {
        path: '../address/index/index',
        src: getApp().imgSrc +'/images/online/we/service.png',
        text: '收货地址'
      }
    ],
    orderList: [
      {
        path: '../order/index/index?order_code=1',
        src: getApp().imgSrc +'/images/online/we/for_payment.png',
        text: '待付款',
        orderNum: 0
      },
      {
        path: '../order/index/index?order_code=2',
        src: getApp().imgSrc +'/images/online/we/for_send.png',
        text: '待发货',
        orderNum: 0
      },
      {
        path: '../order/index/index?order_code=3',
        src: getApp().imgSrc +'/images/online/we/for_goods.png',
        text: '待收货',
        orderNum: 0
      },
      {
        path: '../order/index/index?order_code=4',
        src: getApp().imgSrc +'/images/online/we/for_pick_up.png',
        text: '待提货',
        orderNum: 0
      },
      {
        path: '../refund/index/index',
        src: getApp().imgSrc + '/images/online/we/for_refund.png',
        text: '退货/退款',
        orderNum: 0
      }
    ],
    userInfo: {},
    coordinates: {
      x: 0,
      y: 0
    },
    pull_new: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this;
    let pull_new1 = '', pull_new2 = '';
    // 加载广告
    that.loadAllAds();

    // 查询推荐商品
    let params = {
      areaId: app.areaId,
      pageIndex: 1,
      pageSize: app.pageSize
    }
    app.goods.recommendList(params)
      .then(data => {
        that.setData({
          goodsList: data
        });
      })
      .then(() => {
        // 拉新页面数据初始化
        let obj = {
          type: 'coupon01'
        }
        return app.activity.getSystemCoupon(obj)
      })
      .then((res) => {
        console.log(res);
        pull_new1 = JSON.stringify(res) == '{}' ? false : true;
        return Promise.resolve();
      })
      .then(() => {
        // 拉新页面数据初始化
        let obj = {
          type: 'coupon02'
        }
        return app.activity.getSystemCoupon(obj)
      })
      .then((res) => {
        console.log(res);
        pull_new2 = JSON.stringify(res) == '{}' ? false : true;
        return Promise.resolve();
      })
      .then(() => {
        that.data.pull_new = pull_new1 && pull_new2 ? true : false
        that.setData({
          pull_new: that.data.pull_new
        })
      })
  },

  // 退货提醒
  goods_return: function (){
    app.showToast({ title: '敬请期待'});
  },

  loadAllAds: function () {
    let that = this;
    let positionCodes = "C_PERSONAL";
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
      .finally((e) => {
        return Promise.resolve();
      });
  },

  // 跳转服务
  service: function (event) {
    console.log(event, this.data.pull_new);
    if (event.currentTarget.dataset.url != '../awarded/invite/invite'){
      wx.navigateTo({
        url: event.currentTarget.dataset.url
      });
    } else if (event.currentTarget.dataset.url == '../awarded/invite/invite' && this.data.pull_new){
      wx.navigateTo({
        url: event.currentTarget.dataset.url
      });
    } else {
      app.showToast({ title: '暂无活动' })
    }
  },
  
  // 跳转开通会员
  vip: function () {
    wx.navigateTo({
      url: '/pages/we/vip_club/index/index'
    });
  },

  // 跳转个人信息
  to_user: function () {
    wx.navigateTo({
      url: '../user_info/index/index'
    });
  },

  // 跳转分享小程序
  share: function () {
    wx.navigateTo({
      url: '../share/index/index'
    });
  },

  // 跳转签到
  awarded: function () {
    wx.navigateTo({
      url: '../awarded/index/index'
    });
  },

  // 跳转收藏
  collect: function () {
    wx.navigateTo({
      url: '../collect/index/index'
    });
  },

  // 跳转积分
  integral: function () {
    wx.navigateTo({
      url: '../integral/index/index'
    });
  },

  // 跳转足迹
  footprint: function () {
    wx.navigateTo({
      url: '../footprint/index/index'
    });
  },

  // 跳转我的订单
  we_order: function () {
    wx.navigateTo({
      url: '../order/index/index'
    });
  },
  // 跳转商品详情
  goods_detail(event) {
    let id = event.currentTarget.id
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id
    });
  },

  // 拨打客服电话
  call: function () {
    let that = this;
    let obj = {
      title: '客服电话',
      content: app.SERVICE_TEL,
      confirmText: '呼叫'
    };
    util.showModal(obj)
      .then(() => {
        wx.makePhoneCall({
          phoneNumber: app.SERVICE_TEL
        });
      })
      .finally(() => {
        
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;

    // 初始化推荐商品终点坐标
    util.getDom('.target').then((rect) => {
      let coordinatesX = 'coordinates.x', coordinatesY = 'coordinates.y';
      that.setData({
        [coordinatesX]: rect[0].left + rect[0].width / 2,
        [coordinatesY]: rect[0].top + rect[0].height / 2
      });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    // 初始化个人中心数据
    app.refreshUserInfo().then(data => {
      that.setData({
        userInfo: data
      });
    });

    //刷新购物车商品数量
    app.refreshCartNum();

    app.order.countOrder()
    .then((res)=>{
      let orderList = this.data.orderList;
      let orderNum1 = 'orderList[0].orderNum';
      let orderNum2 = 'orderList[1].orderNum';
      let orderNum3 = 'orderList[2].orderNum';
      let orderNum4 = 'orderList[3].orderNum';
      let orderNum5 = 'orderList[4].orderNum';
     

      that.setData({
        [orderNum1]: res.waitPay,
        [orderNum2]: res.waitSend,
        [orderNum3]: res.waitRecieve,
        [orderNum4]: res.waitPick
      });
    });
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
    let that = this;
    if (that.data.goodsList.pageIndex < that.data.goodsList.pageCount) {
      let pageIndex = that.data.goodsList.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 查询推荐商品
          let params = {
            areaId: app.areaId,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          }
          app.goods.recommendList(params)
        })
        .then((data) => {
          let list = util.cycle(data.list, that.data.goodsList.list);
          let item = 'goodsList.list';
          let index = 'goodsList.pageIndex';
          that.setData({
            [item]: list,
            [index]: pageIndex
          })
          return Promise.resolve();
        })
        .then(app.showLoading)
        .catch(app.showLoading)
    } 
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})