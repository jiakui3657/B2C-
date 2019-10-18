// pages/near/index/index.js
let util = require('../../../utils/util.js');
let app = getApp();
let loadBtn = true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop_classify_list: [],
    shop_classify_index: 0,
    scrollWidth: 0,
    left_distance: [],
    scrollTop: 0
  },

  // 跳转商铺详情
  shop: function(event) {
    let index = event.currentTarget.dataset.index;
    wx.navigateTo({
      url: '/pages/near/shop/shop?id=' + event.currentTarget.id
    });
  },

  scroll: function(event) {
    // console.log(event)
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },

  // refresh: function (event) {
  //   console.log(event)
  //   wx.startPullDownRefresh()
  //   this.onLoad();
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      imgSrc: app.imgSrc
    });
    let that = this;
    that.setData({
      city: app.city
    })
    app.showLoading()
      .then(app.shop.getShopTypeList)
      .then((data) => {
        console.log(data);

        // 插入全部
        if (data.list.length > 1) {
          data.list.unshift({
            id: '',
            name: '全部'
          })
        }

        data.list.forEach((item) => {
          item.chlidrenList = {};
        });
        that.setData({
          shop_classify_list: data.list
        });
        console.log(data.list, that.data.shop_classify_list);
        return Promise.resolve();
      })
      .then(() => {
        let promises = [];

        // 全部
        that.loadNearShop('', 0);

        // 商家列表
        // that.data.shop_classify_list.forEach((item, index) => {
        //   if (index == 0) {
        //     return that.loadNearShop(item.id, index);
        //   } else {
        //     setTimeout(function() {
        //       that.loadNearShop(item.id, index);
        //     }, 1000 * index / 3);
        //   }
        // });
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading()
        that.onReady();
        wx.stopPullDownRefresh();
      });
  },
  loadNearShop: function(shopType, index) {
    let that = this;
    let params = {
      shopTypeId: shopType,
      longitude: app.longitude,
      latitude: app.latitude,
      pageIndex: 1,
      pageSize: app.pageSize
    };
    return app.shop.list(params)
      .then((shopList) => {
        console.log('附近店铺', shopList);
        let chlidren = 'shop_classify_list[' + index + '].chlidrenList';
        shopList.list.forEach((item) => {
          // 计算商家距离
          if (item.distance >= 1000) {
            let num = item.distance / 1000;
            item.distance = num.toFixed(1);
            item.distance = item.distance + 'km'
          } else {
            item.distance = item.distance + 'm';
          }
        });
        that.setData({
          [chlidren]: shopList
        });
        return Promise.resolve();
      });
  },
  
  // 商铺分类切换
  shop_classify_toggle: function(e) {
    let that = this;
    let index = e.currentTarget.dataset.index,
      id = that.data.left_distance[index].id,
      item_left = that.data.left_distance[index].left,
      item_width = that.data.left_distance[index].width,
      scrollWidth = that.data.scrollWidth;
    // 更新商铺列表
    let distance = item_left - (scrollWidth / 2 - item_width / 2);
    that.setData({
      shop_classify_index: index,
      scroll_left: distance
    });
  },

  // 商家触底加载
  lower: function() {
    if (loadBtn) {
      loadBtn = false;
      let that = this;
      let shop_classify_list = that.data.shop_classify_list;
      let index = that.data.shop_classify_index,
        num = shop_classify_list[index].chlidrenList.pageIndex + 1;
      console.log(index);
      if (that.data.shop_classify_list[index].chlidrenList.pageIndex < shop_classify_list[index].chlidrenList.pageCount) {
        app.showLoading()
          .then(() => {
            let obj = {
              shopTypeId: index == 0 ? '' : shop_classify_list[index].id,
              longitude: app.longitude,
              latitude: app.latitude,
              pageIndex: num,
              pageSize: app.pageSize
            };
            app.shop.list(obj)
              .then((data) => {
                console.log(data);
                let chlidren = 'shop_classify_list[' + index + '].chlidrenList.list';
                let pageIndex = 'shop_classify_list[' + index + '].chlidrenList.pageIndex';
                let list = util.cycle(data.list, shop_classify_list[index].chlidrenList.list);
                // 计算商家距离
                data.list.forEach((item) => {
                  if (item.distance >= 1000) {
                    let num = item.distance / 1000;
                    item.distance = num.toFixed(1);
                    item.distance = item.distance + 'km'
                  } else {
                    item.distance = item.distance + 'm';
                  }
                });
                that.setData({
                  [chlidren]: list,
                  [pageIndex]: num
                }, _ => {
                  loadBtn = true;
                });
              })
              .then(app.hideLoading);
          });
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this,
      left_distance = [];
    util.getDom('.shop_classify_list')
      .then((rect) => {
        rect.forEach((item) => {
          left_distance.push(item);
        });
        return Promise.resolve(rect);
      })
      .then((rect) => {
        util.getDom('#scroll_view')
          .then((rect) => {
            console.log(rect)
            that.setData({
              scrollWidth: rect && rect.length <= 0 ? 0 : rect[0].width,
              left_distance: left_distance
            });
          });
      });
  },

  //滑动切换tab 
  bindChange: function(e) {
    let that = this;
    let index = e.detail.current;
    let left_distance = that.data.left_distance;
    let id = left_distance[index].id,
      item_left = left_distance[index].left,
      item_width = left_distance[index].width,
      scrollWidth = that.data.scrollWidth;
    let distance = item_left - (scrollWidth / 2 - item_width / 2);
    that.setData({
      shop_classify_index: index,
      scroll_left: distance
    });

    let shops = that.data.shop_classify_list[index];
    if (shops.chlidrenList.list == undefined) {
      that.loadNearShop(shops.id, index);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    app.refreshCartNum();
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