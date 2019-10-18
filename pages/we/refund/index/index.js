// pages/we/after_sales/after_sales.js
let app = getApp();
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    currentTab: 0,
    array: ['全部', '一个月内', '一个月至三个月', '三个月至六个月', '六个月至一年', '一年以上', ],

    // 申请售后
    goods: {},
    // 审核中
    goods2: {},
    // 处理中
    goods3: {},
    // 申请记录
    goods4: {},
    // 申请售后搜索结果集
    searchGoods: {},
    // 售后申请列表是否是搜索状态
    search: false,
    // 售后申请列表搜索的关键字
    keyWord: '',
    // 售后申请时间周期类型
    timeType: 0,
    // 申请记录搜素结果集
    searchGoods2: {},
    // 申请记录列表是否是搜索状态
    search2: false,
    // 申请记录列表搜索的关键字
    keyWord2: '',
    // 申请记录时间周期类型
    timeType2: 0,
    // 申请退货退款成功
    applySuccess: false,
    // 邮递成功
    postSuccess: false
  },

  //点击tab切换
  swichNav: function(e) {
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      });
    }
  },

  // 申请售后时间筛选
  bindPickerChange: function(e) {
    this.data.timeType = e.detail.value;
    this.getRefundOrderList();
  },

  // 申请售后时间筛选
  bindPickerChange2: function(e) {
    this.data.timeType2 = e.detail.value;
    this.getAuditOrderList();
  },

  // 申请售后
  afterType: function(e) {
    let finish = 1;
    if (e.currentTarget.dataset.logistics_state == 0) {
      finish = 0;
    }
    wx.navigateTo({
      url: '../after_type/after_type?goods=' + JSON.stringify(e.currentTarget.dataset.goods) + '&finish=' + finish + '&from=refund'
    })
  },

  // 取消申请
  cancel: function(e) {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定取消申请？',
      success(res) {
        if (res.confirm) {
          app.showLoading().then(() => {
            app.refund.cancelRefundOrder({
              refundOrderNo: e.currentTarget.dataset.refund_order_no
            }).then(() => {
              that.data.goodsList2.splice(e.currentTarget.dataset.index, 1);
              that.setData({
                goodsList2: that.data.goodsList2,
                goods: {}
              })
              app.hideLoading();
              app.showToast({
                title: '取消成功',
                icon: 'success'
              });
              // setTimeout(function() {
              //   this.getAuditOrderList();
              //   this.getRefundOrderList();
              // }, 2000)
            }).catch((res) => {
              app.hideLoading();
              app.showToast({
                title: res
              });
            })
          })
        }
      }
    })
  },

  // 跳转填写邮递地址
  post: function(event) {
    let that = this;
    let applyDetails = that.data.goodsList2.filter((item, index, arr) => index == event.currentTarget.dataset.index);
    wx.navigateTo({
      url: '../mail_address/mail_address?applyDetails=' + JSON.stringify(applyDetails)
    })
  },

  // 跳转申请详情
  apply_details: function(event) {
    console.log(event);
    let that = this;
    let applyDetails = that.data.goodsList2.filter((item, index, arr) => index == event.currentTarget.dataset.index);
    wx.navigateTo({
      url: '../apply_details/apply_details?applyDetails=' + JSON.stringify(applyDetails)
    })
  },

  // 跳转退款详情
  refund_details: function(e) {
    wx.navigateTo({
      url: '../refund_details/refund_details?refundDetail=' + JSON.stringify(e.currentTarget.dataset.item)
    })
  },

  // 跳转退货详情
  refund_goods: function(e) {
    wx.navigateTo({
      url: '../return_goods/return_goods?refundDetail=' + JSON.stringify(e.currentTarget.dataset.item)
    })
  },

  // 跳转服务单详情
  service_details: function(e) {
    wx.navigateTo({
      url: '../service_details/service_details?refundDetail=' + JSON.stringify(e.currentTarget.dataset.item)
    })
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

    this.getRefundOrderList();
  },

  // 请求售后申请列表
  getRefundOrderList: function(pageIndex = 1) {
    let params = {
      timeType: this.data.timeType,
      keyWord: this.data.keyWord,
      pageIndex: pageIndex,
      pageSize: app.pageSize
    }
    app.showLoading().then(() => {
      app.refund.refundOrderList(params).then(data => {
        if (!this.data.search) {
          if (pageIndex == 1) {
            this.data.goods.list = [];
          }
          this.data.goods.pageIndex = data.pageIndex;
          this.data.goods.pageCount = data.pageCount;
          this.data.goods.list.push(...data.list);
          this.setData({
            goodsList: this.data.goods.list
          })
        } else {
          if (pageIndex == 1) {
            this.data.searchGoods.list = [];
          }
          this.data.searchGoods.pageIndex = data.pageIndex;
          this.data.searchGoods.pageCount = data.pageCount;
          this.data.searchGoods.list.push(...data.list);
          this.setData({
            searchGoodsList: this.data.searchGoods.list,
            searctTip: true
          })
        }
        app.hideLoading();
      }).catch(() => {
        app.hideLoading();
      })
    })
  },

  // 请求其它三个状态列表
  getAuditOrderList: function({
    pageIndex = 1,
    tabIndex = this.data.currentTab
  } = {}) {
    let params = {
      searchType: tabIndex,
      pageIndex: pageIndex,
      pageSize: app.pageSize
    }

    if (tabIndex == 3) {
      params.keyWord = this.data.keyWord2;
      params.timeType = this.data.timeType2;
    }

    app.showLoading().then(() => {
      app.refund.auditOrderList(params).then(data => {
        if (tabIndex == 1) {
          this.setGoods2(pageIndex, data);
        } else if (tabIndex == 2) {
          this.setGoods3(pageIndex, data);
        } else if (tabIndex == 3) {
          if (!this.data.search2) {
            this.setGoods4(pageIndex, data);
          } else {
            this.setGoodsSearch4(pageIndex, data);
          }
        }
        app.hideLoading();
      }).catch(() => {
        app.hideLoading();
      })
    })
  },

  setGoods2: function(pageIndex, data) {
    if (pageIndex == 1) {
      this.data.goods2.list = [];
    }
    this.data.goods2.pageIndex = data.pageIndex;
    this.data.goods2.pageCount = data.pageCount;
    this.data.goods2.list.push(...data.list);
    this.setData({
      goodsList2: this.data.goods2.list
    })
  },

  setGoods3: function(pageIndex, data) {
    if (pageIndex == 1) {
      this.data.goods3.list = [];
    }
    this.data.goods3.pageIndex = data.pageIndex;
    this.data.goods3.pageCount = data.pageCount;
    this.data.goods3.list.push(...data.list);
    this.setData({
      goodsList3: this.data.goods3.list
    })
  },

  setGoods4: function(pageIndex, data) {
    if (pageIndex == 1) {
      this.data.goods4.list = [];
    }
    this.data.goods4.pageIndex = data.pageIndex;
    this.data.goods4.pageCount = data.pageCount;
    this.data.goods4.list.push(...data.list);
    this.setData({
      goodsList4: this.data.goods4.list
    })
  },

  setGoodsSearch4: function(pageIndex, data) {
    if (pageIndex == 1) {
      this.data.searchGoods2.list = [];
    }
    this.data.searchGoods2.pageIndex = data.pageIndex;
    this.data.searchGoods2.pageCount = data.pageCount;
    this.data.searchGoods2.list.push(...data.list);
    this.setData({
      searchGoodsList2: this.data.searchGoods2.list,
      searctTip2: true,
    })
  },

  // 售后申请搜索
  componentsearch: function(res) {
    if (res.detail.value == undefined || res.detail.value.length == 0 || !res.detail.shopList) {
      return
    }
    this.data.keyWord = res.detail.value
    this.getRefundOrderList()
  },

  // 售后申请输入框获得焦点
  componentBindfocus: function(res) {
    if (!this.data.search) {
      this.setData({
        search: true
      })
    }
  },

  // 售后申请取消搜索
  cancelSearch: function() {
    this.setData({
      search: false,
      searchGoodsList: [],
      searctTip: false,
      keyWord: ''
    })
    this.data.searchGoods = {};
    this.data.keyWord = '';
  },

  // 申请记录搜索
  componentsearch2: function(res) {
    if (res.detail.value == undefined || res.detail.value.length == 0 || !res.detail.shopList) {
      return
    }
    this.data.keyWord2 = res.detail.value
    this.getAuditOrderList()
  },

  // 申请记录输入框获得焦点
  componentBindfocus2: function(res) {
    if (!this.data.search2) {
      this.setData({
        search2: true
      })
    }
  },

  // 申请记录取消搜索
  cancelSearch2: function() {
    this.setData({
      search2: false,
      searchGoodsList2: [],
      searctTip2: false,
      keyWord2: ''
    })
    this.data.searchGoods2 = {};
    this.data.keyWord2 = '';
  },

  // 分页
  lower: function() {
    let tabIndex = this.data.currentTab;
    if (tabIndex == 0) {
      if (!this.data.search) {
        if (this.data.goods.pageIndex < this.data.goods.pageCount) {
          let pageIndex = this.data.goods.pageIndex + 1;
          this.getRefundOrderList(pageIndex);
        }
      } else {
        if (this.data.searchGoods.pageIndex < this.data.searchGoods.pageCount) {
          let pageIndex = this.data.searchGoods.pageIndex + 1;
          this.getRefundOrderList(pageIndex);
        }
      }
    } else if (tabIndex == 1) {
      if (this.data.goods2.pageIndex < this.data.goods2.pageCount) {
        let pageIndex = this.data.goods2.pageIndex + 1;
        this.getAuditOrderList({
          pageIndex: pageIndex
        });
      }
    } else if (tabIndex == 2) {
      if (this.data.goods3.pageIndex < this.data.goods3.pageCount) {
        let pageIndex = this.data.goods3.pageIndex + 1;
        this.getAuditOrderList({
          pageIndex: pageIndex
        });
      }
    } else if (tabIndex == 3) {
      if (!this.data.search2) {
        if (this.data.goods4.pageIndex < this.data.goods4.pageCount) {
          let pageIndex = this.data.goods4.pageIndex + 1;
          this.getAuditOrderList({
            pageIndex: pageIndex
          });
        }
      } else {
        if (this.data.searchGoods2.pageIndex < this.data.searchGoods2.pageCount) {
          let pageIndex = this.data.searchGoods2.pageIndex + 1;
          this.getAuditOrderList({
            pageIndex: pageIndex
          });
        }
      }
    }
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
    console.log(this.data.currentTab)

    let tabIndex = this.data.currentTab;
    if (tabIndex == 0 && Object.keys(this.data.goods).length == 0) {
      this.getRefundOrderList();
    } else if (tabIndex == 1 && Object.keys(this.data.goods2).length == 0) {
      this.getAuditOrderList();
    } else if (tabIndex == 2 && Object.keys(this.data.goods3).length == 0) {
      this.getAuditOrderList();
    } else if (tabIndex == 3 && Object.keys(this.data.goods4).length == 0) {
      this.getAuditOrderList();
    }
  },

  // 提交退货退款申请成功
  applySuccess: function() {
    this.data.applySuccess = true;
  },

  // 填写邮递地址成功
  postSuccess: function() {
    this.data.postSuccess = true;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (this.data.applySuccess) {
      this.data.applySuccess = false;
      this.getRefundOrderList();
      this.getAuditOrderList({
        tabIndex: 1
      })
    }

    if (this.data.postSuccess) {
      this.data.postSuccess = false;
      this.getAuditOrderList({
        tabIndex: 1
      })
      this.getAuditOrderList({
        tabIndex: 2
      })
    }
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