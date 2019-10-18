// pages/home/circle/store_details/store_details.js
let util = require('../../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: {},
    shop_data: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    console.log(options);
    let that = this;
    app.showLoading()
      .then(() => {
        // 保存浏览记录
        let params = {
          footId: options.id,
          type: 2
        }
        return app.user.saveGoodsVisitRecord(params);
      })
      .then((res) => {
        console.log(res);
        return Promise.resolve();
      })
      .then(() => {
        // 好物详情
        let params = {
          thingId: options.id
        }
        return app.thing.thingDetail(params);
      })
      .then((res) => {
        console.log(res);

        let reg = new RegExp('^<([^>\s]+)[^>]*>(.*?<\/\\1>)?$');

        // 初始化css
        res.content = res.content.replace(/\<img/gi, '<img class="image"');
        res.content = res.content.replace(/\<p/gi, '<p class="text"');
        res.content = res.content.replace(/\<span/gi, '<span class="span"');
        res.content = res.content.replace(/\<br>/gi, '');

        res.rich = reg.test(res.content);

        console.log(res.content);

        that.setData({
          content: res
        })
        return Promise.resolve();
      })
      .then(() => {
        // 商家详情
        console.log(that.data.content);
        let obj = {
          shopId: that.data.content.shopId,
          longitude: app.longitude,
          latitude: app.latitude
        };
        return app.shop.detail(obj);
      })
      .then((data) => {
        console.log('店铺详情', data);

        // 换算商家距离自己的距离的单位 data.distance >= 1000 ? km : m
        if (data.distance >= 1000) {
          let num = parseFloat(data.distance) / 1000;
          data.modifyDistance = num.toFixed(2);
        }

        that.setData({
          shop_data: data
        });
        return Promise.resolve();
      })
      .then(app.hideLoading)
  },

  // 进入商家详情
  shop: function () {
    let index = event.currentTarget.dataset.index;
    let data = {
      id: this.data.content.shopId,
      logisticsList: this.data.logisticsList
    };
    wx.navigateTo({
      url: '/pages/near/shop/shop',
      success: function (res) {
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: data });
      }
    });
  },

  // 点赞
  praise: function (event) {
    console.log(event);
    let that = this;
    if (that.data.content.isPrised == 1) {
      app.showLoading()
        .then(that.praiseThing(2))
        .then(app.hideLoading)
    } else {
      app.showLoading()
        .then(that.praiseThing(1))
        .then(app.hideLoading)
    }
  },

  // 点赞/取消点赞
  praiseThing: function (type) {
    console.log(type);
    let that = this;
    let params = {
      thingId: that.data.content.id,
      type: type
    }
    return app.thing.praiseThing(params)
      .then((data) => {
        let isPrised = 'content.isPrised';
        let priseNum = 'content.priseNum';
        if (type == 1) {
          that.setData({
            [isPrised]: 1,
            [priseNum]: that.data.content.priseNum + 1
          })
          app.showToast({ title: '点赞成功', icon: 'success' });
        } else {
          that.setData({
            [isPrised]: 0,
            [priseNum]: that.data.content.priseNum - 1
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

  // 收藏
  collect: function () {
    let that = this;
    let params = {
      id: that.data.content.id,
      type: 2
    }
    if (that.data.content.isCollected == 1) {
      app.showLoading()
        .then(() => {
          return app.user.addCollection(params)
        })
        .then((data) => {
          let isCollected = 'content.isCollected';
          let collectionNum = 'content.collectionNum';
          that.setData({
            [collectionNum]: that.data.content.collectionNum - 1,
            [isCollected]: 0
          })
          app.showToast({ title: '取消收藏成功', icon: 'success' });
          return Promise.resolve();
        })
        .then(app.hideLoading)
        .catch(app.hideLoading)
    } else {
      app.showLoading()
        .then(() => {
          return app.user.addCollection(params)
        })
        .then((data) => {
          let isCollected = 'content.isCollected';
          let collectionNum = 'content.collectionNum';
          that.setData({
            [collectionNum]: that.data.content.collectionNum + 1,
            [isCollected]: 1
          })
          app.showToast({ title: '收藏成功', icon: 'success' });
          return Promise.resolve();
        })
        .then(app.hideLoading)
        .catch(app.hideLoading)
    }
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
  onShareAppMessage: function (res) {
    let that = this;
    if (res.from == 'button') {
      return {
        title: that.data.content.title,
        path: '/pages/home/circle/share_store_details/share_store_details?shareid=' + that.data.content.id + '&path=' + '/pages/home/circle/share_store_details/share_store_details&shareUserId=' + app.globalData.userInfo.userId,
        imageUrl: that.data.shop_data.logo,
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