// pages/we/after_sales_details/after_sales_details.js
let app = getApp();
var util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalFlag: false,
    modalList: [],
    modalIndex: 0,
    why: '',
    goods: {},
    inputCount: 0,
    inputValue: '',
    startNunber: 0,
    shopImg: [],
    shareImages: [],
    reason: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;

    this.setData({
      imgSrc: getApp().imgSrc
    });

    this.setData({
      reason: JSON.parse(options.reason),
      modalIndex: options.modalIndex,
      goods: JSON.parse(options.goods)
    })

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
          modalList: data.list
        })
        return Promise.resolve();
      })
  },

  // 获取图片
  get_image: function() {
    let that = this,
      count = 6 - that.data.shopImg.length;
    wx.chooseImage({
      count: count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res);
        var promiseList = res.tempFilePaths.map((item, index) => {
          return new Promise(function(resolve, reject) {
            console.log(item);
            wx.uploadFile({
              url: app.apiUrl + '/other/imgUpload?site=3',
              filePath: item,
              name: 'file',
              success(res) {
                console.log(res)
                var data = JSON.parse(res.data);
                resolve(data);
              }
            })
          })
        })
        Promise.all(promiseList).then((res) => {
          console.log(res);
          res.forEach((item) => {
            that.data.shopImg.push(item.data.imgUrl + '/' + item.data.imgName);
            that.data.shareImages.push(item.data.imgName);
          })
          that.setData({
            shopImg: that.data.shopImg,
            shareImages: that.data.shareImages
          })
        }).catch((error) => {
          console.log(error);
        })
      }
    })
  },

  // 删除图片
  del: function(event) {
    console.log(event);
    let index = event.currentTarget.dataset.index;
    this.data.shopImg.splice(index, 1);
    this.data.shareImages.splice(index, 1);
    this.setData({
      shopImg: this.data.shopImg,
      shareImages: this.data.shareImages
    })
  },

  cancel: function() {
    this.setData({
      modalFlag: !this.data.modalFlag
    })
  },

  // 选择退款原因
  reason: function(e) {
    console.log(e.currentTarget.id)
    this.setData({
      modalIndex: e.currentTarget.id
    })
  },

  // 确定退款原因
  confirm: function() {
    let index = this.data.modalIndex
    let sales = this.data.modalList[index]
    this.setData({
      reason: sales,
      modalFlag: !this.data.modalFlag
    })
  },

  get_describe: function(e) {
    this.data.inputValue = e.detail.value;
    this.setData({
      inputCount: e.detail.cursor
    })
  },

  // 提交售后申请
  commit: function() {
    if (this.data.inputValue == '') {
      app.showToast({
        title: '请填写具体原因'
      });
      return;
    }

    app.showLoading()
      .then(() => {
        let obj = {
          orderNo: this.data.goods.orderNo,
          goodsNum: this.data.goods.applyNum,
          refundReasonCode: this.data.reason.code,
          refundReasonDetail: this.data.inputValue,
          images: this.data.shareImages,
          refundType: 2,
          orderItemId: this.data.goods.id
        };

        return app.refund.refundApply(obj)
      }).then(() => {
        app.hideLoading();
        app.showToast({
          title: '提交成功',
          icon: 'success'
        });

        setTimeout(function() {
          util.getPreviousPage(2).applySuccess();
          wx.navigateBack({
            delta: 2
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