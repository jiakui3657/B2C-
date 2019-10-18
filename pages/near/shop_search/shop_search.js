// pages/classify/goods_search/goods_search.js
let util = require('../../../utils/util.js');
let storage = require('../../../utils/storageUtil.js');
let app = getApp();
const KEY = "SHOP_SEARCH_HISTORY";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shops: [],
    shopNameList: [],
    historyFlag: true,
    goodsListFlag: false,
    hotwordList: [],
    keyword: '',
    coordinates: {
      x: 0,
      y: 0
    },
    shopId: '',
    historyWords: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.setData({
		  imgSrc: app.imgSrc
		});
    let that = this;
    app.showLoading()
      .then(() => {
        that.setData({
          hotwordList: app.globalData.hotwordList,
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
        shops: []
      });
      return;
    }

    this.data.keyword = res.detail.value;
    app.showLoading()
      .then(() => {
        let params = {
          keyword: res.detail.value,
          longitude: app.longitude,
          latitude: app.latitude,
          pageIndex: 1,
          pageSize: app.pageSize
        };

        return app.shop.list(params);
      })
      .then((data) => {
        data.list.forEach((item) => {
          // 计算商家距离
          if (item.distance >= 1000) {
            let num = item.distance / 1000;
            item.distance = num.toFixed(1);
            item.distance = item.distance + 'km'
          } else {
            item.distance = item.distance + 'm';
          }
        });
        if (!that.data.historyFlag && !that.data.goodsListFlag) {
          that.setData({
            shopNameList: data.list
          });
        } else if (that.data.goodsListFlag) {
          that.setData({
            shops: data
          });
        }
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
      })
      .catch(() => {
        app.hideLoading();
      });


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

  // 返回上一页面
  go_back: function() {
    wx.navigateBack({
      delta: 2
    });
  },

  // 点击搜索历史
  clickHistorySearch: function (e) {
    this.clickHotSearch(e);
  },

  // 点击搜索热词
  clickHotSearch: function (e) {
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    var query = wx.createSelectorQuery().in(this);
    query.select('.search').boundingClientRect();
    query.exec(res => {
      var bottomHeight = res[0].height;
      var windowHeight = wx.getSystemInfoSync().windowHeight;
      var scrollHeight = windowHeight - bottomHeight;
      this.setData({
        scrollHeight: scrollHeight
      });
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
  lower: function() {
    let that = this;
    if (that.data.shops.pageIndex < that.data.shops.pageCount) {
      let pageIndex = that.data.shops.pageIndex + 1;
      app.showLoading()
        .then(() => {
          let params = {
            keyword: that.data.keyword,
            longitude: app.longitude,
            latitude: app.latitude,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };

          return app.shop.list(params);
        })
        .then((data) => {
          let item = 'shops.pageIndex';
          let goodsList = 'shops.list';
          let list = util.cycle(data.list, that.data.shops.list || []);

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
    } else {

    }

  },

  // 跳转商铺详情
  shop: function(event) {
    let index = event.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/near/shop/shop?id=' + event.currentTarget.id
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})