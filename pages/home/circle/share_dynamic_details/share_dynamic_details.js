// pages/home/circle/share_dynamic_details/share_dynamic_details.js
let util = require('../../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: {},
    goods_data: {},
    price: [],
    shopState: true,
    navHeight: ''
  },

  // 打开当前页面路径中的参数
  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSrc: getApp().imgSrc,
      navHeight: app.navHeight
    });

    console.log(options);
    let that = this;
    that.pageQuery = options;

    app.showLoading()
      .then(() => {
        // 保存浏览记录
        let params = {
          footId: that.pageQuery.shareid,
          type: 2
        }
        return app.user.saveGoodsVisitRecord(params);
      })
      .then((res) => {
        console.log(res);
        return Promise.resolve();
      })
      .catch(() => {
        return Promise.resolve();
      })
      .then(() => {
        // 保存分享记录
        let params = {
          shareId: shareid,
          type: 2,
          url: that.pageQuery.path
        }
        return app.user.share(params);
      })
      .then((res) => {
        console.log(res);
        return Promise.resolve();
      })
      .catch(() => {
        return Promise.resolve();
      })
      .then(() => {
        let params = {
          shareId: that.pageQuery.shareid,
          type: 2,
          shareUserId: that.pageQuery.shareUserId
        }
        return app.user.getIntegralByShare(params)
      })
      .then((data) => {
        console.log(data);
        return Promise.resolve()
      })
      .then(() => {
        // 好物详情
        let params = {
          thingId: that.pageQuery.shareid
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
      .catch(() => {
        return Promise.resolve();
      })
      .then(() => {
        // 商品详情
        let obj = {
          goodsId: that.data.content.goodsId
        };
        return app.goods.detail(obj);
      })
      .then((data) => {
        console.log('商品详情', data);

        // 获取选中的价格
        let Spec = data.goodsSpecList.filter((item, index, arr) => item.isDefault == 1);
        console.log(Spec);
        that.setData({
          goods_data: data,
          price: Spec
        });
        return Promise.resolve();
      })
      .catch(() => {
        that.setData({
          shopState: false
        })
        return Promise.resolve();
      })
      .then(app.hideLoading)
  },

  // 跳转首页
  home: function () {
    wx.switchTab({
      url: '/pages/home/index/index'
    })
  },

  // 预览图片
  preview: function (event) {
    console.log(event.currentTarget.dataset.index)
    let index = event.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.bannerList[index],
      urls: this.data.bannerList
    })
  },

  // 跳转商品详情
  goods_detail(event) {
    let id = event.currentTarget.id;
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id
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
        path: '/pages/home/circle/share_dynamic_details/share_dynamic_details?shareid=' + that.data.content.id + '&path=' + '/pages/home/circle/share_dynamic_details/share_dynamic_details',
        imageUrl: that.data.content.imgList[0],
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