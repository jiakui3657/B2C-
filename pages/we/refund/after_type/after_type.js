// pages/we/after_type/after_type.js
let app = getApp();
let util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalFlag: false,
    modalList: [],
    modalIndex: 0,
    salesFlag: false,
    salesList: [],
    salesIndex: 0,
    salesNumber: '',
    goods: {}
  },

  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    console.log(options);

    that.pageQuery = options;
    that.pageQuery.goods = JSON.parse(that.pageQuery.goods);

    this.setData({
      imgSrc: getApp().imgSrc,
      goods: that.pageQuery.goods,
      finish: that.pageQuery.finish,
      salesNumber: that.pageQuery.goods.goodsNum - that.pageQuery.goods.backwardNum
    });

    app.showLoading()
      .then(that.goodsReason())
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 获取退货的理由
  goodsReason: function(event) {
    let that = this;
    app.refund.refundReasonList()
      .then((data) => {
        that.setData({
          salesList: data.list,
          // modalList: data.list
        })
        return Promise.resolve();
      })
  },

  // 数量-
  minus: function() {
    if (this.data.salesNumber > 1) {
      this.setData({
        salesNumber: this.data.salesNumber - 1
      })
    }
  },

  // 数量+
  add: function() {
    if (this.data.salesNumber < this.data.goods.goodsNum - this.data.goods.backwardNum) {
      this.setData({
        salesNumber: this.data.salesNumber + 1
      })
    }
  },

  // 输入要退的数量
  // inputRefundNum: function(e) {
  //   let num = e.detail.value;
  //   if (num = '') {
  //     num == 0
  //   }
  //   if (num > this.data.goods.goodsNum) {
  //     num = this.data.goods.goodsNum;
  //   }

  //   this.setData({
  //     salesNumber: num
  //   });
  // },

  // 退款
  refund: function() {
    let that = this
    // wx.showModal({
    //   title: '提示',
    //   content: '退货后不满足包邮条件，默认全单退货，是否继续？',
    //   cancelColor: '#101010',
    //   confirmColor: '#FF474C',
    //   success(res) {
    //     if (res.confirm) {
    //     } else if (res.cancel) {
    //       console.log('用户点击取消')
    //     }
    //   }
    // })
    that.setData({
      salesFlag: !that.data.salesFlag
    })
  },

  // 退货
  sales: function() {
    this.setData({
      salesFlag: !this.data.salesFlag
    })
  },

  // 确定退货原因
  salesConfirm: function() {
    let index = this.data.salesIndex
    let reason = this.data.salesList[index];
    this.setData({
      salesFlag: !this.data.salesFlag
    })
    this.data.goods.applyNum = this.data.salesNumber;
    if (this.pageQuery.finish == 1) { // 已完成的订单
      wx.navigateTo({
        url: '../after_sales_details/after_sales_details?reason=' + JSON.stringify(reason) + '&modalIndex=' + this.data.salesIndex + '&goods=' + JSON.stringify(this.data.goods)
      })
    } else { // 未发货的订单
      let params = {
        orderNo: this.data.goods.orderNo,
        goodsNum: this.data.salesNumber,
        refundReasonCode: reason.code,
        refundType: 1,
        orderItemId: this.data.goods.id
      };
      this.applyRefundMoney(params);
    }
  },

  // 选择退货原因
  salesReason: function(e) {
    this.setData({
      salesIndex: e.currentTarget.id
    })
  },

  // 提交仅退款售后申请
  applyRefundMoney: function(params) {
    let that = this;
    app.showLoading()
      .then(() => {
        return app.refund.refundApply(params)
      }).then(() => {
        app.hideLoading();
        app.showToast({
          title: '提交成功',
          icon: 'success'
        });
        setTimeout(function() {
          if (that.pageQuery.from == 'refund') { // 从售后列表进来的
            util.getPreviousPage(1).applySuccess();
          } else { // 从待发货列表进来的
            util.getPreviousPage(1).allpyRefundMoneySuccess();
          }
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      }).catch(() => {
        app.hideLoading();
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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