// pages/near/shop_detail/shop_detail.js
let util = require('../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,
    showTop: 0,
    dialogVisible: false,
    greyStarIcon: app.imgSrc + '/images/online/common/level.png',
    starIcon: app.imgSrc + '/images/online/common/level_in.png',
    arrowIcon: app.imgSrc + '/images/online/shop/confirm_order/go.png',
    specification_state: false,
    coupons_state: false,
    promotion_state: false,
    freight_state: false,
    store_state: false,
    goods_data: {},
    commentList: [],
    recommendGoodsList: [],
    munit_flag: 0,
    shop: {},
    shop_price: '',
    shop_num: 1,
    goods_spec_id: '',
    shop_cart_num: 0,
    latest_goods: [],
    stock: '',
    from: '',
    isRest: false,
    swiperError: 0,
    navHeight: '',
    coupons_list: [],
    shareState: ''
  },

  // 返回上一层
  back: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  // 滑动轮播图
  sliding: function(event) {
    if (event.detail.source == "touch") {
      //当页面卡死的时候，current的值会变成0
      if (event.detail.current == 0) {
        let swiperError = this.data.swiperError
        swiperError += 1
        this.setData({
          swiperError: swiperError
        })
        if (swiperError >= 3) {
          this.setData({
            current: this.data.current
          }); //，重置current为正确索引
          this.setData({
            swiperError: 0
          })
        }
      } else {
        this.setData({
          current: event.detail.current,
          swiperError: 0
        });
      }
    }
  },

  linkTo(e) {
    util.linkTo(e);
  },

  chooseType(e) {
    let type = e.currentTarget.dataset.type;
    this.setData({
      showTop: type,
      dialogVisible: true
    });
  },

  closeDialog() {
    this.setData({
      dialogVisible: false
    });
  },

  // 跳转购物车
  cart: function() {
    wx.switchTab({
      url: '/pages/cart/index/index'
    })
  },

  // 跳转订单详情
  confirm_order: function(event) {
    let that = this,
      arr = [];

    if (!that.data.isRest) {
      let obj = {
        title: '休息中'
      };
      app.showToast(obj);
      return;
    }

    arr[0] = {
      goodsId: that.data.goods_data.goodsId,
      goodsSpecId: that.data.goods_spec_id,
      goodsNum: that.data.shop_num,
      organId: that.data.goods_data.organId
    }

    // if (arr[0].goodsNum <= that.data.stock) {
    //   wx.navigateTo({
    //     url: '/pages/cart/confirm_order/confirm_order?isCartOrder=0',
    //     success: function(res) {
    //       res.eventChannel.emit('acceptDataFromOpenerPage', {
    //         data: arr
    //       })
    //     }
    //   })
    // } else 
    if (that.data.shop_num > that.data.stock) {
      app.showToast({
        title: '库存不足'
      });
    } else {
      wx.navigateTo({
        url: '/pages/cart/confirm_order/confirm_order?isCartOrder=0',
        success: function(res) {
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            data: arr
          })
        }
      })
    }
    // else {
    //   // 修改商品数量
    //   arr[0].goodsNum = that.data.stock;

    //   // 提示数量超出
    //   app.showToast({
    //     title: '活动商品超过限购数量部分不参与结算'
    //   });

    //   setTimeout(() => {
    //     wx.navigateTo({
    //       url: '/pages/cart/confirm_order/confirm_order?isCartOrder=0',
    //       success: function(res) {
    //         res.eventChannel.emit('acceptDataFromOpenerPage', {
    //           data: arr
    //         })
    //       }
    //     })
    //   }, 2000)
    // }

  },

  // 图片预览
  preview: function(event) {
    console.log(event.currentTarget.dataset.index);
    let index = event.currentTarget.dataset.index;
    util.preview(this.data.commentList[0].imgList[index], this.data.commentList[0].imgList);
  },

  // 跳转全部评论
  goods_evaluation: function() {
    wx.navigateTo({
      url: '/pages/classify/goods_evaluation/goods_evaluation'
    });
  },

  // 跳转首页
  home: function() {
    wx.switchTab({
      url: '/pages/home/index/index'
    });
  },

  // 打开规格模态框
  open_specification: function(e) {
    this.setData({
      specification_state: !this.data.specification_state
    });
  },


  // 打开优惠券模态框
  // 打开规格模态框
  open_coupons: function(e) {
    this.setData({
      coupons_state: !this.data.coupons_state
    });
  },

  // 打开运费说明模态框
  open_freight: function() {
    this.setData({
      freight_state: !this.data.freight_state
    });
  },

  // 关闭模态框
  close: function() {
    this.setData({
      specification_state: false,
      coupons_state: false,
      promotion_state: false,
      freight_state: false,
      store_state: false
    });
  },

  // 商品规格切换
  munit_toggle: function(event) {
    console.log(event);
    let index = event.currentTarget.dataset.index;
    if (!this.data.goods_data.goodsSpecList[index].hasOwnProperty('linePrice')) {
      this.data.goods_data.goodsSpecList[index].linePrice = 0;
    }
    this.setData({
      munit_flag: index,
      shop_num: 1,
      goods_spec_id: this.data.goods_data.goodsSpecList[index].goodsSpecId,
      shop_price: this.data.goods_data.goodsSpecList[index].price,
      line_price: this.data.goods_data.goodsSpecList[index].linePrice,
      shop_specName: this.data.goods_data.goodsSpecList[index].specName,
      stock: this.data.goods_data.goodsSpecList[index].stock
    });
  },

  // 数量加
  add: function() {
    this.data.shop_num = util.add(this.data.shop_num, 1);

    this.setData({
      shop_num: this.data.shop_num
    });
  },

  // 数量减
  reduction: function() {
    if (this.data.shop_num > 1) {
      this.data.shop_num = util.sub(this.data.shop_num, 1);
      this.setData({
        shop_num: this.data.shop_num
      });
    }
  },

  // 自定义数字
  get_number: function(event) {
    let value = event.detail.value > 0 ? event.detail.value : 1;
    this.data.shop_num = value;
    this.setData({
      shop_num: this.data.shop_num
    });
  },

  // 加入购物车
  add_cart: function() {
    let that = this,
      pages = getCurrentPages(),
      beforePage = pages[pages.length - 2],
      beforePageIndex = pages[pages.length - 3];
    app.showLoading()
      .then(() => {
        let obj = {
          goodsId: that.data.goods_data.goodsId,
          organId: that.data.goods_data.organId,
          goodsSpecId: that.data.goods_spec_id,
          goodsNum: that.data.shop_num
        }
        return app.cart.addUserCart(obj, true);
      })
      .then((data) => {
        let goodsList = app.globalData.goodsId || [];
        goodsList.push(that.data.goods_data.goodsId);
        app.setGlobalData('goodsId', goodsList);
        let obj = {
          title: '添加成功',
          icon: 'success'
        }
        app.showToast(obj);
        return Promise.resolve();
      })
      .then(() => {
        // 获取购物车商品列表
        return app.cart.userCartList();
      })
      .then((res) => {
        let num = 0;
        console.log(res, that.data.shop.shopId);
        console.log(pages);
        res.validCartList.forEach((item) => {
          if (item.shopId == that.data.shop.shopId) {
            item.goodsVoList.forEach((item) => {
              num = util.add(num, item.goodsNum);
            })
          }
        })

        that.setData({
          shop_cart_num: num
        })
        console.log(that.data.shopping_cart);
      })
      .then(beforePage.cart_num)
      .then(beforePageIndex.onHide)
      .then(app.refreshCartNum)
      .then(app.hideLoading);
  },

  // 打开当前页面路径中的参数
  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    let that = this;
    that.pageQuery = options;
    that.setData({
      imgSrc: app.imgSrc,
      shareState: that.pageQuery.shareState ? 1 : '',
      navHeight: app.navHeight
    });
    app.showLoading()
      .then(() => {
        // 店铺商品详情
        let params = {
          shopId: that.pageQuery.shopId,
          goodsId: that.pageQuery.goodId
        };
        return app.goods.shopGoodsDetail(params);
      })
      .then((goods) => {
        console.log('商品详情', goods);
        if (goods.describtion) {
          goods.describtion = goods.describtion.replace(/\<img/gi, '<img style="max-width:100%;height:auto;display:block;"');
          goods.describtion = goods.describtion.replace(/\<p/gi, '<p class="p"');
          goods.describtion = goods.describtion.replace(/\<p class="p"><img/gi, '<p class=""><img');
        }
        let goodsSpecList = goods.goodsSpecList.filter((item, index, arr) => item.goodsSpecId == goods.defaultSpecId);

        if (!goodsSpecList[0].hasOwnProperty('linePrice')) {
          goodsSpecList[0].linePrice = 0;
        }
        that.setData({
          goods_data: goods,
          goods_spec_id: goods.defaultSpecId,
          shop_price: goodsSpecList[0].price,
          line_price: goodsSpecList[0].linePrice,
          shop_specName: goodsSpecList[0].specName,
          shop_cart_num: that.pageQuery.shop_num,
          stock: goodsSpecList[0].stock
        });
        return Promise.resolve();
      })
      .then(() => {
        // 最新商家商品
        let params = {
          shopId: that.pageQuery.shopId,
          pageIndex: 1,
          pageSize: 3
        };
        return app.goods.shopGoodsList(params);
      })
      .then((data) => {
        that.setData({
          latest_goods: data.list
        })
        return Promise.resolve();
      })
      .then(that.getShopInfo(that.pageQuery.shopId))
      // .then(that.getRecommendGoodsList(that.pageQuery.goodId))
      .then(() => {
        let obj = {
          goodsId: that.data.goods_data.goodsId,
          pageIndex: 1,
          pageSize: 10000
        };
        return app.shop.goodsCouponList(obj);
      }).then((couponList) => {
        let reg = new RegExp("-", "g");
        couponList.list.forEach((item) => {
          item.startTime = item.startTime.replace(reg, ".").substring(0, 16);
          item.endTime = item.endTime.replace(reg, ".").substring(0, 16);
        })
        that.setData({
          coupons_list: couponList.list
        })
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading);
  },

  // 领取优惠券
  getCouponBtn: function(event) {
    let that = this;
    let index = event.currentTarget.dataset.index;
    let data = this.data.coupons_list[index];
    app.showLoading()
      .then(() => {
        let obj = {
          couponId: data.id,
        };
        return app.shop.getShopCoupon(obj)
      }).then(() => {
        let item = 'coupons_list[' + index + '].hadGetNum';
        this.setData({
          [item]: data.hadGetNum += 1
        })
        app.hideLoading();
        app.showToast({
          title: '领取成功',
          icon: 'success'
        });
      }).catch(() => {
        app.hideLoading();
        app.showToast({
          title: '领取失败，请稍后再试',
        });
        let obj = {
          goodsId: that.data.goods_data.goodsId,
          pageIndex: 1,
          pageSize: 10000
        };
        app.shop.goodsCouponList(obj)
          .then((couponList) => {
            let reg = new RegExp("-", "g");
            couponList.list.forEach((item) => {
              item.startTime = item.startTime.replace(reg, ".").substring(0, 16);
              item.endTime = item.endTime.replace(reg, ".").substring(0, 16);
            })
            that.setData({
              coupons_list: couponList.list
            })
          })
      })
  },

  // 返回商家详情
  shop: function() {
    if ('shop' == this.data.from.come) {
      wx.navigateBack({});
    } else {
      wx.navigateTo({
        url: '/pages/near/shop/shop?id=' + this.data.shop.shopId
      });
    }
  },

  shopGoodsDetail: function(e) {
    let goodId = e.currentTarget.id;
    wx.redirectTo({
      url: '/pages/near/shop_detail/shop_detail?shopId=' + this.data.shop.shopId + '&goodId=' + goodId + '&shop_num=' + this.data.shop_cart_num
    });
  },

  /**
   * 店铺信息
   */
  getShopInfo: function(shopId) {
    var that = this;
    let params = {
      shopId: shopId,
      longitude: app.longitude,
      latitude: app.latitude
    };
    return app.shop.detail(params)
      .then((data) => {
        // 计算是否在营业时间之内
        let obj = util.format(Date.parse(new Date()));
        let isRest = that.time_range(data.opening, data.ending, obj.time);
        isRest = isRest && (data.isOpen == 1 ? true : false);
        that.setData({
          shop: data,
          isRest: isRest
        });
        return Promise.resolve(data);
      });
  },

  /**
   * 推荐商品
   */
  getRecommendGoodsList: function(goodsId) {
    var that = this;
    let params = {
      goodsId: goodsId,
      areaId: app.areaId,
      pageIndex: 1,
      pageSize: 10
    };
    return app.goods.commentList(params)
      .then((goodsList) => {
        that.setData({
          recommendGoodsList: goodsList
        });
        return Promise.resolve();
      });
  },

  // 收藏商品
  collection: function(event) {
    let that = this,
      isCollected = event.currentTarget.dataset.iscollected;
    console.log(that.data.goods_data, isCollected);
    if (isCollected == 0) {
      // 收藏商品
      app.showLoading().then(() => {
        let obj = {
          id: that.data.goods_data.goodsId,
          type: 1
        }
        return app.user.addCollection(obj)
      }).then((res) => {
        console.log(res);

        // 更新全局收藏数量
        app.globalData.userInfo.markNum = app.globalData.userInfo.markNum + 1;

        // 更新本地收藏状态
        let goods_data = 'goods_data.isCollected';
        that.setData({
          [goods_data]: 1
        })
        console.log(that.data.goods_data);
        return Promise.resolve();
      }).then(() => {
        let obj = {
          title: '收藏成功',
          icon: 'success'
        };
        app.showToast(obj);
      })
    } else {
      // 取消收藏商品
      app.showLoading()
        .then(() => {
          console.log(that.data.goods_data.goodsId)
          let obj = {
            id: that.data.goods_data.goodsId,
            type: 1
          }
          return app.user.deleteCollection(obj)
        })
        .then((res) => {
          console.log(res);

          // 更新全局收藏数量
          app.globalData.userInfo.markNum = app.globalData.userInfo.markNum + 1;

          // 更新本地收藏状态
          let goods_data = 'goods_data.isCollected';
          that.setData({
            [goods_data]: 0
          })
          return Promise.resolve();
        })
        .then(() => {
          let obj = {
            title: '取消收藏成功',
            icon: 'success'
          };
          app.showToast(obj);
        });
    }
  },

  // 判断事件是否在一段时间区间内
  time_range: function(beginTime, endTime, nowTime) {
    var strb = beginTime.split(":");
    if (strb.length != 2) {
      return false;
    }

    var stre = endTime.split(":");
    if (stre.length != 2) {
      return false;
    }

    var strn = nowTime.split(":");
    if (stre.length != 2) {
      return false;
    }
    var b = new Date();
    var e = new Date();
    var n = new Date();

    b.setHours(strb[0]);
    b.setMinutes(strb[1]);
    e.setHours(stre[0]);
    e.setMinutes(stre[1]);
    n.setHours(strn[0]);
    n.setMinutes(strn[1]);

    if (n.getTime() - b.getTime() > 0 && n.getTime() - e.getTime() < 0) {
      return true;
    } else {
      return false;
    }
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
    let that = this;
    let imgUrl;
    if (that.data.goods_data.imgList && that.data.goods_data.imgList.length > 0) {
      imgUrl = that.data.goods_data.imgList[0];
    }
    console.log(that.data.from);
    let shareObj = {
      path: '/pages/near/shop_detail/shop_detail?shopId=' + that.pageQuery.shopId + '&goodId=' + that.pageQuery.goodId + '&shop_num=' + that.data.shop_cart_num + '&shareState=' + 1,
      title: that.data.goods_data.name,
      imageUrl: imgUrl,
      success: function(res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {}
      },
      fail: function() {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      }
    };
    return shareObj;
  }
})