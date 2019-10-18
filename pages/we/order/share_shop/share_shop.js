// pages/we/share_shop/share_shop.js
let app = getApp();
var util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopImg: [],
    order_note: {},
    images: '',
    shareImages:[],
    note: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSrc: getApp().imgSrc
    });
    
    let that = this;
    let eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      console.log(data);
      that.setData({
        order_note: data.data
      })
    })
  },

  // 获取图片
  get_image: function () {
    let that = this, count = 9 - that.data.shopImg.length;
    wx.chooseImage({
      count: count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res);
        var promiseList = res.tempFilePaths.map((item, index) => {
          return new Promise(function (resolve, reject) {
            console.log(item);
            wx.uploadFile({
              url: app.apiUrl + '/other/imgUpload?site=1',
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
  del: function (event) {
    console.log(event);
    let index = event.currentTarget.dataset.index;
    this.data.shopImg.splice(index, 1);
    this.setData({
      shopImg: this.data.shopImg
    })
  },

  // 获取分享内容
  get_note: function (event) {
    console.log(event);
    this.setData({
      note: event.detail.value
    })
  },

  // 发布分享
  share: function () {
    let that = this, images = null;
    app.showLoading()
      .then(() => {

        if (that.data.note != '') {
          console.log(that.data.note != '', that.data.note);
          images = that.data.shareImages;
          return Promise.resolve();
        } else {
          console.log(that.data.note != '', that.data.note);
          return Promise.reject();
        }
      })
      .then(() => {
        let obj = {
          orderNo: that.data.order_note.orderNo,
          images: images,
          goodsId: that.data.order_note.goodsId,
          content: that.data.note,
        }
        return app.order.orderShare(obj);
      }).then((res) => {
        console.log(res);
        app.showToast({ title: '分享成功', icon: 'success'});
        return Promise.resolve();
      })
      .then(() => {
        setTimeout(() => {
          wx.redirectTo({
            url: '/pages/we/order/order_complete/order_complete?id=' + that.data.order_note.orderNo
          })
        }, 2000)
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch((res) => {
        app.showToast({title: '请输入分享内容'});
      })
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