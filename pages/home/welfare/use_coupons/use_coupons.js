let util = require('../../../../utils/util.js');
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    pageIndex: 0,
    pageSize: 10,
    rowCount: 100,
    curRowCount: 0,
    coordinates: {
      x: 0,
      y: 0
    },
  },
  // 打开当前页面路径中的参数
  pageQuery: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.setData({
		  imgSrc: app.imgSrc
		});
    let that = this;
    that.pageQuery = options;
    let couponId = that.pageQuery.couponId;
    this.setData({
      couponId: couponId,
      couponSource: that.pageQuery.couponSource
    });

    // 获取优惠券信息
    let param = {
      couponId: couponId
    }

    if (that.pageQuery.couponSource == 1) {
      app.activity.getCouponInfo(param)
        .then((res) => {
          console.log()
          that.setData({
            couponInfo: res
          });
        })
    } else if (that.pageQuery.couponSource == 2) {
      app.shop.getShopCouponInfo(param)
        .then((res) => {
          console.log()
          that.setData({
            couponInfo: res
          });
        })
    }
    
    // 商品列表
    this.getGoodsList();
  },

  shop: function () {
    let that = this;
    console.log(that.data.couponInfo.shopId);
    wx.navigateTo({
      url: '/pages/near/shop/shop?id=' + that.data.couponInfo.shopId,
    })
  },

  getGoodsList: function() {
    let that = this;
    let curRowCount = that.data.curRowCount,
        rowCount = that.data.rowCount,
        couponSource = that.data.couponSource;
    if (curRowCount < rowCount && couponSource == 1) {
      app.showLoading()
        .then(() => {
          let params = {
            couponId: that.data.couponId,
            areaId: app.areaId,
            pageIndex: that.data.pageIndex + 1,
            pageSize: that.data.pageSize
          }
          return app.activity.couponGoodsList(params);
        })
        .then((res) => {
          console.log(res);
          let list = res.list;
          that.setData({
            goodsList: that.data.goodsList.concat(list),
            pageIndex: res.pageIndex,
            rowCount: res.rowCount,
            curRowCount: that.data.curRowCount + list.length
          });
          console.log(that.data.goodsList);
          return Promise.resolve(res);
        })
        .finally(app.hideLoading);
    } else if (curRowCount < rowCount && couponSource == 2) {
      app.showLoading()
        .then(() => {
          let params = {
            couponId: that.data.couponId,
            pageIndex: that.data.pageIndex + 1,
            pageSize: that.data.pageSize
          }
          return app.shop.getShopCouponGoodsList(params);
        })
        .then((res) => {
          console.log(res);
          let list = res.list;
          that.setData({
            goodsList: that.data.goodsList.concat(list),
            pageIndex: res.pageIndex,
            rowCount: res.rowCount,
            curRowCount: that.data.curRowCount + list.length
          });
          console.log(that.data.goodsList);
          return Promise.resolve(res);
        })
        .finally(app.hideLoading);
    }
  },

  //接受商品列表组件传的购物车的数量
  get_cart_num: function (res) {
    console.log(res.detail.num);
    this.setData({
      cartNum: res.detail.num
    })
  },

  // 跳转购物车
  toCart: function() {
    wx.switchTab({
      url: '/pages/cart/index/index'
    })
  },

  toGoodsDetail: function(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id
    });
  },

  // 加入购物车
  addCart: function(event) {
    console.log(event);

    let index = event.currentTarget.dataset.index;

    let obj = {
      goodsId: event.currentTarget.id,
      organId: this.data.goodsList[index].organId,
      goodsSpecId: this.data.goodsList[index].goodsSpecId,
      goodsNum: 1
    };
    app.cart.addUserCart(obj).then(data => {
      this.setData({
        cartNum: this.data.cartNum + 1
      })
    });
  },

  lower: function() {
    this.getGoodsList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    // var query = wx.createSelectorQuery().in(this);
    // query.select('.shop_cart').boundingClientRect();
    // query.exec(res => {
    //   var bottomHeight = res[0].height;
    //   var windowHeight = wx.getSystemInfoSync().windowHeight;
    //   var scrollHeight = windowHeight - bottomHeight;
    //   this.setData({
    //     scrollHeight: scrollHeight
    //   });
    // });

    util.getDom('.target')
      .then((rect) => {
        console.log(rect);
        let coordinatesX = 'coordinates.x',
          coordinatesY = 'coordinates.y';
        that.setData({
          [coordinatesX]: rect[0].left + rect[0].width / 2,
          [coordinatesY]: rect[0].top + rect[0].height / 2
        });
        return Promise.resolve();
      });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    app.refreshCartNum()
      .then(() => {
        that.setData({
          cartNum: app.globalData.totalNumber
        })
      });
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
    this.pageQuery = null;
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