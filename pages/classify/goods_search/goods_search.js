// pages/classify/goods_search/goods_search.js
let util = require('../../../utils/util.js');
let storage = require('../../../utils/storageUtil.js');
let app = getApp();
const KEY = "GOODS_SEARCH_HISTORY";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [],
    goodsNameList: [],
    historyFlag: true,
    goodsListFlag: false,
    hotwordList: [],
    keyword: '',
    coordinates: {
      x: 0,
      y: 0
    },
    historyWords: []
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
    console.log(options);

    app.showLoading()
      .then(() => {
        that.setData({
          hotwordList: app.globalData.hotwordList,
          totalNumber: app.globalData.totalNumber
        });
        return Promise.resolve();
      })
      .then(app.hideLoading);

    storage.get(KEY).then(data => {
      this.setData({
        historyWords: data
      })
    })
  },

  // 删除搜索历史
  clearHistory: function() {
    storage.clear(KEY).then(
      this.setData({
        historyWords: []
      })
    )
  },

  // 接受搜索组件传的值
  componentsearch: function(res) {
    let that = this;
    if ((res.detail.value == undefined || res.detail.value.length == 0) && res.detail.clear == undefined) {
      return;
    }

    this.setData({
      historyFlag: !res.detail.val,
      goodsListFlag: res.detail.shopList
    });

    if (!res.detail.val) {
      that.setData({
        shopNameList: [],
        goodsList: []
      });
      return;
    }
    this.data.keyword = res.detail.value;
    if (that.pageQuery.couponSource == 1) {
      app.showLoading()
        .then(() => {
          // 供应商优惠券商品列表
          let params = {
            keyword: res.detail.value,
            couponId: that.pageQuery.couponId,
            areaId: app.areaId,
            pageIndex: 1,
            pageSize: app.pageSize
          };

          return app.activity.couponGoodsList(params);
        })
        .then((data) => {
          console.log(data);
          if (!that.data.historyFlag && !that.data.goodsListFlag) {
            that.setData({
              goodsNameList: data.list
            });
            console.log(that.data.goodsNameList);
          } else if (that.data.goodsListFlag) {
            that.setData({
              goodsList: data
            });
            that.onReady();
          }
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
        .catch(() => {
          app.hideLoading();
        });
    } else if (that.pageQuery.couponSource == 2) {
      app.showLoading()
        .then(() => {
          // 店铺优惠券商品列表
          let params = {
            keyword: res.detail.value,
            couponId: that.pageQuery.couponId,
            pageIndex: 1,
            pageSize: app.pageSize
          };

          return app.shop.getShopCouponGoodsList(params);
        })
        .then((data) => {
          console.log(data);
          if (!that.data.historyFlag && !that.data.goodsListFlag) {
            that.setData({
              goodsNameList: data.list
            });
            console.log(that.data.goodsNameList);
          } else if (that.data.goodsListFlag) {
            that.setData({
              goodsList: data
            });
            that.onReady();
          }
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
        .catch(() => {
          app.hideLoading();
        });
    } else {
      app.showLoading()
        .then(() => {
          // 商品列表
          let params = {
            keyword: res.detail.value,
            areaId: app.areaId,
            pageIndex: 1,
            pageSize: app.pageSize
          };

          return app.goods.list(params);
        })
        .then((data) => {
          console.log(data);
          if (!that.data.historyFlag && !that.data.goodsListFlag) {
            that.setData({
              goodsNameList: data.list
            });
            console.log(that.data.goodsNameList);
          } else if (that.data.goodsListFlag) {
            that.setData({
              goodsList: data
            });
            that.onReady();
          }
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
        .catch(() => {
          app.hideLoading();
        });
    }
    

    // 保存搜索历史
    if (!that.data.historyFlag && !that.data.goodsListFlag) {
      return;
    }

    storage.saveSearch(KEY, that.data.keyword, that.data.historyWords).then(data => {
      this.setData({
        historyWords: data
      })
    })
  },

  //接受商品列表组件传的购物车的数量
  get_cart_num: function(res) {
    console.log(res);
    this.setData({
      totalNumber: res.detail.num
    })
  },

  // 返回上一页面
  go_back: function() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 点击搜索历史
  clickHistorySearch: function(e) {
    this.clickHotSearch(e);
  },

  // 点击搜索热词
  clickHotSearch: function(e) {
    let content = e.currentTarget.dataset.content;
    this.setData({
      value: content
    })
    this.componentsearch({
      detail: {
        val: true,
        shopList: true,
        value: content
      }
    })
  },

  // 点击搜索联想结果
  goodsNameClick: function(e) {
    let id = e.currentTarget.id
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id
    });
  },

  // 跳转购物车
  go_cart: function () {
    wx.switchTab({
      url: '/pages/cart/index/index'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this;
    return util.getDom('#goods')
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
    let that = this;
    if (that.data.goodsList.pageIndex < that.data.goodsList.pageCount) {
      let pageIndex = that.data.goodsList.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 商品列表
          let params = {
            keyword: that.data.keyword,
            areaId: app.areaId,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };

          return app.goods.list(params);
        })
        .then((data) => {
          console.log(data);
          let item = 'goodsList.pageIndex';
          let goodsList = 'goodsList.list';
          let list = util.cycle(data.list, that.data.goodsList.list || []);

          that.setData({
            [goodsList]: list,
            [item]: pageIndex
          });
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
        .catch(() => {
          app.hideLoading();
        });
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})