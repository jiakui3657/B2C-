// pages/classify/goods_detail/goods_detail.js
let util = require('../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgSrc: '',
    userInfo: {},
    showTop: 0,
    dialogVisible: false,
    arrowIcon: getApp().imgSrc + '/images/online/shop/confirm_order/go.png',
    specification_state: false,
    coupons_state: false,
    promotion_state: false,
    freight_state: false,
    instructions_state: false,
    goods_data: {},
    goodsAttrs: [],
    couponList: [],
    commentList: [],
    munitFristIndex: 0,
    munitLastIndex: 0,
    shop_price: '',
    shop_kill_price: '',
    shop_vip_price: '',
    defaultSpec: '',
    current: 0,
    swiperError: 0,
    shopping_cart: '',
    goodsSpecId: [],
    goods_spec_id: '',
    shop_num: 1,
    recommendList: [],
    stock: '',
    activityStock: '',
    singleNumber: '',
    actType: -1,
    shareState: '',
    navHeight: ''
  },

  // 返回上一层
  back: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  // 滑动轮播图
  sliding: function (event) {
    if (event.detail.source == "touch") {
      //当页面卡死的时候，current的值会变成0
      if (event.detail.current == 0) {
        let swiperError = this.data.swiperError
        swiperError += 1
        this.setData({ swiperError: swiperError })
        if (swiperError >= 3) {
          this.setData({ current: this.data.current });//，重置current为正确索引
          this.setData({ swiperError: 0 })
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

  // 跳转订单详情
  confirm_order: function (event) {
    let that = this, arr = [], goodsSpecId = '';

    // 获取规格id
    that.data.goods_data.goodsSpecList.forEach((item) => {
      if (item.isDefault == 1) {
        goodsSpecId = item.goodsSpecId;
      }
    })

    arr[0] = {
      goodsId: that.data.goods_data.goodsId,
      goodsSpecId: that.data.goods_spec_id,
      goodsNum: that.data.shop_num,
      organId: that.data.goods_data.organId
    }
    console.log(arr[0].goodsNum, that.data.stock);
    if (arr[0].goodsNum > that.data.stock || arr[0].goodsNum > that.data.singleNumber && arr[0].goodsNum > that.data.stock || that.data.goodsNum <= that.data.singleNumber && that.data.goodsNum > that.data.activityStock) {
      app.showToast({ title: '库存不足' });
    } else {
      wx.navigateTo({
        url: '/pages/cart/confirm_order/confirm_order?isCartOrder=0',
        success: function (res) {
          res.eventChannel.emit('acceptDataFromOpenerPage', { data: arr })
        }
      })
    }
    // } else {
    //   // 修改商品数量
    //   arr[0].goodsNum = that.data.stock;

    //   // 提示数量超出
    //   app.showToast({ title: '活动商品超过限购数量部分不参与结算' });

    //   setTimeout(() => {
    //     wx.navigateTo({
    //       url: '/pages/cart/confirm_order/confirm_order?isCartOrder=0',
    //       success: function (res) {
    //         res.eventChannel.emit('acceptDataFromOpenerPage', { data: arr })
    //       }
    //     })
    //   }, 2000)
    // }

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

  // 规格切换
  munitFirstToggle: function (event) {
    let that = this, list = [], idx = event.currentTarget.dataset.idx, index = event.currentTarget.dataset.index, staging = '';
    that.data.goodsAttrs[idx].values.forEach((item, i) => {
      if (item.isSelect = 1) {
        staging = i;
      }
    });

    that.data.goodsAttrs[idx].values.forEach((item, i) => {
      if (i == index) {
        item.isSelect = 1;
      } else {
        item.isSelect = 0;
      }
    });
    that.data.goodsAttrs.forEach((item) => {
      item.values.forEach((item) => {
        if (item.isSelect == 1) {
          list.push(item.valueId)
        }
      })
    });
    let str = list.join();
    let str1 = list.reverse();
    str1 = str1.join();
    that.data.goods_data.goodsSpecList.forEach((item) => {
      console.log(item.goodsAttrs, str, str1);
      if (item.goodsAttrs == str || item.goodsAttrs == str1) {
        if (item.stock >= 1) {
          that.setData({
            goods_spec_id: item.goodsSpecId,
            shop_price: item.price,
            shop_vip_price: item.vipPrice,
            shop_kill_price: item.actPrice,
            goodsAttrs: that.data.goodsAttrs,
            defaultSpec: item.attrsView,
            shop_num: 1,
            stock: item.stock,
            activityStock: item.activityStock,
            singleNumber: item.singleNumber,
            actType: item.actType,
            storkeNumber: item.storkeNumber
          })
        } else {
          app.showToast({ title: '该规格无库存' });
          that.data.goodsAttrs[idx].values.forEach((item, i) => {
            if (i == staging) {
              item.isSelect = 1;
            } else {
              item.isSelect = 0;
            }
          });
        }
      }
    });
  },
  getCouponList: function (goodsId) {
    let that = this;
    let params = {
      goodsId: goodsId
    };
    return app.activity.goodsCouponList(params)
      .then((data) => {
        console.log(data);
        let couponList = data.list;
        var reg = new RegExp("-", "g");
        couponList.forEach((item) => {
          item.getStartTime = item.getStartTime.split(' ')[0];
          item.getStartTime = item.getStartTime.replace(reg, ".");
          item.getEndTime = item.getEndTime.split(' ')[0];
          item.getEndTime = item.getEndTime.replace(reg, ".");
        });
        that.setData({
          couponList: couponList
        });
        return Promise.resolve();
      })
      .catch((e) => {
        console.error('商品详情-优惠券获取失败，goodsId=' + goodsId, e);
        return Promise.resolve();
      });
  },
  getCoupon: function (couponId) {
    let that = this;
    let params = {
      couponId: couponId
    };
    return app.activity.getCoupon(params)
      .then((data) => {
        let couponList = that.data.couponList;
        couponList.forEach((coupon) => {
          if (coupon.couponId == couponId) {
            coupon.isTake = 1;
            coupon.getNum = coupon.getNum + 1;
          }
        });

        that.setData({
          couponList: couponList
        });

        let obj = {
          title: '领取成功'
        };
        app.showToast(obj);
        return Promise.resolve();
      })
      .catch((e) => {
        console.error('商品详情-优惠券领取失败', e);
        let obj = {
          title: '领取失败'
        };
        app.showToast(obj);
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch((e) => {
        if (e) {
          console.error('商品详情-优惠券领取失败，couponId=' + couponId, e);
        }
        app.hideLoading();
        return Promise.resolve();
      });
  },
  // 跳转全部评论
  goods_evaluation: function () {
    let goodsId = this.data.goods_data.goodsId;
    wx.navigateTo({
      url: '/pages/classify/goods_evaluation/goods_evaluation?id=' + goodsId
    });
  },
  getCouponBtn: function (e) {
    let couponId = e.currentTarget.dataset.id;
    this.getCoupon(couponId);
  },
  // 打开规格模态框
  open_specification: function (e) {
    this.setData({
      specification_state: !this.data.specification_state
    });
  },

  // 打开优惠券模态框
  open_coupons: function () {
    this.setData({
      coupons_state: !this.data.coupons_state
    });
  },

  // 打开促销说明模态框
  open_promotion: function () {
    this.setData({
      promotion_state: !this.data.promotion_state
    });
  },

  // 打开运费说明模态框
  open_freight: function () {
    this.setData({
      freight_state: !this.data.freight_state
    });
  },

  open_instructions: function () {
    this.setData({
      instructions_state: !this.data.instructions_state
    });
  },

  // 关闭模态框
  close: function () {
    this.setData({
      specification_state: false,
      coupons_state: false,
      promotion_state: false,
      freight_state: false,
      instructions_state: false
    });
  },

  //跳转购物车
  go_cart: function () {
    wx.switchTab({
      url: '/pages/cart/index/index',
    })
  },

  // 收藏商品
  collection: function (event) {
    let that = this, isCollected = event.currentTarget.dataset.iscollected;
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

  // 跳转首页
  home: function () {
    wx.switchTab({
      url: '/pages/home/index/index'
    })
  },

  // 加入购物车
  add_cart: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        let params = {
          goodsId: that.data.goods_data.goodsId,
          organId: that.data.goods_data.organId,
          goodsSpecId: that.data.goods_spec_id,
          goodsNum: that.data.shop_num
        }
        return app.cart.addUserCart(params, true);
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
      .then(app.refreshCartNum)
      .then(() => {
        that.setData({
          shopping_cart: app.globalData.totalNumber
        })
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading);
  },

  toVip: function () {
    wx.navigateTo({
      url: '/pages/we/vip_club/index/index'
    });
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

    let that = this;
    that.pageQuery = options;

    // 商品id
    let id = that.pageQuery.id;
    let goodsSpecId = that.pageQuery.goodsSpecId;

    // 购物车的数量
    that.setData({
      userInfo: app.globalData.userInfo,
      shopping_cart: app.globalData.totalNumber,
      shareState: goodsSpecId ? 1 : ''
    });
    console.log(that.data.userInfo);

    app.showLoading()
      .then(() => {
        // 商品详情
        let obj = {
          goodsId: id
        };
        return app.goods.detail(obj);
      })
      .then((data) => {
        console.log('商品详情', data);
        
        // 说明格式转换
        if (data.labelName) {
          data.labelName = data.labelName.split(',');
        }
        
        if (data.describtion) {
          data.describtion = data.describtion.replace(/\<img/gi, '<img style="max-width:100%;height:auto;display:block;"');
          data.describtion = data.describtion.replace(/\<p/gi, '<p class="p"');
          data.describtion = data.describtion.replace(/\<p class="p"><img/gi, '<p class=""><img');
        }
        let Spec;
        if (goodsSpecId) {
          Spec = data.goodsSpecList.filter((item, index, arr) => item.goodsSpecId == goodsSpecId);
        } else {
          Spec = data.goodsSpecList.filter((item, index, arr) => item.isDefault == 1);
        }
        let str = Spec[0].goodsAttrs.split(',');

        if (Spec[0].actPrice > 0) {
          that.timeChange(Spec[0].actEndTime);
        }
        console.log(Spec[0]);
        that.setData({
          goods_data: data,
          goodsSpecId: str,
          goods_spec_id: Spec[0].goodsSpecId,
          shop_price: Spec[0].price || 0,
          shop_vip_price: Spec[0].vipPrice || 0,
          shop_kill_price: Spec[0].actPrice || 0,
          defaultSpec: Spec[0].attrsView.replace(",", "，"),
          stock: Spec[0].stock,
          actType: Spec[0].actType,
          storkeNumber: Spec[0].storkeNumber,
          singleNumber: Spec[0].singleNumber,
        });

        // 查询推荐商品
        let params = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        }
        app.goods.recommendList(params)
          .then(data => {
            that.setData({
              recommendList: data.list
            });
          });

        return Promise.resolve();
      })
      .then(() => {
        // 商品规格
        let params = {
          goodsId: id
        };
        return app.goods.goodsSpecAttr(params);
      })
      .then((data) => {
        console.log('商品规格属性', data);
        if (data.goodsAttrs && data.goodsAttrs.length > 0) {
          data.goodsAttrs.forEach((item) => {
            item.values.forEach((item) => {
              if (that.data.goodsSpecId.indexOf(item.valueId) == -1) {
                item.isSelect = 0
              } else {
                item.isSelect = 1
              }
            });
          });
        }

        that.setData({
          goodsAttrs: data.goodsAttrs
        });
        return Promise.resolve();
      })
      .then(() => {
        if (that.data.shareState == 1) {
          let params = {
            shareId: that.pageQuery.id,
            type: 1,
            shareUserId: that.pageQuery.shareUserId
          }
          return app.user.getIntegralByShare(params)
        }
        return Promise.resolve();
      })
      .then((data) => {
        console.log(data);
        return Promise.resolve();
      })
      .then(that.saveGoodsVisitRecord(id))
      .then(that.getCouponList(id))
      .then(() => {
        let params = {
          goodsId: id,
          pageIndex: 1,
          pageSize: 1
        };
        return app.goods.commentList(params);
      })
      .then((data) => {
        that.setData({
          commentList: data.list
        });
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading);
  },
  saveGoodsVisitRecord: function (goodsId) {
    let param = {
      footId: goodsId,
      type: 1
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

  // 数量加
  add: function () {
    this.data.shop_num = util.add(this.data.shop_num, 1);

    this.setData({
      shop_num: this.data.shop_num
    });
  },

  // 数量减
  reduction: function () {
    if (this.data.shop_num > 1) {
      this.data.shop_num = util.sub(this.data.shop_num, 1);

      this.setData({
        shop_num: this.data.shop_num
      });
    }
  },

  //其他商品详情页面
  goodsDetail: function (event) {
    let id = event.currentTarget.dataset.goodsid;
    wx.redirectTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id
    });
  },

  // 自定义数字
  get_number: function (event) {
    let value = event.detail.value > 0 ? event.detail.value : 1;
    this.data.shop_num = value;

    this.setData({
      shop_num: this.data.shop_num
    });
  },
  //转发
  onShareAppMessage: function (res) {
    let that = this;
    let imgUrl;
    if (that.data.goods_data.imgList && that.data.goods_data.imgList.length > 0) {
      imgUrl = that.data.goods_data.imgList[0];
    }

    let shareObj = {
      path: '/pages/classify/goods_detail/goods_detail?id=' + that.data.goods_data.goodsId + '&goodsSpecId=' + that.data.goods_spec_id,
      title: that.data.goods_data.goodsName,
      imageUrl: imgUrl,
      success: function (res) {
        // 转发成功之后的回调
        if (res.errMsg == 'shareAppMessage:ok') {
        }
      },
      fail: function () {
        // 转发失败之后的回调
        if (res.errMsg == 'shareAppMessage:fail cancel') {
          // 用户取消转发
        } else if (res.errMsg == 'shareAppMessage:fail') {
          // 转发失败，其中 detail message 为详细失败信息
        }
      }
    };
    return shareObj;
  },

  // 倒计时时间
  lightningActivityTimeInterval: null,
  timeChange: function (endtime) {
    let that = this;
    return app.getServerTime()
      .catch(() => {
        return Promise.resolve(new Date().Format('yyyy-MM-dd hh:mm:ss'));
      })
      .then((serverTime) => {
        let startTime = new Date(serverTime.replace(/-/g, '/'));
        let endTime = new Date(endtime.replace(/-/g, '/'));
        let time = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        console.log(startTime, endTime, time);
        let date = util.time(time);
        that.data.failure = time > 0 ? false : true;
        console.log(date);

        that.setData({
          time: date
        });

        that.lightningActivityTimeInterval = setInterval(function () {
          if (time > 0) {
            time = time - 1;
            date = util.time(time);
            that.setData({
              time: date
            });
          } else {
            that.setData({
              failure: true
            });
            clearInterval(that.lightningActivityTimeInterval);
          }
        }, 1000);
      });
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
    this.pageQuery = null;
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
  // onShareAppMessage: function () {

  // }
})