// pages/home/index/index.js
let util = require('../../../utils/util.js');
let map = require('../../../utils/mapUtil.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgSrc: app.imgSrc,
    lightningActivity: {},
    goodsList: {},
    shopList: [],
    ads: {},
    quickList: [{
        url: '../../classify/index/index',
        src: app.imgSrc+'/images/test/leisure.png',
        text: '休闲零食'
      },
      {
        url: '../../classify/index/index',
        src: app.imgSrc +'/images/test/fresh.png',
        text: '品质生鲜'
      }, {
        url: '../../classify/index/index',
        src: app.imgSrc +'/images/test/drinks.png',
        text: '酒水饮料'
      },
      {
        url: '../../classify/index/index',
        src: app.imgSrc +'/images/test/beauty_makeup.png',
        text: '美妆个护'
      },
      {
        url: '../../classify/index/index',
        src: app.imgSrc +'/images/test/maternal.png',
        text: '母婴保健'
      },
      {
        url: '/pages/home/circle/index/index',
        src: app.imgSrc +'/images/test/grass.png',
        text: '好物种草'
      },
      {
        url: '../welfare/index/index?index=2',
        src: app.imgSrc +'/images/test/spell_group.png',
        text: '低价拼团'
      },
      {
        url: '../welfare/index/index?index=0',
        src: app.imgSrc +'/images/test/vouchers.png',
        text: '领券中心'
      },
      {
        url: '/pages/we/vip_club/index/index',
        src: app.imgSrc +'/images/test/vip.png',
        text: '会员生活'
      },
      {
        url: '/pages/we/awarded/index/index',
        src: app.imgSrc +'/images/test/prize.png',
        text: '天天有奖'
      }
    ],
    goodsGroupList: [],
    goodsGroupIndex: 0,
    goodsGroupId: '',
    scrollTop: 0,
    scrollCode: true,
    seckill_current: 0,
    indicatorIndex: 0,
    searchCode: false,
    coordinates: {
      x: 0,
      y: 0
    },
    scrollWidth: 0,
    left_distance: [],
    scroll_left: 0,
    flag: true,
    animationList: [],
    animationIndex: 0,
    coupons: {},
    welfare_state: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.setData({
		  imgSrc: app.imgSrc,
      welfare_state: app.welfare_state
		});
    let that = this;
    map.initQQMapSDK();
    app.getLocation()
      //.then(app.showLoading)
      // .then(app.refreshUserInfo)
      .then(() => {
        that.loadAllAds();
        that.loadlightningActivity();
        that.recommendShop();
        app.hotwordList();
        return Promise.resolve();
      })
      .then(that.getGroupList)
      .then(() => {
        console.log('****goodsGroupList', that.data.goodsGroupList);
        if (!that.data.goodsGroupList || that.data.goodsGroupList.length == 0) {
          return Promise.resolve();
        }
        let groupId = that.data.goodsGroupList[0].id;
        let pageIndex = that.data.goodsList && that.data.goodsList[groupId] && that.data.goodsList[groupId].pageIndex;
        return that.getGoodsList(groupId, pageIndex);
      })
      .then(() => {
        // 获取商品分类距离顶部的高
        // let rect = util.getDom('#box')
        // return rect.then(function (value) {
        //   if (!value || value.length == 0) {
        //     return;
        //   }

          // that.setData({
          //   scrollTop: value[0].top - 46
          // }); 
        // });

        map.locationToAddress(app.longitude, app.latitude).then(res => {
          app.city = res.city.substr(0, 2);
          that.setData({
            city: app.city
          })
        })

        return Promise.resolve();
      })
      .then(that.get_welfare)
      .then(() => {
        that.onReady();
        app.hideLoading();
        wx.stopPullDownRefresh();
      })
      .catch(() => {
        app.hideLoading();
        wx.stopPullDownRefresh();
      });
  },
  onLoad1: function(options) {
    let that = this;
    app.getLocation()
      .then(() => {
        // 获取商品分类距离顶部的高
        let rect = util.getDom('#box')
        return rect.then(function(value) {
          if (!value || value.length == 0) {
            return;
          }

          that.setData({
            scrollTop: value[0].top - 46
          });
          return Promise.resolve();
        });
      })
      //.then(app.showLoading)
      // .then(app.refreshUserInfo)
      .then(that.loadAllAds)
      .then(that.loadlightningActivity)
      .then(that.recommendShop)
      .then(that.getGroupList)
      .then(() => {
        console.log('****goodsGroupList', that.data.goodsGroupList);
        if (!that.data.goodsGroupList || that.data.goodsGroupList.length == 0) {
          return Promise.resolve();
        }
        let groupId = that.data.goodsGroupList[0].id;
        let pageIndex = that.data.goodsList && that.data.goodsList[groupId] && that.data.goodsList[groupId].pageIndex;
        return that.getGoodsList(groupId, pageIndex);
      })
      .then(that.onReady)
      .then(app.hotwordList)
      .finally(() => {
        app.hideLoading();
        wx.stopPullDownRefresh();
      });
  },

  // 获取新客福利
  get_welfare: function () {
    if (wx.getStorageSync("showCoupon") == 1){
      return Promise.resolve();
    }
    
    let that = this;
    let params = {
      site: 0
    }
    return app.activity.getNewConsumerCoupon(params)
      .then((data) => {
        that.setData({
          coupons: data
        })
        if(data.state == 1){
          wx.setStorage({
            key: 'showCoupon',
            data: '1',
          })
        }
        return Promise.resolve();
      })
      .catch(() => {
        return Promise.resolve();
      })
  },

  // 关闭新客福利
  close: function () {
    let up = 'coupons.state';
    app.welfare_state = false;
    this.setData({
      [up]: 0
    })
  },

  // 跳转优惠券
  coupons: function () {
    this.close();
    wx.navigateTo({
      url: '/pages/we/coupons/index/index',
    })
  },

  recommendShop: function() {
    let that = this;
    let params = {
      longitude: app.longitude,
      latitude: app.latitude,
      pageIndex: 1,
      pageSize: app.pageSize
    };
    return app.shop.list(params)
      .then((data) => {

        // 修改距离的单位
        data.list.forEach((item) => {
          if (item.distance >= 1000) {
            let num = item.distance / 1000;
            item.distance = num.toFixed(1);
            item.distance = item.distance + 'km'
          } else {
            item.distance = item.distance + 'm';
          }
        })

        that.setData({
          shopList: data.list
        });
        return Promise.resolve();
      })
      .catch((e) => {
        console.error("加载推荐商户出错", e);
        return Promise.resolve();
      });
  },

  //接受商品列表组件传的购物车的数量
  // get_cart_num: function (res) {
  //   // app.refreshCartNum();
  // },

  // 秒杀活动加入购物车
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

    that.animation = wx.createAnimation();

    if (that.data.flag) {
      return new Promise((resolve, reject) => {
          that.setData({
            flag: false
          });
          console.log('-----111-----');
          resolve();
        })
        .then(() => {
          // 获取当前元素的坐标
          util.getDom(id).then((rect) => {
            current_left = rect[0].left + rect[0].width / 2;
            current_top = rect[0].top + rect[0].height / 2;
          });
          console.log('-----222-----');
          return Promise.resolve();
        })
        .then(() => {
          // 获取终点元素的坐标
          return util.getDom('#target')
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
          console.log('-----333-----');
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
            console.log('-----444-----');
          }, 400);
        })
        .then(() => {
          // 加入购物车
          let obj = {
            goodsId: that.data.lightningActivity.goods[index].goodsId,
            organId: that.data.lightningActivity.goods[index].organId,
            goodsSpecId: that.data.lightningActivity.goods[index].goodsSpecId,
            goodsNum: 1
          }
          return app.cart.addUserCart(obj,true);
        })
        .then((data) => {
          let goodsList = app.globalData.goodsId || [];
          goodsList.push(that.data.lightningActivity.goods[index].goodsId);
          app.setGlobalData('goodsId', goodsList);
          return Promise.resolve();
        })
        .then(that.cart_num)
        .then(app.refreshCartNum)
        .then(app.hideLoading);
    }
  },

  // 跳转商品详情
  goods_detail: function(event) {
    let id = event.currentTarget.id;
    let goodsSpecId = event.currentTarget.dataset.goods_spec_id;
    wx.navigateTo({
      url: '/pages/classify/goods_detail/goods_detail?id=' + id + '&goodsSpecId=' + goodsSpecId
    });
  },

  // 跳转商家详情
  store_details: function(event) {
    let shopId = event.currentTarget.id;
    wx.navigateTo({
      url: '/pages/near/shop/shop?id=' + shopId
    });
  },

  // 跳转闪电购
  seckill: function() {
    wx.navigateTo({
      url: '/pages/home/welfare/index/index?index=1'
    });
  },

  // 获取banner轮播图的索引
  get_banner: function(event) {
    this.setData({
      indicatorIndex: event.detail.current
    });
  },

  // 获取秒杀商品轮播图的索引
  get_current: function(event) {
    this.setData({
      seckill_current: event.detail.current
    })
  },

  // 更多店铺
  moreShop: function() {
    wx.switchTab({
      url: '/pages/near/index/index',
    })
  },

  loadAllAds: function() {
    let that = this;
    let positionCodes = "C_INDEX_BANNER,C_INDEX_POPUP,C_INDEX_CENTER,C_INDEX_TOPLEFT,C_INDEX_TOPRIGHT,C_INDEX_LOWERLEFT,C_INDEX_LOWERRIGHT,C_INDEX_VIP,C_COUPON";
    return that.loadBatchAds(positionCodes);
  },

  loadAdsByCode: function(positionCode) {
    let that = this;
    let params = {
      positionCode: positionCode,
      latitude: app.latitude,
      longitude: app.longitude
    };
    return app.other.bannerList(params)
      .then((data) => {
        let key = "ads." + positionCode;
        that.setData({
          [key]: data.list
        });
        return Promise.resolve(data.list);
      })
      .catch((e) => {
        console.error("加载广告出错", e);
        return Promise.resolve();
      });
  },

  loadBatchAds: function(positionCodes) {
    let that = this;
    let params = {
      positionCode: positionCodes,
      latitude: app.latitude,
      longitude: app.longitude
    };
    return app.other.batchBannerList(params)
      .then((data) => {
        that.setData({
          ads: data
        });
        return Promise.resolve(data);
      })
      .catch((e) => {
        console.error("加载广告出错", e);
        return Promise.resolve();
      });
  },
  /**
   * 加载闪电购活动
   */
  loadlightningActivity: function() {
    var that = this;
    let params = {
      areaId: app.areaId
    };
    return app.activity.proceedFlashActivity(params)
      .then((data) => {
        if (data) {
          that.setData({
            lightningActivity: data
          });
          console.log('time', data)
          if (data && data.endTime) {
            that.timeChange(data.endTime);
            return Promise.resolve(data);
          } else {
            return Promise.resolve();
          }
        } else {
          return Promise.resolve();
        }
      })
      .catch((e) => {
        console.error("加载闪电购活动出错", e);
        return Promise.resolve();
      });
  },

  // 获取底部分类
  getGroupList: function() {
    var that = this;
    let params = {
      areaId: app.areaId,
      site: 3
    };
    return app.goods.groupList(params)
      .then((data) => {
        console.log("group:", data);
        if (data) {
          if (data.list && data.list.length > 0) {
            that.setData({
              goodsGroupList: data.list,
              goodsGroupId: data.list[0].id
            });
          }
          return Promise.resolve(data);
        } else {
          return Promise.resolve();
        }
      })
      .catch((e) => {
        console.error("加载底部分类出错", e);
        return Promise.resolve();
      });
  },

  // 获取底部商品
  getGoodsList: function(groupId, pageIndex) {
    var that = this;
    pageIndex = pageIndex || 1;
    if (pageIndex == 1) {
      that.data.goodsList[groupId] = [];
    }
    let goodsRs = that.data.goodsList[groupId] || {};
    if (goodsRs.pageCount == 0 || pageIndex > goodsRs.pageCount) {
      return Promise.resolve();
    }

    return new Promise(function(resolve, reject){
      app.showLoading()
        .then(() => {
          let params = {
            groupId: groupId,
            areaId: app.areaId,
            pageIndex: pageIndex || 1,
            pageSize: app.pageSize
          };
          return app.goods.list(params)
        })
        .then((data) => {
          if (data) {
            data.list = util.cycle(data.list, goodsRs.list || []);
            let key = "goodsList." + groupId;
            that.setData({
              [key]: data
            });
            resolve();
          } else {
            resolve();
          }
        })
        .catch((e) => {
          console.error("加载底部商品出错", e);
          resolve();
        });
    });
  },

  add: function() {
    let that = this
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      success(res) {
        if (res.tapIndex === 0) {
          wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album'],
            success(res) {
              const tempFilePaths = res.tempFilePaths;
              console.log(tempFilePaths);
              if (res.errMsg == "chooseImage:ok") {
                util.upload('/consumer/order/orderShareImgUpload', tempFilePaths);
              }
            }
          })
        } else {
          wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['camera'],
            success(res) {
              const tempFilePaths = res.tempFilePaths;
              console.log(tempFilePaths);
            }
          })
        }
      },
      fail(res) {
        console.log(res.errMsg);
      }
    })
  },

  goodsGroupToggle: function(e) {
    console.log(e);
    let that = this;
    let index = e.currentTarget.dataset.index;
    let left_distance = that.data.left_distance;
    if (!left_distance || left_distance.length == 0) {
      return;
    }

    let groupId = left_distance[index].id,
      item_left = left_distance[index].left,
      item_width = left_distance[index].width,
      scrollWidth = scrollWidth;
    let distance = item_left - (scrollWidth / 2 - item_width / 2);
    let pageIndex = that.data.goodsList && that.data.goodsList[groupId] && that.data.goodsList[groupId].pageIndex;
    

    that.getGoodsList(groupId, pageIndex)
      .then(() => {
        that.setData({
          goodsGroupIndex: index,
          scroll_left: distance,
          goodsGroupId: groupId
        });
        return Promise.resolve();
      })
      .then(app.hideLoading);
  },

  // onPageScroll: function(e) {
  //   let that = this

  //   // 判断滚动距离和推荐商品tab的位置
  //   if (e.scrollTop >= that.data.scrollTop) {
  //     that.setData({
  //       scrollCode: false
  //     });
  //   } else {
  //     that.setData({
  //       scrollCode: true
  //     });
  //   }

  //   // 判断滚动的距离
  //   if (e.scrollTop >= 1) {
  //     that.setData({
  //       searchCode: true
  //     });
  //   } else {
  //     that.setData({
  //       searchCode: false
  //     });
  //   }
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this,
      left_distance = [];
    return util.getDom('.goodsGroupList')
      .then((rect) => {
        rect.forEach((item) => {
          left_distance.push(item);
        });
        return Promise.resolve();
      })
      .then((rect) => {
        return util.getDom('.box')
          .then((rect) => {
            console.log(rect);
            if (rect && rect.length > 0) {
              that.setData({
                scrollWidth: rect[0].width,
                left_distance: left_distance
              });
            }
            return Promise.resolve();
          });
      })
      .then(() => {
        return util.getDom('.target')
          .then((rect) => {
            console.log(rect);
            let coordinatesX = 'coordinates.x',
              coordinatesY = 'coordinates.y';
            that.setData({
              [coordinatesX]: rect[0].left + rect[0].width / 2,
              [coordinatesY]: rect[0].top + rect[0].height / 2
            });
            return Promise.resolve();
          });
      });
  },
  // 倒计时时间
  lightningActivityTimeInterval: null,
  timeChange: function(endtime) {
    let that = this;
    return app.getServerTime()
      .catch(() => {
        return Promise.resolve(new Date().Format('yyyy-MM-dd hh:mm:ss'));
      })
      .then((serverTime) => {
        let startTime = new Date(serverTime.replace(/-/g,'/'));
        let endTime = new Date(endtime.replace(/-/g,'/'));
        let time = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        console.log(startTime, endTime, time);
        let date = util.time(time);
        that.data.failure = time > 0 ? false : true;

        that.lightningActivityTimeInterval = setInterval(function() {
          if (time > 0) {
            time = time - 1;
            date = util.time(time);
            that.setData({
              time: date
            });
          } else {
            that.setData({
              failure: true,
              lightningActivity:''
            });
            console.log('time parse failed')
            clearInterval(that.lightningActivityTimeInterval);
          }
        }, 1000);
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.onLoad();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    if (!that.data.goodsGroupList || that.data.goodsGroupList.length == 0) {
      return Promise.resolve();
    }

    let groupId = that.data.goodsGroupList[that.data.goodsGroupIndex].id;
    let pageIndex = that.data.goodsList && that.data.goodsList[groupId] && that.data.goodsList[groupId].pageIndex;
    pageIndex = pageIndex + 1;
    return that.getGoodsList(groupId, pageIndex)
      .finally(app.hideLoading);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function(res) {
  }
})