// pages/we/credits_exchange/index/index.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
  * 页面的初始数据
  */
  data: {
    tabList: [
      {
        id: 0,
        text: 'VIP会员专属兑换'
      },
      {
        id: 1,
        text: '会员超值兑好物'
      }
    ],
    tabIndex: 0,
    modalFlag: false,
    // tab切换  
    currentTab: 0,
    vipGoodsList: {},
    normalGoodsList: {},
    userInfo: '',
    integral: '',
    goods_num: 1,
    goods_index: 0
  },

  // 打开当前页面路径中的参数
  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);

    this.pageQuery = options;

    this.setData({
      imgSrc: getApp().imgSrc,
      currentTab: this.pageQuery.tabIndex || 0
    });

    let that = this;
    // 初始化用户信息
    that.getUserInfo();
    console.log(that.data.currentTab, JSON.stringify(that.data.vipGoodsList) == '{}')
    if (that.data.currentTab == 0 && JSON.stringify(that.data.vipGoodsList) == '{}') {
      app.showLoading()
        .then(() => {
          that.integralGoodsList('M103', 'vipGoodsList', 1);
        })
        .finally(app.hideLoading);
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.normalGoodsList) == '{}')
    {
      app.showLoading()
        .then(() => {
          that.integralGoodsList('M101', 'normalGoodsList', 1);
        })
        .finally(app.hideLoading);
    }
    // app.showLoading()
    // .then(()=>{
    //   that.integralGoodsList('M103', 'vipGoodsList', 1);
    // })
    // .then(() => {
    //   that.integralGoodsList('M101', 'normalGoodsList', 1);
    // })
    // .finally(app.hideLoading);
  },
  integralGoodsList: function (memberGradeCode, key, pageIndex) {
    let that = this;
    let params = {
      pageIndex: pageIndex || 1,
      pageSize: app.pageSize,
      memberGradeCode: memberGradeCode
    }
    return app.user.integralGoodsList(params)
    .then((data) => {
      data.list = util.cycle(data.list, that.data[key].list || []);
      that.setData({
        [key]: data
      });
      return Promise.resolve();
    })
    .finally(Promise.resolve());
  },

  // 初始化用户信息
  getUserInfo: function () {
    let that = this;
    app.refreshUserInfo().then(data => {
      that.setData({
        userInfo: data
      });
    });
  },

  // 触底加载更多兑换商品
  lower: function () {
    let that = this;
    if (that.data.currentTab == 0 && that.data.vipGoodsList.pageIndex < that.data.vipGoodsList.pageCount) {
      let pageIndex = that.data.vipGoodsList.pageIndex + 1;
      app.showLoading()
        .then(that.integralGoodsList('M103', 'vipGoodsList', pageIndex))
        .finally(app.hideLoading);
    } else if (that.data.currentTab == 1 && that.data.normalGoodsList.pageIndex < that.data.normalGoodsList.pageCount) {
      let pageIndex = that.data.normalGoodsList.pageIndex + 1;
      app.showLoading()
        .then(that.integralGoodsList('M101', 'normalGoodsList', pageIndex))
        .finally(app.hideLoading);
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
      console.log(e.target.dataset.current);
    }

    if (that.data.currentTab == 0 && JSON.stringify(that.data.vipGoodsList) == '{}') {
      app.showLoading()
        .then(() => {
          that.integralGoodsList('M103', 'vipGoodsList', 1);
        })
        .finally(app.hideLoading);
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.normalGoodsList) == '{}') {
      app.showLoading()
        .then(() => {
          that.integralGoodsList('M101', 'normalGoodsList', 1);
        })
        .finally(app.hideLoading);
    }
  },
  // 跳转明细
  detail: function () {
    wx.navigateTo({
      url: '../detail/detail'
    });
  },

  // 跳转开通会员
  open_vip: function () {
    wx.navigateTo({
      url: '/pages/we/vip_club/open_vip/open_vip'
    });
  },

  // table栏切换
  tabToggle: function (event) {
    console.log(event);
    this.setData({
      tabIndex: event.currentTarget.id
    });
  },

  // 确定兑换商品
  confirm: function () {
    let that = this, list = that.data.currentTab == 0 ? that.data.vipGoodsList.list[that.data.goods_index] : that.data.normalGoodsList.list[that.data.goods_index];
    console.log(list, that.data.goods_num);

    if (that.data.goods_num + list.exchangeNum > list.number) {
      app.showToast({title: '兑换数量不足'});
    } else if (that.data.goods_num * list.goodsIntegral > that.data.userInfo.integral) {
      app.showToast({ title: '积分不足' });
    } else {
      wx.navigateTo({
        url: '../change/change',
        success: function (res) {
          // 关闭弹框
          that.setData({
            modalFlag: false
          });

          // 通过eventChannel向被打开页面传送数据
          list.goods_number = that.data.goods_num;
          res.eventChannel.emit('acceptDataFromOpenerPage', { data: list });
        }
      })
    }
  },

  // 选择兑换数量
  cancel: function (event) {
    let index = event.currentTarget.dataset.index, integral = null;
    console.log(this.data.vipGoodsList.list);
    if (this.data.currentTab == 0) {
      integral = this.data.vipGoodsList.list[index].goodsIntegral;
    } else {
      integral = this.data.normalGoodsList.list[index].goodsIntegral;
    }
    this.setData({
      integral: integral,
      goods_num: 1,
      goods_index: index,
      modalFlag: !this.data.modalFlag
    });
  },

  // 数量加
  add: function () {
    if (this.data.currentTab == 0) {
      this.data.goods_num = util.add(this.data.goods_num, 1);
      this.data.integral = util.mul(this.data.goods_num, this.data.vipGoodsList.list[this.data.goods_index].goodsIntegral);
    } else {
      this.data.goods_num = util.add(this.data.goods_num, 1);
      this.data.integral = util.mul(this.data.goods_num, this.data.normalGoodsList.list[this.data.goods_index].goodsIntegral);
    }
    this.setData({
      goods_num: this.data.goods_num,
      integral: this.data.integral
    });
  },

  // 数量减
  reduction: function () {
    if (this.data.goods_num > 1) {
      if (this.data.currentTab == 0) {
        this.data.goods_num = util.sub(this.data.goods_num, 1);
        this.data.integral = util.mul(this.data.goods_num, this.data.vipGoodsList.list[this.data.goods_index].goodsIntegral);
      } else {
        this.data.goods_num = util.sub(this.data.goods_num, 1);
        this.data.integral = util.mul(this.data.goods_num, this.data.normalGoodsList.list[this.data.goods_index].goodsIntegral);
      }
      this.setData({
        goods_num: this.data.goods_num,
        integral: this.data.integral
      });
    }
  },

  // 自定义数字
  get_number: function (event) {
    let value = event.detail.value > 0 ? event.detail.value : 1;
    this.data.goods_num = value;
    this.data.integral = util.mul(this.data.goods_num, this.data.currentTab == 0 ? this.data.vipGoodsList.list[this.data.goods_index].goodsIntegral : this.data.normalGoodsList.list[this.data.goods_index].goodsIntegral);
    this.setData({
      goods_num: this.data.goods_num,
      integral: this.data.integral
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  //滑动切换tab 
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
    if (that.data.currentTab == 0 && JSON.stringify(that.data.vipGoodsList) == '{}') {
      app.showLoading()
        .then(() => {
          that.integralGoodsList('M103', 'vipGoodsList', 1);
        })
        .finally(app.hideLoading);
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.normalGoodsList) == '{}') {
      app.showLoading()
        .then(() => {
          that.integralGoodsList('M101', 'normalGoodsList', 1);
        })
        .finally(app.hideLoading);
    }
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