// pages/we/logistics/logistics.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: [
      {
        src: 'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png',
        name: '阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装',
        abstract: '品质优选 值得选购',
        price: '105',
        original_price: '245',
        vip_price: '30',
        code: 0
      },
      {
        src: 'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png',
        name: '阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装',
        abstract: '品质优选 值得选购',
        price: '120',
        original_price: '200',
        vip_price: '60',
        code: 1
      },
      {
        src: 'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png',
        name: '阿瓦提长绒棉毛巾  5条装装阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装',
        abstract: '品质优选 值得选购',
        price: '324',
        original_price: '450',
        vip_price: '300',
        code: 2
      },
      {
        src: 'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png',
        name: '阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装',
        abstract: '品质优选 值得选购',
        price: '524',
        original_price: '624',
        vip_price: '286',
        code: 2
      },
      {
        src: 'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png',
        name: '阿瓦提长绒棉毛巾  5条装阿瓦提长绒棉毛巾  5条装',
        abstract: '品质优选 值得选购',
        price: '1000',
        original_price: '582',
        vip_price: '389',
        code: 1
      },
      {
        src: 'https://b2ctest.huala.com/res/app/consumer/images/test/商品.png',
        name: '阿瓦提长绒棉毛巾  5条装',
        abstract: '品质优选 值得选购',
        price: '100',
        original_price: '58',
        vip_price: '30',
        code: '0'
      }
    ],
    logistics: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
	this.setData({
		imgSrc: getApp().imgSrc
	});
    let that = this, obj = {};
    const eventChannel = this.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataFromOpenerPage', function (data) {
      console.log(data);
      obj = data.data;
    })

    app.showLoading()
      .then(() => {
        let params = obj
        return app.order.orderLogistics(params, true);
      })
      .then((res) => {
        console.log(res);

        // 反转物流信息
        res.traces = res.traces.reverse();

        that.setData({
          logistics: res
        })
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
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