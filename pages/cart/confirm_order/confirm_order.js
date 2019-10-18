// pages/cart/index/index.js
let util = require('../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    discountType: 1,
    discountDialogVisible: false,
    coupons_state: false,
    deliverType: [{
        type: 3,
        checked: true,
        label: '门店自提',
        show: false
      },
      {
        type: 2,
        checked: false,
        label: '门店送货',
        show: false
      },
      {
        type: 1,
        checked: false,
        label: '快递配送',
        show: false
      }
    ],
    address: '',
    order: {},
    shopId: [],
    payTypeList: [],
    payTypeIndex: 0,
    isCartOrder: 0,
    order_price: 0,
    usable_coupons: [],
    no_usable_coupons: [],
    remark: '',
    couponsIndex: ''
  },

  // 提交订单
  linkTo(e) {
    console.log(e);
    let that = this,
      orderNo = '',
      pay = {},
      logisticsType = '';
    console.log(app.globalData.userInfo);
    if (app.globalData.userInfo.walletId == undefined || app.globalData.userInfo.walletId == '') {
      wx.navigateTo({
        url: '/pages/register/register'
      })
    } else {
      if (that.data.order_price <= 0) {
        app.showToast({
          title: '金额不能为0'
        });
      } else if (that.data.address == undefined) {
        app.showToast({
          title: '请填写收货人信息'
        });
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/we/address/add_address/add_address?order_address=' + true,
            events: {
              someEvent: function(data) {
                console.log(data);
                that.setData({
                  address: data.data
                })
              }
            }
          })
        }, 2000)
      } else {
        app.showLoading()
          .then(() => {

            // 支付方式
            let payTypeCode = that.data.order.payTypeList[that.data.payTypeIndex].code;
            console.log(that.data.isCartOrder);

            // 配送方式
            logisticsType = that.data.deliverType.filter((item) => item.checked);
            console.log(logisticsType)

            // 确认订单
            let obj = {
              logisticsType: logisticsType[0].type,
              payTypeCode: payTypeCode,
              payAmount: that.data.order_price,
              deliveryAddressId: that.data.address.id,
              couponId: that.data.order.consumerCouponId,
              goods: that.data.shopId,
              shareConsumerId: '',
              shareShopId: '',
              isCartOrder: that.data.isCartOrder,
              remark: that.data.remark
            }
            return app.order.orderCreate(obj, true);
          })
          .then((res) => {
            // that.data.shopId.forEach((item) => {
            //   app.globalData.goodsId.forEach((items, index) => {
            //     if (item.goodsId == items){
            //       app.globalData.goodsId = app.globalData.goodsId.splice(index, 1);
            //     }
            //   })
            // })
            // app.setGlobalData('goodsId', app.globalData.goodsId);
            console.log(res);
            return Promise.resolve(res);
          })
          .catch((e) => {
            console.log(e);
            app.showToast({
              title: e
            });
            return Promise.reject({
              state: true
            });
          })
          .then((res) => {
            let orderNo = res.orderNo;
            that.setData({
              orderNo: orderNo
            });
            let params = {
              orderNo: orderNo
            };
            return app.order.pay(params, true);
          })
          .then((res) => {
            console.log(res);
            // 订单支付
            // let pay = JSON.parse(res);
            this.setData({
              orderNo: res.order_no
            })
            return app.pay(res.pay_info);
          })
          .then((res) => {
            console.log(res);
            app.refreshCartNum();
            wx.redirectTo({
              url: '../order_success/order_success?price=' + this.data.order_price + '&orderNo=' + this.data.orderNo + '&orderState=' + logisticsType[0].type
            });
          })
          .catch((res) => {
            console.log(res);
            if (!res.state) {
              wx.redirectTo({
                url: '/pages/we/order/order_pay/order_pay?id=' + that.data.orderNo
              });
            }
            return Promise.resolve();
          })
          .then(app.hideLoading)
      }
    }
  },

  // 选择支付方式
  bindPickerChange: function(event) {
    console.log(event.detail.value);
    let index = event.detail.value;
    this.setData({
      payTypeIndex: index
    })
  },

  getVendorLocation() {
    console.log('get location!!!')
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        wx.openLocation({
          latitude,
          longitude,
          scale: 18
        })
      }
    })
  },

  // 获取备注信息
  get_remark: function(event) {
    console.log(event);
    this.setData({
      remark: event.detail.value
    })
  },

  onDeliverRadioChange(e) {

    // 切换配送方式
    this.data.deliverType.map(item => {
      if (item.type == e.detail.type) {
        item.checked = true
      } else {
        item.checked = false
      }
    })

    // 修改金额
    this.data.deliverType.forEach((item) => {
      // 自营
      if (this.data.order.isSelf == 2 && item.checked && item.type == 1) {
        this.data.order_price = util.add(this.data.order.goodsAmount, this.data.order.logisticsAmount);
        this.data.order_price = util.sub(this.data.order_price, this.data.order.discountAmount);
      }
      console.log(item.type, item.checked);

      // 商家
      if (this.data.order.isSelf == 1 && item.checked && item.type == 3) {
        this.data.order_price = util.sub(this.data.order.goodsAmount, this.data.order.couponAmount);
        this.data.order_price = util.sub(this.data.order_price, this.data.order.discountAmount); 
        this.data.order_price = util.add(this.data.order_price, this.data.order.logisticsAmount);
      } else if (this.data.order.isSelf == 1 && item.checked && item.type == 2) {
        this.data.order_price = util.sub(this.data.order.goodsAmount, this.data.order.couponAmount);
        this.data.order_price = util.sub(this.data.order_price, this.data.order.discountAmount);
        this.data.order_price = util.add(this.data.order_price, this.data.order.deliveryFee);
      } else if (this.data.order.isSelf == 1 && item.checked && item.type == 1) {
        this.data.order_price = util.sub(this.data.order.goodsAmount, this.data.order.couponAmount);
        this.data.order_price = util.sub(this.data.order_price, this.data.order.discountAmount);
        this.data.order_price = util.add(this.data.order_price, this.data.order.logisticsFee);
      }
    })

    console.log(this.data.order_price);

    this.setData({
      deliverType: this.data.deliverType,
      order_price: this.data.order_price
    });
  },

  onDiscountRadioChange(e) {
    console.log('Discount radio is triggle!!!')
  },

  closeDialog() {
    this.setData({
      discountDialogVisible: false
    })
  },

  tabChange(e) {
    this.setData({
      discountType: e.currentTarget.dataset.type
    })
  },

  // 添加地址
  add_address: function() {
    let that = this;
    if (that.data.address == undefined) {
      wx.navigateTo({
        url: '/pages/we/address/add_address/add_address?order_address=' + true,
        events: {
          someEvent: function(data) {
            console.log(data);
            that.setData({
              address: data.data
            })
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '/pages/we/address/index/index?order_address=' + true,
        events: {
          someEvent: function(data) {
            console.log(data);
            that.setData({
              address: data.data
            })
          }
        }
      })
    }
  },

  // 打开优惠券模态框
  open_coupons: function() {
    let that = this,
      goodsList = [];
    that.setData({
      coupons_state: true
    })
  },

  // 切换优惠券
  coupons_toggle: function(event) {
    console.log(event);
    let that = this,
      index = event.currentTarget.dataset.index;
    that.data.usable_coupons.forEach((item, i) => {
      if (index == i) {
        item.isDefault = item.isDefault == 1 ? 0 : 1;
      } else {
        item.isDefault = 0
      }
    })

    that.setData({
      usable_coupons: that.data.usable_coupons
    })
  },

  // 选择优惠券
  choose_coupons: function() {
    let that = this,
      reduce = '',
      coupons = '';
    console.log(that.data.usable_coupons);
    that.data.usable_coupons.forEach((item, index) => {
      if (item.isDefault == 1) {
        // 计算满减
        that.data.order_price = util.add(that.data.order.goodsAmount, that.data.order.logisticsAmount);
        that.data.order_price = util.sub(that.data.order_price, item.reduce);
        reduce = item.reduce;
        coupons = item.id;
      }
    })

    if (that.data.usable_coupons.filter((item, index, arr) => item.isDefault == 1).length == 0) {
      // 计算满减
      that.data.order_price = util.add(that.data.order.goodsAmount, that.data.order.logisticsAmount);
      reduce = '';
      coupons = '';
    }

    let discountAmount = that.data.order.isSelf == 1 ? 'order.couponAmount' : 'order.discountAmount';
    let consumerCouponId = 'order.consumerCouponId';
    that.setData({
      order_price: that.data.order_price,
      [discountAmount]: reduce || 0,
      [consumerCouponId]: coupons,
      coupons_state: false
    });
  },

  // 关闭模态框
  close: function() {
    this.setData({
      coupons_state: false
    })
  },

  // 获取收货地址
  get_address: function() {
    let that = this;
    return app.user.deliveryAddressList({}, true)
      .then((res) => {
        console.log(res);

        // 获取地址
        let address = res.list.filter((item) => item.isDefault == 1);
        address = address.length <= 0 ? res.list.filter((item, index) => index == 0) : address;
        console.log(address);

        that.setData({
          address: address[0]
        });

        return Promise.resolve();
      })
  },

  // 打开当前页面路径中的参数
  pageQuery: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this,
      order_list = [],
      goodsList = [];

    that.pageQuery = options;

    // 获取上一页面传递的参数
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function(data) {
      console.log('===', data);
      order_list = data.data;
    });

    app.showLoading()
      .then(that.get_address)
      .then(() => {
        // 确认商品订单
        let obj = {
          goods: order_list
        };
        return app.order.orderConfirm(obj, true);
      })
      .then((data) => {
        console.log(data);

        // 修改配送方式数据结构
        let deliverTypeList = data.logisticsType.split(','),
          flag = true;
        deliverTypeList.forEach((item, index) => {
          deliverTypeList.splice(index, 1, parseInt(item));
        });
        console.log(deliverTypeList);
        that.data.deliverType.forEach((item, index) => {
          console.log(deliverTypeList, item.type, deliverTypeList.indexOf(index + 1) == -1);
          if (deliverTypeList.indexOf(item.type) == -1) {
            item.show = false;
            item.checked = false;
          } else {
            item.show = true;
            item.checked = flag ? true : false;
            flag = false;
          }
        });

        console.log(that.data.deliverType)

        // 修改支付方式数据格式
        let arr = [];
        data.payTypeList.forEach((item) => {
          arr.push(item.name);
        })

        // 计算订单总金额deliverType.show && deliverType.checked
        that.data.order_price = data.payAmount;

        that.setData({
          order: data,
          shopId: order_list,
          payTypeList: arr,
          isCartOrder: that.pageQuery.isCartOrder,
          deliverType: that.data.deliverType,
          order_price: that.data.order_price
        });

        return Promise.resolve();
      })
      .then(() => {
        that.data.order.items.forEach((item) => {
          goodsList.push({
            num: item.goodsNum,
            goodsSpecId: item.goodsSpecId
          })
        })
        return Promise.resolve();
      })
      .then(() => {
        if (that.data.order.isSelf == 2) {
          // 获取订单可用优惠券列表
          let params = {
            list: goodsList
          };
          return app.activity.orderCouponList(params, true);
        } else {
          let params = {
            list: goodsList,
            shopId: that.data.order.shopId
          };
          return app.shop.getOrderCouponList(params, true);
        }
      })
      .then((data) => {
        console.log(data);

        let usable_coupons = [];
        let no_usable_coupons = [];
        // 优惠券分类 可用优惠券（usable_coupons） --- 不可用优惠券（no_usable_coupons）
        data.list.forEach((item) => {
          if (item.state == 1) {
            usable_coupons = item.couponList;
            usable_coupons.forEach((coupon) => {
              coupon.useStartTime = coupon.useStartTime.replace(/\-/gi, '.');
              coupon.useStartTime = coupon.useStartTime.split(' ')[0];
              coupon.useEndTime = coupon.useEndTime.replace(/\-/gi, '.');
              coupon.useEndTime = coupon.useEndTime.split(' ')[0];
            });
          } else {
            no_usable_coupons = item.couponList;
            no_usable_coupons.forEach((coupon) => {
              coupon.useStartTime = coupon.useStartTime.replace(/\-/gi, '.');
              coupon.useStartTime = coupon.useStartTime.split(' ')[0];
              coupon.useEndTime = coupon.useEndTime.replace(/\-/gi, '.');
              coupon.useEndTime = coupon.useEndTime.split(' ')[0];
            });
          }
        });

        that.setData({
          usable_coupons: usable_coupons,
          no_usable_coupons: no_usable_coupons
        })

        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch((e) => {
        if (e) {
          console.error('购物车提交失败', e);
        }
        app.hideLoading();
      });
  },

  // 日期转换
  formatDate: function(datetime) {
    // 获取年月日时分秒值  slice(-2)过滤掉大于10日期前面的0
    var year = datetime.getFullYear(),
      month = ("0" + (datetime.getMonth() + 1)).slice(-2),
      date = ("0" + datetime.getDate()).slice(-2),
      hour = ("0" + datetime.getHours()).slice(-2),
      minute = ("0" + datetime.getMinutes()).slice(-2),
      second = ("0" + datetime.getSeconds()).slice(-2);
    // 拼接
    var result = year + "." + month + "." + date;
    // 返回
    return result;
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

  },

  /**
   * 用户选择了收货地址
   */
  onDeliveryAddressChoose: function() {

  },

  /**
   * 用户选择了配送方式
   */
  onLogisticsTypeChoose: function() {

  },

  /**
   * 用户选择了优惠券
   */
  onCouponChoose: function() {

  }

})