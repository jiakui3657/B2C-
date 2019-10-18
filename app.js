import md5 from 'utils/md5.js';
let regeneratorRuntime = require("utils/regenerator-runtime/runtime");
const initGlobalData = {
  userInfo: {},
  wxUserInfo: {},
  totalNumber: 0,
  consumerAppId: "6180612783995467",
  consumerAppSecret: 'wgckvqepc12rjiduljw9dqi32x7zwi8x',
  token: '',
  referrerInfo: null,
  sessionKey: null,
  jumpStatus: true,
  hotwordList: [],
  goodsId: []
};

if (!Promise.prototype.finally) {
  Promise.prototype.finally = function(cb) {
    let P = this.constructor;
    return this.then(
      value => P.resolve(cb()).then(() => value)
    );
  };
}

Date.prototype.Format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;

};

App({
  // apiUrl: 'https://b2c.baiwandian.cn/consumer',
  // imgSrc: 'https://b2c.baiwandian.cn/res/app/consumer',
  // apiUrl: 'http://192.168.3.14:8080/consumer',
  apiUrl: 'https://b2ctest.huala.com/v2.1/consumer',
  imgSrc: 'https://b2ctest.huala.com/v2.1/res/app/consumer',
  longitude: 0.0000,
  latitude: 0.0000,
  areaId: 61,
  city: '',
  pageSize: 10,
  SERVICE_TEL: '4008013030',
  loadingState: false,
  shareShopId: '',
  setGlobalData(key, val) {
    this.globalData[key] = val;
    wx.setStorageSync('globalData', this.globalData);
  },
  checkGlobalData: function(gData) {
    this.globalData = gData;
    if (!gData || Object.keys(gData).length == 0) {
      this.globalData = initGlobalData;
      wx.setStorageSync('globalData', initGlobalData);
    }

    if (!gData.consumerAppId || !gData.consumerAppSecret) {
      this.globalData = initGlobalData;
      wx.setStorageSync('globalData', initGlobalData);
    }

    if (!this.globalData.token || this.globalData.token.length == 0) {
      return this.resetToken();
    }
    return Promise.resolve();
  },
  onLaunch: function(options) {
    let _this = this;
    _this.welfare_state = true;
    this.checkUpdate();
    this.init();

    // 初始化自定义导航栏的高度
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        console.log(res, menuButtonObject);
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2;//导航高度
          console.log(navHeight);
          navHeight = res.model.indexOf('iPhone') != -1 ? navHeight + 4 : navHeight;
        _this.navHeight = navHeight;
        _this.navTop = navTop;
        _this.menuHeight = menuButtonObject.height;
        console.log(navHeight);
      },
      fail(err) {
        console.log(err);
      }
    })

    // 检索小程序的入口方式
    let date = wx.getLaunchOptionsSync();
    console.log(date);
    console.log(initGlobalData);

    this.showLoading()
      .then(this.checkGlobalData(wx.getStorageSync('globalData') || initGlobalData))
      .then(this.getUserInfo)
      .catch(this.refreshUserInfo)
      // .then(this.refreshUserInfo)
      .then(this.refreshCartNum)
      .then(() => {
        
        return Promise.resolve();
      })
      .then(this.hideLoading)
      .catch((e) => {
        console.error(e);
        wx.showLoading({
          title: '加载出错',
          mask: false
        });
        _this.loadingState = true;
      });
  },
  onShow: function(options) {
    let _this = this;
    _this.setGlobalData("jumpStatus", true);
  },
  bezier: function(pots, amount) {
    // 购物车动画特效算法
    var pot;
    var lines;
    var ret = [];
    var points;
    for (var i = 0; i <= amount; i++) {
      points = pots.slice(0);
      lines = [];
      while (pot = points.shift()) {
        if (points.length) {
          lines.push(pointLine([pot, points[0]], i / amount));
        } else if (lines.length > 1) {
          points = lines;
          lines = [];
        } else {
          break;
        }
      }
      ret.push(lines[0]);
    }

    function pointLine(points, rate) {
      var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
      var ret = [];
      pointA = points[0]; //点击
      pointB = points[1]; //中间
      xDistance = pointB.x - pointA.x;
      yDistance = pointB.y - pointA.y;
      pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
      tan = yDistance / xDistance;
      radian = Math.atan(tan);
      tmpPointDistance = pointDistance * rate;
      ret = {
        x: pointA.x + tmpPointDistance * Math.cos(radian),
        y: pointA.y + tmpPointDistance * Math.sin(radian)
      };
      return ret;
    }
    return {
      'bezier_points': ret
    };
  },
  /**
   * 显示加载提示框。
   */
  showLoading: function() {
    let _this = this;
    return new Promise((resolve, reject) => {
      _this.loadingState = true;
      wx.showLoading({
        title: '加载中',
        mask: true,
        success: () => {
          resolve();
        },
        fail: () => {
          reject();
        }
      });
    });
  },
  /**
   * 隐藏加载提示框。
   */
  hideLoading: function() {
    if (this.loadingState) {
      wx.hideLoading();
    }
  },
  /**
   * 消息提示框。
   */
  showToast: function(obj, callback) {
    this.loadingState = false;
    wx.showToast({
      title: obj.title || '',
      icon: obj.icon ? obj.icon : 'none',
      duration: 2000,
      mask: true,
      success: callback
    });
  },
  init: function() {
    var _this = this;
    let business = {
      "goods": [{
          "method": "hotwordList",
          "url": "/goods/hotwordList",
          "name": "商品搜索热词"
        },
        {
          "method": "recommendList",
          "url": "/goods/recommendList",
          "name": "推荐商品列表"
        },
        {
          "method": "list",
          "url": "/goods/list",
          "name": "自营/供应商商品列表"
        },
        {
          "method": "groupList",
          "url": "/goods/groupList",
          "name": "获取自营/供应商分类列表"
        },
        {
          "method": "detail",
          "url": "/goods/detail",
          "name": "自营/供应商商品详情"
        },
        {
          "method": "categoryList",
          "url": "/goods/categoryList",
          "name": "自营/供应商商品分类列表"
        },
        {
          "method": "groupList",
          "url": "/goods/groupList",
          "name": "自营/供应商商品分组列表"
        },
        {
          "method": "goodsSpecAttr",
          "url": "/goods/getGoodsSpecAttr",
          "name": "自营/供应商商品规格属性"
        },
        {
          "method": "vipGoodsList",
          "url": "/goods/vipGoodsList",
          "name": "自营/供应商vip商品列表"
        },
        {
          "method": "commentList",
          "url": "/goods/commentList",
          "name": "商品评论列表"
        },
        {
          "method": "shopGoodsList",
          "url": "/goods/shopGoodsList",
          "name": "店铺商品列表"
        },
        {
          "method": "shopGoodsDetail",
          "url": "/goods/shopGoodsDetail",
          "name": "店铺商品详情"
        },
        {
          "method": "shopGoodsCategoryList",
          "url": "/goods/shopGoodsCategoryList",
          "name": "店铺商品分类列表"
        }
      ],
      "shop": [{
          "method": "list",
          "url": "/shop/list",
          "name": "店铺列表"
        },
        {
          "method": "detail",
          "url": "/shop/detail",
          "name": "店铺详情"
        },
        {
          "method": "getShopTypeList",
          "url": "/shop/getShopTypeList",
          "name": "店铺类型"
        },
        {
          "method": "couponList",
          "url": "/shop/couponList",
          "name": "店铺优惠券"
        },
        {
          "method": "goodsCouponList",
          "url": "/shop/goodsCouponList",
          "name": "店铺商品详情优惠券列表"
        },
        {
          "method": "getShopCoupon",
          "url": "/shop/getShopCoupon",
          "name": "领取店铺优惠券"
        },
        {
          "method": "getOrderCouponList",
          "url": "/shop/getOrderCouponList",
          "name": "获取店铺订单可用优惠券列表"
        },
        {
          "method": "getShopCouponInfo",
          "url": "/shop/getShopCouponInfo",
          "name": "获取店铺优惠券信息"
        },
        {
          "method": "getShopCouponGoodsList",
          "url": "/shop/getShopCouponGoodsList",
          "name": "店铺优惠券可用商品列表"
        }
      ],
      "cart": [{
          "method": "getCartGoodsSpec",
          "url": "/cart/getCartGoodsSpec",
          "name": "获取购物车商品规格"
        },
        {
          "method": "addUserCart",
          "url": "/cart/addUserCart",
          "name": "用户添加商品到购物车"
        },
        {
          "method": "deleteCartGoods",
          "url": "/cart/deleteCartGoods",
          "name": "用户删除购物车商品"
        },
        {
          "method": "getCartGoodsNum",
          "url": "/cart/getCartGoodsNum",
          "name": "获取购物车商品数量"
        },
        {
          "method": "userCartList",
          "url": "/cart/userCartList",
          "name": "获取购物车商品列表"
        },
        {
          "method": "updateSpec",
          "url": "/cart/updateSpec",
          "name": "修改购物车商品规格"
        },
        {
          "method": "updateCartGoodsNum",
          "url": "/cart/updateCartGoodsNum",
          "name": "修改购物车商品数量"
        }
      ],
      "order": [{
          "method": "orderConfirm",
          "url": "/order/orderConfirm",
          "name": "确认商品订单"
        },
        {
          "method": "orderCreate",
          "url": "/order/orderCreate",
          "name": "确认商品订单"
        },
        {
          "method": "confirm",
          "url": "/order/confirm",
          "name": "订单确认"
        },
        {
          "method": "create",
          "url": "/order/create",
          "name": "创建商品订单"
        },
        {
          "method": "createRefundOrder",
          "url": "/order/createRefundOrder",
          "name": "创建退货单"
        },
        {
          "method": "orderCancel",
          "url": "/order/orderCancel",
          "name": "取消订单"
        },
        {
          "method": "orderReasonList",
          "url": "/order/orderReasonList",
          "name": "取消订单原因"
        },
        {
          "method": "pay",
          "url": "/order/payOrder",
          "name": "订单支付"
        },
        {
          "method": "orderReceive",
          "url": "/order/orderReceive",
          "name": "确认收货"
        },
        {
          "method": "orderList",
          "url": "/order/orderList",
          "name": "订单列表"
        },
        {
          "method": "getOrderDetail",
          "url": "/order/getOrderDetail",
          "name": "订单详情"
        },
        {
          "method": "refundReasonList",
          "url": "/refund/refundReasonList",
          "name": "订单详情"
        },
        {
          "method": "orderShareGoods",
          "url": "/order/orderShareGoods",
          "name": "晒单列表"
        },
        {
          "method": "orderDelete",
          "url": "/order/orderDelete",
          "name": "删除订单"
        },
        {
          "method": "countOrder",
          "url": "/order/countOrder",
          "name": "统计订单数量"
        },
        {
          "method": "orderShare",
          "url": "/order/orderShare",
          "name": "发布晒单"
        },
        {
          "method": "getOrderLogisticsList",
          "url": "/order/getOrderLogisticsList",
          "name": "物流列表"
        },
        {
          "method": "orderLogistics",
          "url": "/order/orderLogistics",
          "name": "物流详情"
        }
      ],
      "refund": [{
          "method": "refundOrderList",
          "url": "/refund/refundOrderList",
          "name": "申请售后列表"
        },
        {
          "method": "refundApply",
          "url": "/refund/refundApply",
          "name": "创建退货单"
        },
        {
          "method": "auditOrderList",
          "url": "/refund/auditOrderList",
          "name": "退货单列表"
        },
        {
          "method": "refundReasonList",
          "url": "/refund/refundReasonList",
          "name": "退货理由选择列表"
        },
        {
          "method": "refundOrderDetail",
          "url": "/refund/refundOrderDetail",
          "name": "退货单详情"
        },
        {
          "method": "getLogisticsompany",
          "url": "/refund/getLogisticsompany",
          "name": "快递公司列表"
        },
        {
          "method": "submitLogistics",
          "url": "/refund/submitLogistics",
          "name": "提交退货邮寄信息"
        },
        {
          "method": "cancelRefundOrder",
          "url": "/refund/cancelRefundOrder",
          "name": "取消退货申请"
        }
      ],
      "user": [{
          "method": "login",
          "url": "/user/login",
          "name": "用户登录授权"
        },
        {
          "method": "getUserInfo",
          "url": "/user/getUserInfo",
          "name": "获取用户信息"
        },
        {
          "method": "updateUserInfo",
          "url": "/user/updateUserInfo",
          "name": "更新用户信息"
        },
        {
          "method": "realName",
          "url": "/user/realName",
          "name": "用户实名认证"
        },
        {
          "method": "getRealNameInfo",
          "url": "/user/getRealNameInfo",
          "name": "获取用户实名认证信息"
        },
        {
          "method": "deliveryAddressList",
          "url": "/user/deliveryAddressList",
          "name": "用户收货地址列表"
        },
        {
          "method": "deliveryAddressInfo",
          "url": "/user/deliveryAddressInfo",
          "name": "用户收货地址信息"
        },
        {
          "method": "deliveryAddressLabelList",
          "url": "/user/deliveryAddressLabelList",
          "name": "用户收货地址标签列表"
        },
        {
          "method": "addDeliveryAddress",
          "url": "/user/addDeliveryAddress",
          "name": "新增收货地址"
        },
        {
          "method": "updateDeliveryAddress",
          "url": "/user/updateDeliveryAddress",
          "name": "更新收货地址信息"
        },
        {
          "method": "deleteDeliveryAddress",
          "url": "/user/deleteDeliveryAddress",
          "name": "删除收货地址"
        },
        {
          "method": "addCollection",
          "url": "/collection/add",
          "name": "收藏商品/好物"
        },
        {
          "method": "deleteCollection",
          "url": "/collection/delete",
          "name": "取消商品/好物收藏"
        },
        {
          "method": "collectedGoodsList",
          "url": "/collection/collectedGoodsList",
          "name": "用户收藏的商品列表"
        },
        {
          "method": "collectedThingList",
          "url": "/collection/collectedThingList",
          "name": "用户收藏的好物列表"
        },
        {
          "method": "visitedGoodsList",
          "url": "/collection/visitedGoodsList",
          "name": "用户浏览商品列表"
        },
        {
          "method": "saveGoodsVisitRecord",
          "url": "/collection/saveFoot",
          "name": "保存用户商品浏览记录"
        },
        {
          "method": "share",
          "url": "/member/share",
          "name": "保存用户分享记录"
        },
        {
          "method": "integralRecordList",
          "url": "/member/integralRecordList",
          "name": "积分变动记录"
        },
        {
          "method": "integralGoodsList",
          "url": "/member/integralGoodsList",
          "name": "积分兑换商品列表"
        },
        {
          "method": "exchangeGoods",
          "url": "/member/exchangeGoods",
          "name": "积分兑换商品"
        },
        {
          "method": "integralExchangeOrderList",
          "url": "/member/integralExchangeOrderList",
          "name": "会员积分商品兑换记录"
        },
        {
          "method": "privilegeList",
          "url": "/member/privilegeList",
          "name": "会员权益"
        },
        {
          "method": "vipCardList",
          "url": "/member/vipCardList",
          "name": "Vip会员卡列表"
        },
        {
          "method": "vipCardOnTrial",
          "url": "/member/vipCardOnTrial",
          "name": "试用vip会员"
        },
        {
          "method": "buyVipCard",
          "url": "/member/buyVipCard",
          "name": "购买会员卡"
        },
        {
          "method": "savePullRelation",
          "url": "/member/savePullRelation",
          "name": "消费者拉新"
        },
        {
          "method": "pullNewRanking",
          "url": "/member/pullNewRanking",
          "name": "消费者拉新排名"
        },
        {
          "method": "pullNewList",
          "url": "/member/pullNewList",
          "name": "消费者拉新列表"
        },
        {
          "method": "getIntegralByShare",
          "url": "/member/getIntegralByShare",
          "name": "分享有礼"
        },
        {
          "method": "getShareAndIntegralRule",
          "url": "/member/getShareAndIntegralRule",
          "name": "获取分享有礼的页面信息"
        }
      ],
      "activity": [{
          "method": "proceedFlashActivity",
          "url": "/activity/proceedFlashActivity",
          "name": "闪电购商品列表"
        },
        {
          "method": "todayFlashActivityList",
          "url": "/activity/todayFlashActivityList",
          "name": "查询当天秒杀活动列表"
        },
        {
          "method": "lightningGoodsList",
          "url": "/activity/lightningGoodsList",
          "name": "自营/供应商闪电购活动商品列表"
        },
        {
          "method": "couponList",
          "url": "/activity/couponList",
          "name": "领券中心优惠券列表"
        },
        {
          "method": "userCouponList",
          "url": "/activity/userCouponList",
          "name": "用户优惠券列表"
        },
        {
          "method": "getCouponInfo",
          "url": "/activity/getCouponInfo",
          "name": "获取优惠券信息"
        },
        {
          "method": "getCoupon",
          "url": "/activity/getCoupon",
          "name": "领取优惠券"
        },
        {
          "method": "countUserCoupon",
          "url": "/activity/countUserCoupon",
          "name": "统计用户优惠券数量"
        },
        {
          "method": "couponGoodsList",
          "url": "/activity/couponGoodsList",
          "name": "优惠券可用商品列表"
        },
        {
          "method": "goodsCouponList",
          "url": "/activity/goodsCouponList",
          "name": "商品可用优惠券列表"
        },
        {
          "method": "signIn",
          "url": "/member/signIn",
          "name": "用户签到/补签"
        },
        {
          "method": "signInRecord",
          "url": "/member/signInRecord",
          "name": "用户签到记录"
        },
        {
          "method": "checkBangCoupon",
          "url": "/activity/checkBangCoupon",
          "name": "判断当前用户是否存在帮帮领券"
        },
        {
          "method": "getBangCoupon",
          "url": "/activity/getBangCoupon",
          "name": "获取当前系统的帮帮领券"
        },
        {
          "method": "joinBangCoupon",
          "url": "/activity/joinBangCoupon",
          "name": "用户发起帮帮领券"
        },
        {
          "method": "getBangingCoupon",
          "url": "/activity/getBangingCoupon",
          "name": "用户正在进行的帮帮领券"
        },
        {
          "method": "orderCouponList",
          "url": "/activity/orderCouponList",
          "name": "获取订单可用优惠券"
        },
        {
          "method": "getNewConsumerCoupon",
          "url": "/activity/getNewConsumerCoupon",
          "name": "首页新客福利券"
        },
        {
          "method": "getSystemCoupon",
          "url": "/activity/getSystemCoupon",
          "name": "获取系统券信息（拉新券，新客福利券）"
        },
        {
          "method": "doBangCoupon",
          "url": "/activity/doBangCoupon",
          "name": "参与帮帮领券活动"
        },
        {
          "method": "getBangingActivityInfo",
          "url": "/activity/getBangingActivityInfo",
          "name": "获取分享的帮帮领券信息"
        }
      ],
      "thing": [{
          "method": "thingList",
          "url": "/thing/list",
          "name": "好物列表"
        },
        {
          "method": "thingDetail",
          "url": "/thing/detail",
          "name": "好物详情"
        },
        {
          "method": "praiseThing",
          "url": "/thing/praiseThing",
          "name": "好物点赞/取消点赞"
        },
        {
          "method": "thingTypeList",
          "url": "/thing/thingTypeList",
          "name": "好物类型列表"
        },
        {
          "method": "postOrder",
          "url": "/thing/postOrder",
          "name": "用户晒单"
        }
      ],
      "wallet": [{
          "method": "verifyCode",
          "url": "/wallet/verifyCode",
          "name": "发送钱包注册验证码"
        },
        {
          "method": "memberCreate",
          "url": "/wallet/memberCreate",
          "name": "注册钱包账号"
        }
      ],
      "other": [{
          "method": "bannerList",
          "url": "/other/bannerList",
          "name": "Banner(广告)列表"
        },
        {
          "method": "batchBannerList",
          "url": "/other/getbannerList",
          "name": "批量获取Banner(广告)列表"
        },
        {
          "method": "messageList",
          "url": "/other/messageList",
          "name": "消息列表"
        },
        {
          "method": "messageDetail",
          "url": "/other/messageDetail",
          "name": "消息详情"
        },
        {
          "method": "sendValidateCode",
          "url": "/other/sendValidateCode",
          "name": "发送短信验证码"
        },
        {
          "method": "getLocation",
          "url": "/other/getLocation",
          "name": "逆解析获取地址信息"
        },
        {
          "method": "imgUpload",
          "url": "/other/imgUpload",
          "name": "图片上传"
        },
        {
          "method": "getCurrentTime",
          "url": "/other/getCurrentTime",
          "name": "获取服务器当前时间"
        },
        {
          "method": "collectFormid",
          "url": "/other/collectFormid",
          "name": "收集微信小程序formid"
        }
      ]
    };

    for (let [key, val] of Object.entries(business)) {
      _this[key] = {};
      val.forEach((item) => {
        if (!(key == 'user' && item.method == 'login')) {
          this[key][item.method] = (params, showError) => {
            return new Promise((resolve, reject) => {
              let callback = {
                funcName: key + '.' + item.method,
                done: function() {
                  params = params || {};
                  console.log('正在请求 %c' + item.name, 'background: yellow; color: red', '接口, URL:' + item.url, '参数:', params || {});
                  let option = {
                    url: item.url,
                    method: 'post',
                    data: params
                  };
                  resolve(_this.request(option, false, showError));
                },
                waitTime: 300
              };
              _this.waitFinished(callback);
            });

          };
        } else {
          this[key][item.method] = (params, showError) => {
            params = params || {};
            console.log('正在请求 %c' + item.name, 'background: yellow; color: red', '接口, URL:' + item.url, '参数:', params || {});
            let option = {
              url: item.url,
              method: 'post',
              data: params
            };
            return _this.request(option, false, showError);
          };
        }
      });
    }
  },
  /**
   * 轮询等待条件满足后处理
   */
  waitFinished: function(fun) {
    let _this = this;
    if (!fun) {
      return;
    }


    if (!_this.isTokenResetting.status) {
      fun.done();
      return;
    }

    let waitTime = fun.waitTime ? fun.waitTime : 10;
    let maxTimes = 30;

    let strTime = new Date().getTime();
    fun[strTime] = setInterval(function() {
      if (!_this.isTokenResetting.status || maxTimes == 0) {
        try {
          fun.done();
        } finally {
          clearInterval(fun[strTime]);
          delete fun[strTime];
        }
      }
      console.error('Wait request[' + fun.funcName + ']...');
      maxTimes--;
    }, waitTime);
  },
  /** 
   * 数组对象按key升序, 并生成 md5_hex 签名
   * @param {Array/Object} obj   数组对象
   * @return {String}  encrypted md5加密后的字符串
   */
  makeSign: function(params, timestamp) {
    let token = this.globalData.token || '';
    let obj = "appid=" + this.globalData.consumerAppId + "&params=" + JSON.stringify(params) + "&timestamp=" + timestamp;
    if (token != '') {
      obj += "&token=" + token;
    }

    if (!obj) {
      console.error('需要加密的数组对象为空')
    }
    let secret = this.globalData.consumerAppSecret;
    let encrypted = md5(obj + "&key=" + secret);
    return encrypted.toUpperCase();
  },
  //是否正在重置token
  isTokenResetting: {
    status: false,
    retries: 0,
    maxRetries: 5,
    retryDelayTime: 200
  },
  /**
   * request数据请求。
   * 
   * @param obj (参数  类型： obj)
   *        obj.url  (请求路径  类型： String)
   *        obj.method  (请求方式get/post  类型： String)
   *        obj.data  (请求参数  类型： obj)
   * @param retry 是否重试（重新请求）
   */
  request: function(obj, retry, showError) {
    let reqArgs = arguments[0];
    let _this = this;
    let timestamp = new Date().getTime();
    let sign = this.makeSign(obj.data, timestamp);

    return new Promise((resolve, reject) => {
      let url = _this.apiUrl + obj.url; // 请求路径
      let data = {
        appid: _this.globalData.consumerAppId, //appId
        timestamp: timestamp, //时间戳
        version: '1.0', //版本     
        sign: sign, //签名
        token: _this.globalData.token || '', //token
        params: JSON.stringify(obj.data) //请求参数
      };
      wx.request({
        url: url,
        method: obj.method,
        data: data,
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'token': data.token
        },
        success: function(res) { // 请求成功
          console.log("返回值", res.data);
          if (res.data.code == '200') {
            // 请求成功返回数据
            resolve(res.data.data || {});

          } else if (res.data.code == '406') { // token错误
            return _this.resetToken()
              .then(() => {
                if (!retry) {
                  _this.request(reqArgs, true);
                }
              })
              .catch(() => {
                if (showError) {
                  _this.showToast({
                    title: '服务接口授权失败',
                    icon: 'none',
                    duration: 2000
                  }, reject);
                } else {
                  reject();
                }
              });
          } else {
            if (showError) {
              // 消息信息
              let obj = {
                title: res.data.message,
                // icon: 'loading',
                duration: 2000
              };

              // 消息提示
              _this.showToast(obj);
              reject(res.data.message)
            } else {
              reject(res.data.message);
            }
          }
        },
        fail: (res) => { // 请求失败
          if (showError) {
            // 消息信息
            let obj = {
              title: '服务请求失败',
              icon: 'loading',
              duration: 2000
            };

            // 消息提示
            _this.showToast(obj, () => {
              reject(res);
            });
          } else {
            reject(res);
          }
        }
      });
    });
  },
  setToken: function(token) {
    this.setGlobalData('token', token);
    try {
      wx.setStorageSync('token', token);
      this.isTokenResetting.status = false;
      /*
      let currentPages = getCurrentPages();
      if (currentPages && currentPages.length > 0) {
        setTimeout(() => {
          currentPages[0].onLoad(currentPages[0].loadQuery);
          currentPages[0].onReady();
          currentPages[0].onShow();
        }, 1000);
      }
      */
    } catch (e) {
      console.error("setToken error.", e);
    }
  },
  resetToken: async function(retry) {
    let _this = this;
    if (_this.isTokenResetting.status) {
      return Promise.resolve();
    } else {
      _this.isTokenResetting.status = true;
    }
    let reqArgs = arguments[0];
    return await new Promise((resolve, reject) => {
      wx.login({
        success(res) {
          if (res.code) {
            // return _this.getWxUserInfo()
            //   .then((wxUserInfo) => {
            let params = {
              code: res.code
              // nickName: wxUserInfo.nickName,
              // gender: wxUserInfo.gender,
              // avatarUrl: wxUserInfo.avatarUrl
            };
            _this.isTokenResetting.retries++;
            return _this.user.login(params)
              .then(function(data) {
                // 0：要展示新客福利券， 1：已展示新客福利券
                wx.setStorage({
                  key: 'showCoupon',
                  data: '0',
                })
                _this.setToken(data.token);
                _this.setGlobalData("jumpStatus", true);
                resolve();
              });
            // })
            // .catch(() => {
            //   return _this.getWxUserInfo()
            //     .then(() => {
            //       return new Promise((resolve, reject) => {
            //         if (!retry) {
            //           _this.resetToken(true);
            //           resolve();
            //         } else {
            //           reject();
            //         }
            //       });
            //     })
            //     .catch(function (res) {
            //       console.error("获取用户信息出错.");
            //       return Promise.reject("获取用户信息出错.");
            //     });
            // });
          } else {
            console.log('登录失败！' + res.errMsg)
            reject();
          }
        }
      });
    });
  },
  refreshUserInfo: function() {
    let _this = this;
    return _this.user.getUserInfo()
      .then((data) => {
        return new Promise((resolve, reject) => {
          _this.setGlobalData("userInfo", data);
          resolve(data);
        });
      });
  },
  getUserInfo: function() {
    let _this = this;
    return new Promise((resolve, reject) => {
      let userInfo = _this.globalData.userInfo;
      if (!userInfo || Object.keys(userInfo).length == 0) {
        reject();
      } else {
        resolve(userInfo);
      }
    });
  },
  getWxUserInfo: function() {
    let _this = this;
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: function(res) {
                _this.setGlobalData('wxUserInfo', res.userInfo);
                resolve(res.userInfo);
              }
            });
          } else {
            console.log("即将进行微信授权...");
            if (_this.globalData.jumpStatus) {
              _this.setGlobalData('jumpStatus', false);
              wx.navigateTo({
                url: '/pages/login/login'
              });
            }
          }
        },
        fail(e) {
          console.error(e);
          reject();
        }
      });
    });
  },
  refreshCartNum: function() {
    let _this = this;
    return _this.cart.getCartGoodsNum()
      .then((data) => {
        return new Promise((resolve, reject) => {
          _this.setGlobalData('totalNumber', data.num);
          if (_this.globalData.totalNumber > 0 && _this.globalData.totalNumber < 100) {
            wx.setTabBarBadge({
              index: 3,
              text: _this.globalData.totalNumber + ''
            });
            resolve();
          } else if (_this.globalData.totalNumber > 99) {
            wx.setTabBarBadge({
              index: 3,
              text: '99'
            });
            resolve();
          } else {
            wx.removeTabBarBadge({
              index: 3
            })
            resolve();
          }
        });
      });
  },
  /**
   * 获取定位信息，返回{"longitude":0.000000, "latitude":0.000000}
   */
  getLocation: function(retry) {
    let _this = this;
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success(res) {
          _this.longitude = res.longitude;
          _this.latitude = res.latitude;

          _this.changeAreaId()
            .then(() => {
              resolve(res);
            })
        },
        fail(e) {
          wx.showModal({
            title: '提示',
            content: '位置信息获取不到，请设置',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.openSetting({
                  success(res) {
                    let setting = res.authSetting;
                    if (setting["scope.userLocation"]) {
                      if (!retry) {
                        return _this.getLocation(true);
                      }
                    } else {
                      reject('请开启位置信息');
                    }
                  },
                  fail(e) {
                    reject(e);
                  }
                });
              } else if (res.cancel) {
                reject('请授权位置信息');
              }
            }
          });
        }
      });
    });
  },

  // 根据经纬度转换区域id
  changeAreaId: function() {
    let _this = this;
    let params = {
      longitude: _this.longitude,
      latitude: _this.latitude
    };
    return _this.other.getLocation(params)
      .then((data) => {
        _this.areaId = data.areaId;
        return Promise.resolve(data);
      })
      .catch((e) => {
        console.error("经纬度转换区域ID出错");
        return Promise.resolve();
      });
  },

  hotwordList: function() {
    let _this = this;
    let params = {
      site: 3
    };
    return _this.goods.hotwordList(params)
      .then((data) => {
        _this.setGlobalData('hotwordList', data.list);
        return Promise.resolve(data.list);
      })
      .catch((e) => {
        console.error("商品搜索热词获取出错", e);
        return Promise.resolve();
      });
  },
  getServerTime: function() {
    let _this = this;
    let start = new Date().getTime();
    return _this.other.getCurrentTime()
      .then((data) => {
        let endTime = new Date();
        let end = endTime.replace(/-/g, '/').getTime();
        let diff = end - start;
        diff = Math.ceil(diff / 1000) * 1000;
        let currentTimestamp = new Date(data.currentTime).getTime();
        let currentTime = new Date(currentTimestamp + diff).Format('yyyy-MM-dd hh:mm:ss');
        return Promise.resolve(currentTime);
      });
  },

  // 微信支付
  pay: function(parameter) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        timeStamp: parameter.timeStamp,
        nonceStr: parameter.nonceStr,
        package: parameter.package,
        signType: parameter.signType,
        paySign: parameter.paySign,
        success(res) {
          resolve(res);
        },
        fail(res) {
          reject(res);
        }
      });
    });
  },

  // 检查更新
  checkUpdate: function() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function() {
            wx.showModal({
              title: '已经有新版本了',
              content: '新版本已经上线，请您删除当前小程序，重新搜索打开'
            })
          })
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  }
});

module.exports = {
  initGlobalData
}