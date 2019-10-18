// pages/we/footprint/index/index.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    visitedGoodsList: {}
  },
  visitedGoodsRs: {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		imgSrc: getApp().imgSrc
	});
    this.visitedGoodsList(1);
  },
  visitedGoodsList: function (pageIndex) {
    let that = this;
    return app.showLoading()
      .then(() => {
        let params = {
          pageIndex: pageIndex || 1,
          pageSize: app.pageSize
        }
        return app.user.visitedGoodsList(params);
      })
      .then((data) => {
        data.list = util.cycle(data.list, (that.visitedGoodsRs && that.visitedGoodsRs.list) || []);
        that.visitedGoodsRs = data;
        return that.refreshList(data.list);
      })
      .finally(() => {
        app.hideLoading();
        return Promise.resolve();
      });
  },
  refreshList: function (goodsList) {
    let list = [];
    for (var i = 0; i < goodsList.length; i++) {
      let obj = {
        time: '',
        list: []
      };
      for (var j = 0; j < goodsList.length; j++) {
        if (goodsList[i].visitDate == goodsList[j].visitDate) {
          obj.time = goodsList[j].visitDate
          obj.list.push(goodsList[j])
          i = j
        }
      }
      list.push(obj);
    }

    this.setData({
      visitedGoodsList: list
    });
    return Promise.resolve(list);
  },
  goods_detail: function (event) {
    let id = event.currentTarget.id;
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
    let visitedRs = this.visitedGoodsRs;
    let pageIndex = visitedRs.pageIndex || 1;
    if (visitedRs.pageCount < pageIndex) {
      return;
    }
    pageIndex = pageIndex + 1;
    this.visitedGoodsList(pageIndex);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})