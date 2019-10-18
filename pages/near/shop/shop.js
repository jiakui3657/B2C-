// pages/near/shop/shop.js
let util = require('../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRest: false,
    showDetail: false,
    coupons_state: false,
    cart_state: false,
    shopInfo: {},
    goods_l_list: [],
    goods_l_index: 0,
    goods_l_id: '',
    shop_all_flag: false,
    goodsList: {},
    pageIndex: 1,
    shopId: '',
    shopping_cart: 0,
    scroll_height: 0,
    top_distance: [],
    scroll_top: 0,
    animationList: [],
    animationIndex: 0,
    cart_shop_price: 0.00,
    flag: true,
    scrollHeight: '',
    cart_list: [],
    coupons_list: []
  },

  // 跳转商家商品详情
  linkTo(event) {
    let goodId = event.currentTarget.id
    wx.navigateTo({
      url: '/pages/near/shop_detail/shop_detail?shopId=' + this.data.shopId + '&goodId=' + goodId + '&shop_num=' + this.data.shopping_cart + '&come=shop'
    });
  },

  // 打开优惠券
  open_coupons: function(event) {
    this.setData({
      coupons_state: !this.data.coupons_state
    })
  },

  // 打开购物车
  open_cart: function() {
    this.setData({
      cart_state: !this.data.cart_state
    })
  },

  // 关闭模态框
  close: function() {
    this.setData({
      cart_state: false,
      coupons_state: false
    })
  },

  // 清空商家购物车
  empty: function() {
    if (this.data.cart_list.length == 0) {
      this.setData({
        cart_state: false,
      })
      return;
    }
    let obj = {
      content: '您确定要清空商品吗'
    }
    let cartId = '',
      that = this;
    util.showModal(obj)
      .then(() => {
        return app.showLoading()
          .then(() => {
            that.data.cart_list.forEach((item) => {
              cartId += item.cartId;
              cartId += ',';
            })
            return Promise.resolve();
          })
          .then(() => {
            // 删除商品
            let obj = {
              cartId: cartId
            }
            return app.cart.deleteCartGoods(obj, true);
          })
          .then((data) => {
            console.log(data);

            that.setData({
              shopping_cart: 0,
              cart_shop_price: 0,
              cart_list: []
            })
          })
          .then(() => {
            // 更新购物车商品数量
            return app.cart.getCartGoodsNum();
          })
          .then(() => {
            app.hideLoading();
          });
      });
  },

  // 跳转购物车
  shop: function() {
    if (this.data.isRest) {
      wx.switchTab({
        url: '/pages/cart/index/index'
      });
    } else {
      let obj = {
        title: '休息中'
      };
      app.showToast(obj);
    }
  },

  // 商品分类切换
  goods_l_toggle: function(event) {
    let that = this;
    let index = event.currentTarget.dataset.index,
      id = event.currentTarget.id,
      item_top = that.data.top_distance[index].top,
      item_height = that.data.top_distance[index].height,
      scroll_height = that.data.scroll_height;
    let distance = item_top - item_height - (scroll_height / 2 - item_height / 2);
    console.log(index, id)
    if (that.data.goods_l_index != index) {
      app.showLoading()
        .then(() => {
          // 店铺商品列表
          let obj = {
            shopId: that.data.shopId,
            categoryId: id,
            pageIndex: that.data.pageIndex,
            pageSize: app.pageSize
          };
          return app.goods.shopGoodsList(obj);
        })
        .then((data) => {
          console.log('店铺商品列表', data);
          that.setData({
            goods_l_index: index,
            goods_l_id: id,
            goodsList: data,
            scroll_top: distance
          });
        })
        .then(app.hideLoading);
    }
  },

  // 打开商家位置
  location: function() {
    let that = this
    wx.openLocation({
      latitude: that.data.shopInfo.latitude,
      longitude: that.data.shopInfo.longitude,
      scale: 18,
      name: that.data.shopInfo.shopName,
      address: that.data.shopInfo.address
    });
  },

  showShopInfoDetail() {
    this.setData({
      showDetail: !this.data.showDetail
    });
  },

  // 商品触底加载
  lower: function() {
    let that = this;
    let pageIndex = that.data.goodsList.pageIndex + 1;
    if (that.data.goodsList.pageIndex < that.data.goodsList.pageCount) {
      app.showLoading()
        .then(() => {
          // 店铺商品列表
          let obj = {
            shopId: that.data.shopId,
            categoryId: that.data.goods_l_id,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };
          return app.goods.shopGoodsList(obj);
        })
        .then((data) => {
          console.log('店铺商品列表', data);
          let list = util.cycle(data.list, that.data.goodsList.list);
          let goodsList = 'goodsList.list';
          let indexStr = 'goodsList.pageIndex';
          that.setData({
            [goodsList]: list,
            [indexStr]: pageIndex
          });
          return Promise.resolve();
        })
        .then(app.hideLoading);
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

  // 刷新购物车数量
  cart_num: function() {
    let that = this,
      num = 0,
      money = 0,
      list = [];
    return app.cart.userCartList()
      .then((res) => {
        console.log(res, that.data.shopId);
        res.validCartList.forEach((item) => {
          if (item.shopId == that.data.shopId) {
            item.goodsVoList.forEach((item) => {
              let product = util.mul(item.goodsNum, item.price);
              money = util.add(money, product);
              num = util.add(num, item.goodsNum);
            })
            list = item.goodsVoList;
          }
        })
        that.setData({
          shopping_cart: num,
          cart_shop_price: money,
          cart_list: list
        })
        console.log(that.data.shopping_cart);
        return Promise.resolve();
      })
  },

  // 数量加
  add: function(event) {
    let that = this,
      index = event.currentTarget.dataset.index,
      num = 0,
      money = 0;
    if (this.data.cart_list[index].goodsNum < this.data.cart_list[index].stock) {
      this.data.cart_list[index].goodsNum = util.add(this.data.cart_list[index].goodsNum, 1);
      // this.data.shop_price = util.mul(this.data.shop_num, this.data.goods_data.goodsSpecList[this.data.munit_flag].price)
      // 修改购物车商品数量
      let obj = {
        cartId: that.data.cart_list[index].cartId,
        goodsId: that.data.cart_list[index].goodsId,
        goodsSpecId: that.data.cart_list[index].goodsSpecId,
        goodsNum: that.data.cart_list[index].goodsNum
      };
      app.cart.updateCartGoodsNum(obj)
        .then((data) => {
          console.log(data);

          // 重置商家商品总金额和数量
          that.data.cart_list.forEach((item) => {
            let product = util.mul(item.goodsNum, item.price);
            money = util.add(money, product);
            num = util.add(num, item.goodsNum);
          })
          that.setData({
            shopping_cart: num,
            cart_shop_price: money,
            cart_list: that.data.cart_list
          })
        })
        .then(app.refreshCartNum)
        .then(() => {
          app.hideLoading();
        })
    } else {
      app.showToast({
        title: '库存不足'
      })
    }
  },

  // 数量减
  reduction: function(event) {
    let that = this,
      index = event.currentTarget.dataset.index,
      num = 0,
      money = 0;
    if (this.data.cart_list[index].goodsNum > 1) {
      this.data.cart_list[index].goodsNum = util.sub(this.data.cart_list[index].goodsNum, 1);
      let obj = {
        cartId: that.data.cart_list[index].cartId,
        goodsId: that.data.cart_list[index].goodsId,
        goodsSpecId: that.data.cart_list[index].goodsSpecId,
        goodsNum: that.data.cart_list[index].goodsNum
      };
      app.cart.updateCartGoodsNum(obj)
        .then((data) => {
          console.log(data);

          // 重置商家商品总金额和数量
          that.data.cart_list.forEach((item) => {
            let product = util.mul(item.goodsNum, item.price);
            money = util.add(money, product);
            num = util.add(num, item.goodsNum);
          })
          that.setData({
            shopping_cart: num,
            cart_shop_price: money,
            cart_list: that.data.cart_list
          })
        })
        .then(() => {
          // 更新购物车商品数量
          return app.cart.getCartGoodsNum();
        })
        .then(app.refreshCartNum)
        .then(() => {
          app.hideLoading();
        })
    } else {
      let obj = {
        content: '您确定删除该商品吗'
      }
      util.showModal(obj)
        .then(() => {
          return app.showLoading()
            .then(() => {
              // 删除商品
              let obj = {
                cartId: that.data.cart_list[index].cartId
              }
              return app.cart.deleteCartGoods(obj, true);
            })
            .then((data) => {
              console.log(data, index);

              // 删除商品
              that.data.cart_list.splice(index, 1);

              // 重置商家商品总金额和数量
              that.data.cart_list.forEach((item) => {
                let product = util.mul(item.goodsNum, item.price);
                money = util.add(money, product);
                num = util.add(num, item.goodsNum);
              })
              that.setData({
                shopping_cart: num,
                cart_shop_price: money,
                cart_list: that.data.cart_list
              })
            })
            .then(() => {
              // 更新购物车商品数量
              return app.cart.getCartGoodsNum();
            })
            .then(() => {
              app.hideLoading();
            });
        });
    }
  },

  saveShopVisitRecord: function(shopId) {
    let param = {
      footId: shopId,
      type: 3
    };
    return app.user.saveGoodsVisitRecord(param)
      .then(() => {
        app.hideLoading();
        return Promise.resolve();
      })
      .catch(() => {
        app.hideLoading();
        return Promise.resolve();
      });
  },
  // 打开当前页面路径中的参数
  pageQuery: null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      imgSrc: app.imgSrc
    });
    let that = this;
    console.log(options);

    that.pageQuery = options;

    app.showLoading()
      .then(() => {
        //保存浏览记录
        that.saveShopVisitRecord(that.pageQuery.id);

        // 店铺详情
        let params = {
          shopId: that.pageQuery.id,
          longitude: app.longitude,
          latitude: app.latitude
        };
        return app.shop.detail(params);
      })
      .then((shop) => {
        console.log('店铺详情', shop);
        let isRest = false;
        /*
        wx.setNavigationBarTitle({
          title: shop.shopName || '商品详情'
        });
        */

        // 换算商家距离自己的距离的单位 res.data.distance >= 1000 ? km : m
        if (shop.distance >= 1000) {
          let num = parseFloat(shop.distance) / 1000;
          shop.modifyDistance = num.toFixed(1);
        }

        // 计算是否在营业时间之内
        let obj = util.format(Date.parse(new Date()));
        isRest = that.time_range(shop.opening, shop.ending, obj.time);
        isRest = isRest && (shop.isOpen == 1 ? true : false);
        that.setData({
          shopInfo: shop,
          isRest: isRest,
          shopId: that.pageQuery.id,
          shopping_cart: app.shopping_cart
        });
        return Promise.resolve();
      })
      .then(() => {
        // 店铺商品分类列表
        let obj = {
          shopId: that.pageQuery.id
        };
        return app.goods.shopGoodsCategoryList(obj);
      })
      .then((categories) => {
        console.log('店铺商品分类', categories);
        let firstCategoryId = '';
        if (categories.list && categories.list.length > 0) {
          firstCategoryId = categories.list[0].id;
        }
        that.setData({
          goods_l_list: categories.list,
          goods_l_id: firstCategoryId,
          goods_l_index: 0
        });
        return Promise.resolve();
      })
      .then(() => {
        // 店铺商品列表
        let obj = {
          shopId: that.pageQuery.id,
          categoryId: that.data.goods_l_id,
          pageIndex: 1,
          pageSize: app.pageSize
        };
        return app.goods.shopGoodsList(obj);
      })
      .then((goodsList) => {
        console.log('店铺商品列表', goodsList);
        that.setData({
          goodsList: goodsList
        });
        return Promise.resolve();
      })
      .then(that.cart_num)
      .then(() => {
        let obj = {
          shopId: that.data.shopId,
          pageIndex: 1,
          pageSize: 10000
        };
        return app.shop.couponList(obj);
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
      .catch((e) => {
        console.error('店铺详情加载出错', e);
      })
      .then(() => {
        app.hideLoading();
        that.onReady();
      });
  },

  changeImageLogoAnimationDisplay: function(index, display) {
    return new Promise((resolve, reject) => {
      let imageLogoAnimationDisplay = 'goodsList.list[' + index + '].imageLogoAnimationDisplay';
      this.setData({
        [imageLogoAnimationDisplay]: display ? 'block' : 'none'
      });
      resolve();
    });
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
          shopId: that.data.shopId,
          pageIndex: 1,
          pageSize: 10000
        };
        app.shop.couponList(obj)
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

  // 加入购物车
  addCart: function(event) {
    console.log(event);
    let that = this,
      index = event.currentTarget.dataset.index,
      id = '#' + event.currentTarget.dataset.id,
      animation = 'animationList[' + index + ']',
      current_left = null,
      current_top = null,
      target_left = null,
      target_top = null,
      distance_left = null,
      distance_top = null;
    if (that.data.flag) {
      that.animation = wx.createAnimation();
      return new Promise((resolve, reject) => {
          that.setData({
            flag: false
          });
          resolve();
        })
        .then(() => {
          // 获取当前元素的坐标
          util.getDom(id)
            .then((rect) => {
              current_left = rect[0].left + rect[0].width / 2;
              current_top = rect[0].top + rect[0].height / 2;
            });
          return Promise.resolve();
        })
        .then(() => {
          // 获取终点元素的坐标
          return util.getDom('#cart')
            .then((rect) => {
              console.log(rect);
              distance_left = rect[0].left + rect[0].width / 2 - current_left;
              distance_top = rect[0].top + rect[0].height / 2 - current_top;
              console.log(current_left, current_top, rect[0].left, rect[0].top, distance_left, distance_top);

              that.animation.translateX(distance_left)
                .translateY(distance_top)
                .scale(0)
                .step();
              that.setData({
                animationIndex: event.currentTarget.dataset.index,
                [animation]: that.animation.export()
              });
              return Promise.resolve();
            });
        })
        .then(() => {
          // 回到初始化坐标
          setTimeout(function() {
            this.animations = wx.createAnimation({
              duration: 0,
              timingFunction: 'linear',
              success: function(res) {}
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
        })
        .then(() => {
          // 加入购物车
          let obj = {
            goodsId: that.data.goodsList.list[index].goodsId,
            organId: that.data.goodsList.list[index].organId,
            goodsSpecId: that.data.goodsList.list[index].goodsSpecId,
            goodsNum: 1
          }
          return app.cart.addUserCart(obj, true);
        })
        .then((data) => {
          let goodsList = app.globalData.goodsId || [];
          goodsList.push(that.data.goodsList.list[index].goodsId);
          app.setGlobalData('goodsId', goodsList);
          return Promise.resolve();
        })
        .then(that.cart_num)
        .then(app.refreshCartNum)
        .finally(() => {
          app.hideLoading();
        });
    }
  },

  // 搜索时添加商品后刷新店铺购物车
  refreshCart: function(res) {
    this.setData({
      shopping_cart: res.num,
      cart_shop_price: res.money
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this,
      top_distance = [];
    return util.getDom('.goods_l_list')
      .then((rect) => {
        rect.forEach((item) => {
          console.log(item)
          top_distance.push(item)
        });
        return Promise.resolve();
      })
      .then((rect) => {
        return util.getDom('.goods_l')
          .then((rect) => {
            that.setData({
              scroll_height: rect && rect.length > 0 ? rect[0].height : 0,
              top_distance: top_distance
            });
            return Promise.resolve();
          });
      })
      .then(() => {
        return util.getDom('.goods_r')
          .then((rect) => {
            that.setData({
              scrollHeight: rect && rect.length > 0 ? rect[0].height : 0
            });
            return Promise.resolve();
          });
      });
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
    this.pageQuery = null;
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