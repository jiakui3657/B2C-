// pages/we/vip_club/privilege_list/privilege_list.js
let util = require('../../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    left_distance: [],
    scrollWidth: 0,
    scroll_left: 0,
    shop_classify_id: 0,
    privilegeList: []
  },

  //点击tab切换
  swichNav: function(e) {
    var that = this,
      index = e.currentTarget.dataset.current,
      id = that.data.left_distance[index].id,
      item_left = that.data.left_distance[index].left,
      item_width = that.data.left_distance[index].width,
      scrollWidth = that.data.scrollWidth;
    let distance = item_left - (scrollWidth / 2 - item_width / 2);

    that.setData({
      currentTab: index,
      shop_classify_id: id,
      scroll_left: distance
    })
  },

  toVip: function() {
    wx.navigateTo({
      url: '/pages/we/vip_club/open_vip/open_vip',
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({

      imgSrc: getApp().imgSrc

    });

    let that = this;
    // 获取vip卡
    app.user.vipCardList().then((res) => {
      let cardList = res.list;
      for (let i in cardList) {
        if (cardList[i].vipCardCode == 'M302') {
          that.setData({
            cardPrice: cardList[i].vipCardPrice
          });
        }
      }
    });

    app.showLoading().then(() => {
      // 获取会员权益
      let obj = {
        memberGradeCode: app.globalData.userInfo.memberGradeCode
      }
      return app.user.privilegeList(obj)
    }).then((res) => {
      that.setData({
        privilegeList: res.privilegeList,
        currentTab: options.current ? options.current : 0
      })
      return Promise.resolve();
    }).then(() => {
      util.hideLoading();
      that.getDom();
    })
  },

  getDom: function() {
    let that = this,
      left_distance = [];
    util.getDom('.vip-tab-list').then((rect) => {
      rect.forEach((item) => {
        left_distance.push(item)
      })
      return Promise.resolve();
    }).then((rect) => {
      util.getDom('.vip-tab').then((rect) => {
        that.setData({
          scrollWidth: rect[0].width,
          left_distance: left_distance
        })
        console.log(left_distance, that.data.currentTab);
        let id = left_distance[that.data.currentTab].id,
          item_left = left_distance[that.data.currentTab].left,
          item_width = left_distance[that.data.currentTab].width,
          scrollWidth = rect[0].width;
        let distance = item_left - (scrollWidth / 2 - item_width / 2);

        that.setData({
          shop_classify_id: id,
          scroll_left: distance
        })
      })
      return Promise.resolve();
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  //滑动切换tab 
  bindChange: function(e) {
    var that = this,
      index = e.detail.current,
      id = that.data.left_distance[index].id,
      item_left = that.data.left_distance[index].left,
      item_width = that.data.left_distance[index].width,
      scrollWidth = that.data.scrollWidth;
    let distance = item_left - (scrollWidth / 2 - item_width / 2);
    that.setData({
      currentTab: index,
      shop_classify_id: id,
      scroll_left: distance
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})