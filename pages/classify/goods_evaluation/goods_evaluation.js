// pages/classify/goods_recommend/goods_recommend.js
let util = require('../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    greyStarIcon: 'https://b2ctest.huala.com/res/app/consumer/images/online/common/level.png',
    starIcon: 'https://b2ctest.huala.com/res/app/consumer/images/online/common/level_in.png',
    bannerList: [
      'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png',
      'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png',
      'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png'
    ],
    comments: {}
  },

  // 打开当前页面路径中的参数
  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this;
    that.pageQuery = options;
    console.log(options);

    // 商品id
    let goodsId = that.pageQuery.id;

    app.showLoading()
      .then(() => {
        let data = {
          goodsId: goodsId,
          pageIndex: that.data.comments.pageIndex || 1,
          pageSize: 10
        };
        return app.goods.commentList(data);
      })
      .then((data) => {
        that.setData({
          comments: data
        });
        return Promise.resolve();
      })
      .then(app.hideLoading());
  },

  // 图片预览
  preview: function (event) {
    console.log(event.currentTarget.dataset.index);
    let index = event.currentTarget.dataset.index;
    let idx = event.currentTarget.dataset.idx;
    util.preview(this.data.comments[index].imgList[index], this.data.comments[idx].imgList);
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