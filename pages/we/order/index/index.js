// pages/we/we_order/we_order.js
let app = getApp()
let util = require('../../../../utils/util.js');
let initializeTime = '',
  allTime = '';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    // tab切换  
    currentTab: 0,
    currentTabCasual: 0,
    //全部
    good: {},
    //待付款
    good2: {},
    //待收货
    good3: {},
    //待提货
    good4: {},
    //已完成
    good5: {},
    //是否是从订单分类进入的
    fromOrderCategory: false
  },

  //点击tab切换
  swichNav: function(e) {
    var that = this;
    that.setData({
      currentTab: e.target.dataset.current
    });
  },

  // 删除列表
  del: function(event) {
    let that = this;
    wx.showModal({
      title: '确认删除此订单?',
      content: '删除后，订单将不可恢复',
      cancelColor: '#101010',
      confirmColor: '#FF474C',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          app.showLoading()
            .then(() => {
              // 删除订单
              let params = {
                orderNo: event.currentTarget.dataset.orderno
              };
              return app.order.orderDelete(params, true);
            })
            .then((res) => {
              if (that.data.currentTab == 4) {
                console.log(event.currentTarget.dataset.index);
                that.data.good5.list.splice(event.currentTarget.dataset.index, 1);
              } else if (that.data.currentTab == 0) {
                that.data.good.list.splice(event.currentTarget.dataset.index, 1);
              }
              that.setData({
                good5: that.data.good5,
                good: that.data.good
              });
              return Promise.resolve();
            })
            .then(() => {
              app.hideLoading();
            });
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },

  // 时间转换
  time: function(startTime, endTime) {
    let time = (startTime.getTime() - endTime.getTime()) / 1000;
    let hours = Math.floor(n / 3600);
    let minutes = Math.floor(n / 60);
    let seconds = n % 60;
    return {
      hours,
      minutes,
      seconds
    };
  },

  // 跳转物流
  logistics: function() {
    wx.navigateTo({
      url: '../logistics/logistics'
    });
  },

  // 确认收货
  takeGood: function(event) {
    console.log(event);
    let that = this,
      index = event.currentTarget.dataset.index;
    wx.showModal({
      title: '',
      content: '请确认你已收到商品',
      cancelColor: '#101010',
      confirmColor: '#FF474C',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          app.showLoading()
            .then(() => {
              // 确认收货
              let params = {
                orderNo: event.currentTarget.dataset.orderno
              };
              return app.order.orderReceive(params, true);
            })
            .then((data) => {
              app.showToast({
                title: '确认收货成功',
                icon: 'success'
              });
              setTimeout(() => {
                that.onLoad({
                  order_code: 3
                });
                that.setData({
                  currentTab: 3
                });
              }, 2000)
              return Promise.resolve();
            })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },

  // 待付款
  payment: function(event) {
    let that = this,
      orderNo = event.currentTarget.dataset.orderno;
    // ../order_pay/order_pay
    console.log(orderNo);
    if (app.globalData.userInfo.walletId == undefined || app.globalData.userInfo.walletId == '') {
      wx.navigateTo({
        url: '/pages/register/register'
      })
    } else {
      app.showLoading()
        .then(() => {
          // 下订单
          let params = {
            orderNo: orderNo
          };
          return app.order.pay(params, true);
        })
        .then((data) => {
          // 订单支付
          console.log(data);
          // let pay = JSON.parse(data);
          return app.pay(data.pay_info);
        })
        .then((res) => {
          console.log(res);

          that.onLoad({
            order_code: that.data.currentTab
          });
          wx.navigateTo({
            url: '/pages/cart/order_success/order_success?price=' + event.currentTarget.dataset.price + '&orderNo=' + orderNo + '&orderState=' + event.currentTarget.dataset.logisticsType
          });
        })
        .catch((res) => {
          console.log(res);
          app.hideLoading();
        })
        .then(() => {
          app.hideLoading();
        })
    }
  },

  // 再次购买
  order_place: function(event) {
    let that = this,
      orderNo = event.currentTarget.dataset.orderno;
    // ../order_pay/order_pay
    console.log(orderNo);
    app.showLoading()
      .then(() => {
        // 下订单
        let params = {
          orderNo: orderNo
        };
        return app.cart.addUserCart(params, true);
      })
      .then((res) => {
        console.log(res);
        wx.switchTab({
          url: '/pages/cart/index/index'
        });
        return Promise.resolve(res);
      })
      .then(() => {
        app.hideLoading();
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成--计算无限加载滚动的高度
   */

  onReady: function() {
    var that = this;
    var query = wx.createSelectorQuery().in(this);
    query.select('.order_Content').boundingClientRect();
    query.exec(res => {
      var searchHeight = res[0].height;
      var windowHeight = wx.getSystemInfoSync().windowHeight;
      var scrollHeight = windowHeight - searchHeight + 40;
      this.setData({
        scrollHeight: scrollHeight
      });
    });
  },

  //滑动切换tab 
  bindChange: function(e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });

    // if (this.data.fromOrderCategory) {
    //   this.data.fromOrderCategory = false;
    //   return;
    // }
    if (this.data.currentTab == 0 && JSON.stringify(this.data.good) == '{}') {
      this.loadAll();
    } else if (this.data.currentTab == 1 && JSON.stringify(this.data.good2) == '{}') {
      this.loadToPay();
    } else if (this.data.currentTab == 2 && JSON.stringify(this.data.good3) == '{}') {
      this.loadToDelivery();
    } else if (this.data.currentTab == 3 && JSON.stringify(this.data.good4) == '{}') {
      this.loadToReceive();
    } else if (this.data.currentTab == 4 && JSON.stringify(this.data.good5) == '{}') {
      this.loadToTake();
    }
  },

  lower: function() {
    let that = this;
    if (that.data.currentTab == 0 && that.data.good.pageIndex < that.data.good.pageCount) {
      clearInterval(allTime);
      let pageIndex = that.data.good.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 获取订单列表 -- 全部
          let params = {
            logisticsState: '',
            payState: '',
            orderState: '',
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };
          return app.order.orderList(params);
        })
        .then((data) => {
          console.log(data);
          that.data.good.pageIndex = pageIndex;
          that.data.good.list = util.cycle(data.list, that.data.good.list);

          // 初始化待付款时间
          that.data.good.list.forEach((item) => {
            let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
            startTime = new Date(startTime.replace(/-/g, '/'));
            let endTime = new Date(item.expireTime.replace(/-/g, '/'));
            let seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            if (seconds >= 0) {
              let time = util.time(seconds);
              item.time = time;
            } else {
              item.time = false
            }
          })

          allTime = setInterval(() => {
            that.data.good.list.forEach((item) => {
              let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
              startTime = new Date(startTime.replace(/-/g, '/'));
              let endTime = new Date(item.expireTime.replace(/-/g, '/'));
              let seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
              if (seconds >= 0) {
                let time = util.time(seconds);
                item.time = time;
              } else {
                item.time = false;
              }
            })
            that.setData({
              good: that.data.good
            })
          }, 1000)

          that.setData({
            good: that.data.good
          });
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
    } else if (that.data.currentTab == 1 && that.data.good2.pageIndex < that.data.good2.pageCount) {
      clearInterval(initializeTime);
      let pageIndex = that.data.good2.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 获取订单列表 -- 待付款
          let params = {
            payState: 0,
            orderState: 1,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };
          return app.order.orderList(params);
        })
        .then((data) => {
          console.log(data);
          that.data.good2.pageIndex = pageIndex;
          that.data.good2.list = util.cycle(data.list, that.data.good2.list);

          // 初始化待付款时间
          that.data.good2.list.forEach((item) => {
            let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
            startTime = new Date(startTime.replace(/-/g, '/'));
            let endTime = new Date(item.expireTime.replace(/-/g, '/'));
            let seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            if (seconds >= 0) {
              let time = util.time(seconds);
              item.time = time;
            } else {
              item.time = false
            }
          })

          initializeTime = setInterval(() => {
            that.data.good2.list.forEach((item) => {
              let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
              startTime = new Date(startTime.replace(/-/g, '/'));
              let endTime = new Date(item.expireTime.replace(/-/g, '/'));
              let seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
              if (seconds >= 0) {
                let time = util.time(seconds);
                item.time = time;
              } else {
                item.time = false
              }
            })
            that.setData({
              good2: that.data.good2
            })
          }, 1000)

          that.setData({
            good2: that.data.good2
          });
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
    } else if (that.data.currentTab == 2 && that.data.good3.pageIndex < that.data.good3.pageCount) {
      let pageIndex = that.data.good3.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 获取订单列表 -- 待收货
          let params = {
            logisticsState: 0,
            payState: 1,
            orderState: 1,
            logisticsType: [1, 2],
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };
          return app.order.orderList(params)
        })
        .then((data) => {
          console.log(data);
          that.data.good3.pageIndex = pageIndex;
          that.data.good3.list = util.cycle(data.list, that.data.good3.list);
          that.setData({
            good3: that.data.good3
          });
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
    } else if (that.data.currentTab == 3 && that.data.good4.pageIndex < that.data.good4.pageCount) {
      let pageIndex = that.data.good4.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 获取订单列表 -- 待收货
          let params = {
            logisticsState: 1,
            payState: 1,
            orderState: 1,
            logisticsType: [3],
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };
          return app.order.orderList(params);
        })
        .then((data) => {
          console.log(data);
          that.data.good4.pageIndex = pageIndex;
          that.data.good4.list = util.cycle(data.list, that.data.good4.list);
          that.setData({
            good4: that.data.good4
          });
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
    } else if (that.data.currentTab == 4 && that.data.good5.pageIndex < that.data.good5.pageCount) {
      let pageIndex = that.data.good4.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 获取订单列表 -- 待提货
          let params = {
            logisticsState: 1,
            payState: 1,
            orderState: 1,
            logisticsType: [3],
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };
          return app.order.orderList(params);
        })
        .then((data) => {
          console.log(data);
          that.data.good5.pageIndex = pageIndex;
          that.data.good5.list = util.cycle(data.list, that.data.good5.list);
          that.setData({
            good5: that.data.good5
          });
          return Promise.resolve();
        })
        .then(() => {
          app.hideLoading();
        })
    }
  },

  // 上拉加载回调接口
  onReachBottom: function() {},

  // 倒计时时间
  lightningActivityTimeInterval: null,
  timeChange: function(endtime) {
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

        that.lightningActivityTimeInterval = setInterval(function() {
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
            console.log('time parse failed')
            clearInterval(that.lightningActivityTimeInterval);
          }
        }, 1000);
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    console.log(options);
    let that = this;

    // 清理定时器
    clearInterval(initializeTime);
    clearInterval(allTime);
    // if (options.order_code) {
    //   this.data.fromOrderCategory = true;
    // }
    that.setData({
      currentTab: options.order_code ? options.order_code : 0
    });

    if (that.data.currentTab == 0) {
      this.loadAll();
    } else if (that.data.currentTab == 1) {
      this.loadToPay();
    } else if (that.data.currentTab == 2) {
      this.loadToDelivery();
    } else if (that.data.currentTab == 3) {
      this.loadToReceive();
    } else if (that.data.currentTab == 4) {
      this.loadToTake();
    }
  },

  loadAll: function() {
    let that = this;
    app.showLoading()
      .then(() => {
        // 获取订单列表 -- 全部
        let params = {
          logisticsState: '',
          payState: '',
          orderState: '',
          pageIndex: 1,
          pageSize: app.pageSize
        };
        return app.order.orderList(params);
      })
      .then((data) => {
        console.log(data);

        // 初始化待付款时间
        data.list.forEach((item) => {
          let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
          startTime = new Date(startTime.replace(/-/g, '/'));
          let endTime = new Date(item.expireTime.replace(/-/g, '/'));
          let seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
          if (seconds >= 0) {
            let time = util.time(seconds);
            item.time = time;
          } else {
            item.time = false;
          }
        })

        allTime = setInterval(() => {
          data.list.forEach((item) => {
            let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
            startTime = new Date(startTime.replace(/-/g, '/'));
            let endTime = new Date(item.expireTime.replace(/-/g, '/'));
            let seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            if (seconds >= 0) {
              let time = util.time(seconds);
              item.time = time;
            } else {
              item.time = false
            }
          })
          that.setData({
            good: data
          })
        }, 1000)

        that.setData({
          good: data
        });
        return Promise.resolve();
      }).then(() => {
        app.hideLoading();
      })
  },

  loadToPay: function() {
    let that = this;
    app.showLoading()
      .then(() => {
        // 获取订单列表 -- 待付款
        let params = {
          payState: 0,
          orderState: 1,
          pageIndex: 1,
          pageSize: app.pageSize
        };
        return app.order.orderList(params)
      })
      .then((res) => {
        console.log(res);

        // 初始化待付款时间
        res.list.forEach((item) => {
          let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
          startTime = new Date(startTime.replace(/-/g, '/'));
          let endTime = new Date(item.expireTime.replace(/-/g, '/'));
          let seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
          if (seconds >= 0) {
            let time = util.time(seconds);
            item.time = time;
          } else {
            item.time = false
          }
        })

        initializeTime = setInterval(() => {
          res.list.forEach((item) => {
            let startTime = new Date().Format('yyyy-MM-dd hh:mm:ss');
            startTime = new Date(startTime.replace(/-/g, '/'));
            let endTime = new Date(item.expireTime.replace(/-/g, '/'));
            let seconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
            if (seconds >= 0) {
              let time = util.time(seconds);
              item.time = time;
            } else {
              item.time = false
            }
          })
          that.setData({
            good2: res
          })
        }, 1000)

        that.setData({
          good2: res
        })
        return Promise.resolve();
      }).then(() => {
        app.hideLoading();
      })
  },

  loadToDelivery: function() {
    let that = this;
    app.showLoading()
      .then(() => {
        // 获取订单列表 -- 待发货
        let obj = {
          logisticsState: 0,
          payState: 1,
          orderState: 1,
          logisticsType: [1, 2],
          pageIndex: 1,
          pageSize: app.pageSize
        }
        return app.order.orderList(obj)
      })
      .then((data) => {
        console.log(data)
        that.setData({
          good3: data
        });
        return Promise.resolve();
      }).then(() => {
        app.hideLoading();
      })
  },

  loadToReceive: function() {
    let that = this;
    app.showLoading()
      .then(() => {
        // 获取订单列表 -- 待收货
        let params = {
          logisticsState: 1,
          payState: 1,
          orderState: 1,
          logisticsType: [1, 2],
          pageIndex: 1,
          pageSize: app.pageSize
        };
        return app.order.orderList(params)
      })
      .then((data) => {
        console.log(data)
        that.setData({
          good4: data
        });
        return Promise.resolve();
      }).then(() => {
        app.hideLoading();
      })
  },

  loadToTake: function() {
    let that = this;
    app.showLoading().then(() => {
        // 获取订单列表 -- 待提货
        let params = {
          logisticsState: 1,
          payState: 1,
          orderState: 1,
          logisticsType: [3],
          pageIndex: 1,
          pageSize: app.pageSize
        };
        return app.order.orderList(params)
      })
      .then((data) => {
        console.log(data)
        that.setData({
          good5: data
        });
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
      })
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
    clearInterval(initializeTime);
    clearInterval(allTime);
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