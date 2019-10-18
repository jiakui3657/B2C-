// pages/we/collect/collect.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    collectedGoodsRs: {},
    collectedThingRs: {},
    winWidth: 0,
    winHeight: 0,
    //广告
    banner: [
      {
        "id": 1,
        "src": "../../images/center/banner.png",
        "url": ""
      }],
    // tab切换  
    currentTab: 0,
    currentTabCasual: 0,
    goods_line: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this;
    if (that.data.currentTab == 0 && JSON.stringify(that.data.collectedGoodsRs) == '{}') {
      that.collectedGoodsList(1)
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.collectedThingRs) == '{}') {
      that.collectedThingList()
    }
    // that.collectedGoodsList(1)
    //   .then(that.collectedThingList);
  },
  collectedGoodsList: function (pageIndex) {
    let that = this;
    return app.showLoading()
      .then(() => {
        let params = {
          pageIndex: pageIndex || 1,
          pageSize: app.pageSize
        }
        return app.user.collectedGoodsList(params);
      })
      .then((data) => {
        data.list = util.cycle(data.list, (that.data.collectedGoodsRs && that.data.collectedGoodsRs.list) || []);
        that.setData({
          collectedGoodsRs: data,
          goods_line: data.pageIndex < data.pageCount ? true : false
        });
        return Promise.resolve();
      })
      .finally(() => {
        app.hideLoading();
        return Promise.resolve();
      });
    
  },
  addCart: function (event) {
    let that = this;
    app.showLoading()
      .then(() => {
        let index = event.currentTarget.dataset.index;
        let goods = that.data.collectedGoodsRs.list[index];  
        let params = {
          goodsId: goods.goodsId,
          organId: goods.organId,
          goodsSpecId: goods.goodsSpecId,
          goodsNum: 1
        }
        return app.cart.addUserCart(params);
      })
      .then((data) => {
        let goodsList = app.globalData.goodsId || [];
        goodsList.push(goods.goodsId);
        app.setGlobalData('goodsId', goodsList);
        let obj = {
          title: '添加成功',
          icon: 'success'
        }
        app.showToast(obj);
        return Promise.resolve();
      })
      .then(app.refreshCartNum)
      .finally(app.hideLoading);
  },
  collectedThingList: function (pageIndex) {
    let that = this;
    return app.showLoading()
      .then(() => {
        let params = {
          pageIndex: pageIndex || 1,
          pageSize: app.pageSize
        }
        return app.user.collectedThingList(params);
      })
      .then((data) => {
        data.list = util.cycle(data.list, (that.data.collectedThingRs && that.data.collectedThingRs.list) || []);

        data.list.forEach((items, index) => {
          let arr = [];
          items.imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
          items.imgList.forEach((item) => {
            console.log(item);
            var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
            arr.push(src[1]);
          })
          items.imgList = arr;

          items.content = items.content.replace(/<[^>]*>|/g, "");
        })

        that.setData({
          collectedThingRs: data
        });
        return Promise.resolve();
      })
      .finally(() => {
        app.hideLoading();
        return Promise.resolve();
      });
  },
  // 商品触底
  goods_lower: function () {
    let that = this;
    let pageIndex = that.data.collectedGoodsRs.pageIndex + 1;
    if (that.data.collectedGoodsRs.pageIndex < that.data.collectedGoodsRs.pageCount) {
      that.collectedGoodsList(pageIndex);
    }
  },
  // 好物触底
  thing_lower: function () {
    let that = this;
    let pageIndex = that.data.collectedThingRs.pageIndex + 1;
    if (that.data.collectedThingRs.pageIndex < that.data.collectedThingRs.pageCount) {
      that.collectedThingList(pageIndex);
    }
  },
  //点击tab切换
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      });
    }
    if (that.data.currentTab == 0 && JSON.stringify(that.data.collectedGoodsRs) == '{}') {
      that.collectedGoodsList(1)
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.collectedThingRs) == '{}') {
      that.collectedThingList()
    }
  },

  // 点赞
  praise: function (event) {
    console.log(event);
    let that = this;
    if (event.currentTarget.dataset.isprised == 1) {
      app.showLoading()
        .then(that.praiseThing(event.currentTarget.dataset.id, 2, event.currentTarget.dataset.item, event.currentTarget.dataset.prisenum))
        .then(app.hideLoading)
    } else {
      app.showLoading()
        .then(that.praiseThing(event.currentTarget.dataset.id, 1, event.currentTarget.dataset.item, event.currentTarget.dataset.prisenum))
        .then(app.hideLoading)
    }
  },

  // 点赞/取消点赞
  praiseThing: function (thingId, type, item, num) {
    console.log(thingId, type, item, num);
    let that = this;
    let params = {
      thingId: thingId,
      type: type
    }
    return app.thing.praiseThing(params)
      .then((data) => {
        let isPrised = item + 'isPrised';
        let priseNum = item + 'priseNum';
        if (type == 1) {

          that.setData({
            [isPrised]: 1,
            [priseNum]: num + 1
          })
          app.showToast({ title: '点赞成功', icon: 'success' });
        } else {
          that.setData({
            [isPrised]: 0,
            [priseNum]: num - 1
          })
          app.showToast({ title: '取消点赞成功', icon: 'success' });
        }
        return Promise.resolve();
      })
      .catch((e) => {
        console.error("点赞/取消点赞失败", e);
        return Promise.resolve();
      });
  },

  //滑动切换tab 
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
    if (that.data.currentTab == 0 && JSON.stringify(that.data.collectedGoodsRs) == '{}') {
      that.collectedGoodsList(1)
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.collectedThingRs) == '{}') {
      that.collectedThingList()
    }
  },

  lower: function () {
    console.log('11')
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
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
  // 跳转商品详情
  goods_detail: function (event) {
    let id = event.currentTarget.id
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id
    });
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
  onShareAppMessage: function (res) {
    console.log(res);
    let that = this;
    if (res.from == 'button' && res.target.dataset.type == 'T104') {
      return {
        title: res.target.dataset.title,
        path: '/pages/we/awarded/help_couple/help_couple?shareid=' + res.target.dataset.shareid + '&path=' + '/pages/home/circle/awarded/share_dynamic_details/share_dynamic_details',
        imageUrl: res.target.dataset.src,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    } else {
      return {
        title: res.target.dataset.title,
        path: '/pages/home/circle/share_dynamic_details/share_dynamic_details?shareid=' + res.target.dataset.shareid + '&path=' + '/pages/home/circle/share_dynamic_details/share_dynamic_details',
        imageUrl: res.target.dataset.src,
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