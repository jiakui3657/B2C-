// pages/home/circle/index/index.js
let util = require('../../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    currentTab: 0,
    thingList: {
      all: {},
      vip: {},
      news: {},
      share: {},
      shop: {}
    },
    thingTypeList: []
  },

  //点击tab切换
  swichNav: function(e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      });
      console.log(e.target.dataset.current);
    }
  },

  // 跳转商品动态详情
  // dynamic_details: function (event) {
  //   console.log(event);
  //   wx.navigateTo({
  //     url: '/pages/home/circle/dynamic_details/dynamic_details'
  //   })
  // },

  // 跳转商家动态详情
  // store_details: function () {
  //   wx.navigateTo({
  //     url: '/pages/home/circle/store_details/store_details'
  //   })
  // },

  // 分享商品详情
  // share_dynamic_details: function () {
  //   wx.navigateTo({
  //     url: '/pages/home/circle/share_dynamic_details/share_dynamic_details'
  //   })
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this;
    app.thing.thingTypeList()
      .then((res) => {
        that.setData({
          thingTypeList: res.list
        });
        return Promise.resolve();
      })
      .then(() => {
        // 好物列表 === 全部
        that.loadThings('', 'thingList.all');
      })
  },

  loadThings: function(typeCode, listStr, pageIndex = 1) {
    let that = this;
    app.showLoading()
      .then(() => {
        let params = {
          typeCode: typeCode,
          pageIndex: pageIndex,
          pageSize: app.pageSize
        }
        return app.thing.thingList(params)
      })
      .then((res) => {
        // 截取富文本中的文字和图片
        res.list.forEach((items, index) => {
          let arr = [],
            imgList = [];
          imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
          console.log(imgList);
          imgList.forEach((item) => {
            console.log(item);
            var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
            console.log(src[1]);
            arr.push(src[1]);
            console.log(arr);
          })
          items.imgList = items.imgList.concat(arr);
          console.log(items.imgList);

          items.content = items.content.replace(/<[^>]*>|/g, "");
        })
        that.setData({
          [listStr]: res
        });
        return Promise.resolve();
      }).then(app.hideLoading)
      .catch((res) => {
        app.hideLoading();
      });
  },

  // 好物分类
  goodsClass: function() {
    let that = this;
    return app.thing.thingTypeList()
      .then((data) => {
        that.setData({
          thingTypeList: data.list
        });
        return Promise.resolve();
      })
      .catch((e) => {
        console.error("加载推荐商户出错", e);
        return Promise.resolve();
      });
    return Promise.resolve();
  },

  // 好物列表
  goodsList: function(typeCode, pageIndex, list) {
    let that = this;
    let params = {
      typeCode: typeCode,
      pageIndex: pageIndex,
      pageSize: app.pageSize
    }
    return app.thing.thingList(params)
      .then((data) => {
        console.log(data, list);
        that.setData({
          [list]: data
        });
        console.log(that.data.thingList);
      })
      .catch((e) => {
        console.error("加载推荐商户出错", e);
      });
    return Promise.resolve();
  },

  // 点赞
  praise: function(event) {
    console.log(event);
    let that = this;
    if (event.currentTarget.dataset.isprised == 1) {
      app.showLoading()
        .then(that.praiseThing(event.currentTarget.dataset.id, 2, event.currentTarget.dataset.item, event.currentTarget.dataset.prisenum))
        .then(app.hideLoading)
    } else {
      app.showLoading()
        .then(that.praiseThing(event.currentTarget.dataset.id, 1, event.currentTarget.dataset.item, event.currentTarget.dataset.prisenum))
        .then(app.hideLoading)
    }
  },

  // 点赞/取消点赞
  praiseThing: function(thingId, type, item, num) {
    console.log(thingId, type, item, num);
    let that = this;
    let params = {
      thingId: thingId,
      type: type
    }
    return app.thing.praiseThing(params)
      .then((data) => {
        let isPrised = item + 'isPrised';
        let priseNum = item + 'priseNum';
        if (type == 1) {

          that.setData({
            [isPrised]: 1,
            [priseNum]: num + 1
          })
          app.showToast({
            title: '点赞成功',
            icon: 'success'
          });
        } else {
          that.setData({
            [isPrised]: 0,
            [priseNum]: num - 1
          })
          app.showToast({
            title: '取消点赞成功',
            icon: 'success'
          });
        }
        return Promise.resolve();
      })
      .catch((e) => {
        console.error("点赞/取消点赞失败", e);
        return Promise.resolve();
      });
  },

  // 触底加载
  lower: function() {
    let that = this;
    if (that.data.currentTab == 0 && that.data.thingList.all.pageIndex < that.data.thingList.all.pageCount) {
      let pageIndex = that.data.thingList.all.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 好物列表 === 全部
          let params = {
            typeCode: '',
            pageIndex: pageIndex,
            pageSize: app.pageSize
          }
          return app.thing.thingList(params)
        })
        .then((res) => {
          // 截取富文本中的文字和图片
          res.list.forEach((items, index) => {
            let arr = [],
              imgList = [];
            imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
            console.log(imgList);
            imgList.forEach((item) => {
              console.log(item);
              var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
              console.log(src[1]);
              arr.push(src[1]);
              console.log(arr);
            })
            items.imgList = items.imgList.concat(arr);
            console.log(items.imgList);

            items.content = items.content.replace(/<[^>]*>|/g, "");
          })

          let list = util.cycle(res.list, that.data.thingList.all.list);

          let item = 'thingList.all.list';
          let index = 'thingList.all.pageIndex'
          that.setData({
            [item]: list,
            [index]: pageIndex
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
    } else if (that.data.currentTab == 1 && that.data.thingList.vip.pageIndex < that.data.thingList.vip.pageCount) {
      let pageIndex = that.data.thingList.vip.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 好物列表 === VIP会员
          let params = {
            typeCode: that.data.thingTypeList[0].code,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          }
          return app.thing.thingList(params)
        })
        .then((res) => {
          // 截取富文本中的文字和图片
          res.list.forEach((items, index) => {
            let arr = [],
              imgList = [];
            imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
            console.log(imgList);
            imgList.forEach((item) => {
              console.log(item);
              var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
              console.log(src[1]);
              arr.push(src[1]);
              console.log(arr);
            })
            items.imgList = items.imgList.concat(arr);
            console.log(items.imgList);

            items.content = items.content.replace(/<[^>]*>|/g, "");
          })

          let list = util.cycle(res.list, that.data.thingList.vip.list);
          let item = 'thingList.vip.list';
          let index = 'thingList.vip.pageIndex'
          that.setData({
            [item]: list,
            [index]: pageIndex
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
    } else if (that.data.currentTab == 2 && that.data.thingList.news.pageIndex < that.data.thingList.news.pageCount) {
      let pageIndex = that.data.thingList.news.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 好物列表 === 上新
          let params = {
            typeCode: that.data.thingTypeList[1].code,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          }
          return app.thing.thingList(params)
        })
        .then((res) => {
          // 截取富文本中的文字和图片
          res.list.forEach((items, index) => {
            let arr = [],
              imgList = [];
            imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
            console.log(imgList);
            imgList.forEach((item) => {
              console.log(item);
              var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
              console.log(src[1]);
              arr.push(src[1]);
              console.log(arr);
            })
            items.imgList = items.imgList.concat(arr);
            console.log(items.imgList);

            items.content = items.content.replace(/<[^>]*>|/g, "");
          })

          let list = util.cycle(res.list, that.data.thingList.news.list);
          let item = 'thingList.news.list';
          let index = 'thingList.news.pageIndex'
          that.setData({
            [item]: list,
            [index]: pageIndex
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
    } else if (that.data.currentTab == 3 && that.data.thingList.share.pageIndex < that.data.thingList.share.pageCount) {
      let pageIndex = that.data.thingList.share.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 好物列表 === 晒单
          let params = {
            typeCode: that.data.thingTypeList[2].code,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          }
          return app.thing.thingList(params)
        })
        .then((res) => {
          // 截取富文本中的文字和图片
          res.list.forEach((items, index) => {
            let arr = [],
              imgList = [];
            imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
            console.log(imgList);
            imgList.forEach((item) => {
              console.log(item);
              var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
              console.log(src[1]);
              arr.push(src[1]);
              console.log(arr);
            })
            items.imgList = items.imgList.concat(arr);
            console.log(items.imgList);

            items.content = items.content.replace(/<[^>]*>|/g, "");
          })

          let list = util.cycle(res.list, that.data.thingList.share.list);
          let item = 'thingList.share.list';
          let index = 'thingList.share.pageIndex';
          that.setData({
            [item]: list,
            [index]: pageIndex
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
    } else if (that.data.currentTab == 4 && that.data.thingList.shop.pageIndex < that.data.thingList.shop.pageCount) {
      let pageIndex = that.data.thingList.shop.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 好物列表 === 好店
          let params = {
            typeCode: that.data.thingTypeList[3].code,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          }
          return app.thing.thingList(params)
        })
        .then((res) => {
          // 截取富文本中的文字和图片
          res.list.forEach((items, index) => {
            let arr = [],
              imgList = [];
            imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
            console.log(imgList);
            imgList.forEach((item) => {
              console.log(item);
              var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
              console.log(src[1]);
              arr.push(src[1]);
              console.log(arr);
            })
            items.imgList = items.imgList.concat(arr);
            console.log(items.imgList);

            items.content = items.content.replace(/<[^>]*>|/g, "");
          })

          let list = util.cycle(res.list, that.data.thingList.shop.list);
          let item = 'thingList.shop.list';
          let index = 'thingList.shop.pageIndex'
          that.setData({
            [item]: list,
            [index]: pageIndex
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
    }
  },

  // 跳转详情
  dynamic_details: function(event) {
    console.log(event);
    let thingTypeCode = event.currentTarget.dataset.thingtypecode,
      id = event.currentTarget.dataset.id;
    if (thingTypeCode == 'T104') {
      wx.navigateTo({
        url: '/pages/home/circle/store_details/store_details?id=' + id
      })
    } else {
      wx.navigateTo({
        url: '/pages/home/circle/dynamic_details/dynamic_details?id=' + id
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    var query = wx.createSelectorQuery().in(this);
    query.select('.order_Content').boundingClientRect();
    query.exec(res => {
      var searchHeight = res[0].height;
      var windowHeight = wx.getSystemInfoSync().windowHeight;
      var scrollHeight = windowHeight - searchHeight;
      this.setData({
        scrollHeight: scrollHeight
      });
    });
  },

  //滑动切换tab 
  bindChange: function(e) {
    var that = this;
    let currentTab = e.detail.current;
    that.setData({
      currentTab: currentTab
    });

    let typeCode;
    let listStr;
    let thingList = this.data.thingList;
    if (currentTab == 0 && (thingList.all.list == undefined || thingList.all.list.length == 0)){
      typeCode = '';
      listStr = 'thingList.all';
      this.loadThings(typeCode, listStr);
    } else if (currentTab == 1 && (thingList.vip.list == undefined || thingList.vip.list.length == 0)) {
      typeCode = that.data.thingTypeList[0].code
      listStr = 'thingList.vip';
      this.loadThings(typeCode, listStr);
    } else if (currentTab == 2 && (thingList.news.list == undefined || thingList.news.list.length == 0)) {
      typeCode = that.data.thingTypeList[1].code
      listStr = 'thingList.news';
      this.loadThings(typeCode, listStr);
    } else if (currentTab == 3 && (thingList.share.list == undefined || thingList.share.list.length == 0)) {
      typeCode = that.data.thingTypeList[2].code
      listStr = 'thingList.share';
      this.loadThings(typeCode, listStr);
    } else if (currentTab == 4 && (thingList.shop.list == undefined || thingList.shop.list.length == 0)) {
      typeCode = that.data.thingTypeList[3].code
      listStr = 'thingList.shop';
      this.loadThings(typeCode, listStr);
    }

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
  onShareAppMessage: function(res) {
    console.log(res);
    let that = this;
    if (res.from == 'button' && res.target.dataset.type == 'T104') {
      return {
        title: res.target.dataset.title,
        path: '/pages/home/circle/share_store_details/share_store_details?shareid=' + res.target.dataset.shareid + '&path=' + '/pages/home/circle/awarded/share_dynamic_details/share_dynamic_details&shareUserId=' + app.globalData.userInfo.userId,
        imageUrl: res.target.dataset.src,
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    } else {
      return {
        title: res.target.dataset.title,
        path: '/pages/home/circle/share_dynamic_details/share_dynamic_details?shareid=' + res.target.dataset.shareid + '&path=' + '/pages/home/circle/share_dynamic_details/share_dynamic_details&shareUserId=' + app.globalData.userInfo.userId,
        imageUrl: res.target.dataset.src,
        success: function(res) {
          // 转发成功
        },
        fail: function(res) {
          // 转发失败
        }
      }
    }
  }
})