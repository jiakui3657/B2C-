// pages/classify/index/index.js
let app = getApp();
let util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shop_l_list: [],
    goodsList: {},
    shop_r_index: null,
    shop_l_index: 0,
    shop_r_id: 0,
    shop_l_id: 0,
    shop_all_flag: false,
    groupList: [],
    categoryList: [],
    top_distance: [],
    scroll_height: '',
    scroll_top: 0,
    animationList: [],
    animationIndex: 0,
    flag: true
  },

  // 商品触底加载
  lower: function () {
    console.log(this.data.shop_l_index);
    let that = this;
    let id = that.data.shop_l_list[that.data.shop_l_index].childList ? that.data.shop_l_list[that.data.shop_l_index].childList.length > 0 ? that.data.shop_l_list[that.data.shop_l_index].childList[0].id : that.data.shop_l_list[that.data.shop_l_index].id : that.data.shop_l_list[that.data.shop_l_index].id, pageIndex = that.data.goodsList.pageIndex + 1;
    if (that.data.goodsList.pageIndex < that.data.goodsList.pageCount) {
      app.showLoading()
        .then(() => {
          // 商品列表
          let types = that.data.shop_l_list[that.data.shop_l_index].types == 1 ? 'groupList' : 'categoryList';
          let params = {
            areaId: app.areaId,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };

          if (types == 'groupList') {
            params.groupId = id;
          } else {
            params.categoryId = id;
          }
          return app.goods.list(params);
        })
        .then((data) => {
          console.log(data);
          let str = 'goodsList.pageIndex';
          let list = util.cycle(data.list, that.data.goodsList.list);
          let goodsList = 'goodsList.list';
          that.setData({
            [goodsList]: list,
            [str]: pageIndex
          });
        })
        .then(app.hideLoading)
        .catch(app.hideLoading)
    }
  },

  // 跳转商品详情
  goods_detail(event){
    let id = event.currentTarget.id
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id
    });
  },

  // 加入购物车动画
  addCart: function (event) {
    let that = this;
    let index = event.currentTarget.dataset.index;
    let id = '#' + event.currentTarget.dataset.id, animation = 'animationList[' + index + ']', current_left = null, current_top = null, target_left = null, target_top = null, distance_left = null, distance_top = null;
    that.animation = wx.createAnimation();
    if (that.data.flag) {
      return new Promise((resolve, reject) => {
        that.setData({
          flag: false
        });
        resolve();
      })
      .then(() => {
        // 获取当前元素的坐标
        return util.getDom(id)
          .then((rect) => {
            current_left = rect[0].left + rect[0].width / 2;
            current_top = rect[0].top + rect[0].height / 2;
            return Promise.resolve();
          });
      })
      .then(() => {
        // 获取终点元素的坐标
        return util.getDom('#target')
          .then((rect) => {
            distance_left = rect[0].left - current_left;
            distance_top = rect[0].top - current_top;
            console.log(current_left, current_top, rect[0].left, rect[0].top, distance_left, distance_top);

            that.animation.translateX(distance_left)
              .translateY(distance_top)
              .scale(0)
              .step();
            that.setData({
              animationIndex: event.currentTarget.dataset.index,
              [animation]: that.animation.export()
            });
          });
      })
      .then(() => {
        // 回到初始化坐标
        setTimeout(function () {
          this.animations = wx.createAnimation({
            duration: 0,
            timingFunction: 'linear',
            success: function (res) {
            }
          });
          this.animations.translateX(0)
            .translateY(0)
            .scale(1)
            .step();
          that.setData({
            flag: true,
            [animation]: this.animations.export()
          });
        }, 400);
        return Promise.resolve();
      })
      .then(() => {
        // 加入购物车
        let obj = {
          goodsId: event.currentTarget.id,
          organId: that.data.goodsList.list[index].organId,
          goodsSpecId: that.data.goodsList.list[index].goodsSpecId,
          goodsNum: 1
        };
        return app.cart.addUserCart(obj,true);
      })
      .then((data) => {
        let goodsList = app.globalData.goodsId || [];
        goodsList.push(event.currentTarget.id);
        app.setGlobalData('goodsId', goodsList);
        return Promise.resolve();
      })
      .then(app.refreshCartNum)
      .then(app.hideLoading)
      .catch(app.hideLoading);
    }
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this;
    app.showLoading()
      .then(() => {
        let param = {
          areaId: app.areaId
        }
        return app.goods.categoryList(param);
      })
      .then((data) => {
        // 区分分组 types: 1
        data.groupList.forEach((item) => {
          item.types = 1
        });

        // 区分分组 types: 2
        data.categoryList.forEach((item) => {
          item.types = 2
        });
        let list = util.cycle(data.groupList, []);
        list = util.cycle(data.categoryList, list);
        that.setData({
          shop_l_list: list
        });
        return Promise.resolve();
      })
      .then(() => {
        // 商品列表
        let id = that.data.shop_l_list[0].id;
        let types = that.data.shop_l_list[0].types == 1 ? 'groupList' : 'categoryList';
        let params = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        };
        if (types == 'groupList'){
          params.groupId = id;
        } else {
          params.categoryId = id;
        }
        return app.goods.list(params);
      })
      .then((data) => {
        that.setData({
          goodsList: data
        });
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
        that.onReady();
      })
      .catch(() => {
        app.hideLoading();
        that.onReady();
      });
  },

  // 左侧商品一级分类切换
  shop_l_toggle: function(event) {
    console.log(event, this.data.top_distance);
    let that = this;
    let index = event.currentTarget.dataset.index, id = that.data.shop_l_list[index].id, item_top = that.data.top_distance[index].top, item_height = that.data.top_distance[index].height, scroll_height = that.data.scroll_height;
    let distance = item_top - item_height - (scroll_height / 2 - item_height / 2);
    if (index != that.data.shop_l_index) {
      app.showLoading()
      .then(() => {
        // 商品列表
        let types = that.data.shop_l_list[index].types == 1 ? 'groupList' : 'categoryList';
        let params = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        };
        if (types == 'groupList') {
          params.groupId = id;
        } else {
          params.categoryId = id;
        }
        return app.goods.list(params);
      })
      .then((data) => {
        that.setData({
          goodsList: data,
          shop_l_index: index,
          shop_l_id: id,
          scroll_top: distance,
          shop_r_index: null
        });
        return Promise.resolve();
      })
      .then(app.hideLoading);
    }
  },

  // 右侧顶部商品二级分类切换
  shop_r_toggle: function(event) {
    let that = this, index = event.currentTarget.dataset.index, id = event.currentTarget.id;
    console.log(index, that.data.shop_r_index);
    if (index != that.data.shop_r_index) {
      app.showLoading()
        .then(() => {
          // 商品列表
          let types = that.data.shop_l_list[that.data.shop_l_index].types == 1 ? 'groupList' : 'categoryList';
          let params = {
            areaId: app.areaId,
            pageIndex: 1,
            pageSize: app.pageSize
          };
          if (types == 'groupList') {
            params.groupId = id;
          } else {
            params.categoryId = id;
          }
          return app.goods.list(params);
        })
        .then((data) => {
          that.setData({
            goodsList: data,
            shop_r_index: index
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
        .catch(app.hideLoading)
    }
  },

  // 右侧顶部商品二级分类全部切换
  shop_all_toggle: function () {
    this.setData({
      shop_all_flag: !this.data.shop_all_flag
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this, top_distance = [];
    setTimeout(() => {
      util.getDom('.shop_l_list')
        .then((rect) => {
          console.log(rect);
          rect.forEach((item) => {
            top_distance.push(item);
          });
          return Promise.resolve();
        })
        .then((rect) => {
          return util.getDom('.shop_l')
            .then((rect) => {
              that.setData({
                scroll_height: rect && rect.length > 0 ? rect[0].height : 0,
                top_distance: top_distance
              });
              return Promise.resolve();
            });
        });
      console.log(top_distance);
    }, 1000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.refreshCartNum();
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
    let that = this;
    app.showLoading()
      .then(() => {
        let param = {
          areaId: app.areaId
        }
        return app.goods.categoryList(param);
      })
      .then((data) => {
        // 区分分组 types: 1
        data.groupList.forEach((item) => {
          item.types = 1
        });

        // 区分分组 types: 2
        data.categoryList.forEach((item) => {
          item.types = 2
        });
        let list = util.cycle(data.groupList, []);
        list = util.cycle(data.categoryList, list);
        that.setData({
          shop_l_list: list
        });
        return Promise.resolve();
      })
      .then(() => {
        // 商品列表
        let id = that.data.shop_l_list[0].id;
        let types = that.data.shop_l_list[0].types == 1 ? 'groupList' : 'categoryList';
        let params = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        };
        if (types == 'groupList') {
          params.groupId = id;
        } else {
          params.categoryId = id;
        }
        return app.goods.list(params);
      })
      .then((data) => {
        that.setData({
          goodsList: data,
          shop_r_index: null,
          shop_l_index: 0
        });
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
        that.onReady();
        wx.stopPullDownRefresh();
      })
      .catch(() => {
        app.hideLoading();
        that.onReady();
        wx.stopPullDownRefresh();
      });
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