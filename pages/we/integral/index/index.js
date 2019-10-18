// pages/we/integral/integral.js
let util = require('../../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tablist: [
      {
        id: 0,
        text: '全部'
      },
      {
        id: 1,
        text: '收入'
      },
      {
        id: 2,
        text: '支出'
      }
    ],
    tabIndex: 0,
    incomeList: {},
    spendingList: {},
    list: {},
    integral: '',
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this, headerHeight = null
    // 获取商品分类距离顶部的高
    let rect = util.getDom('.integral_detail')
    rect.then(function (value) {
      console.log(value)
      that.setData({
        scrollHeight: value[0].height,
        userInfo: app.globalData.userInfo
      })
      return Promise.resolve()
    })
    .then(() => {
      that.getMessage();
    })
    .then(() => {
      that.get_integral();
    })
  },

  // 获取积分
  get_integral: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        console.log(JSON.stringify(that.data.list) == '{}');
        if (that.data.tabIndex == 0 && JSON.stringify(that.data.list) == '{}') {
          // 获取会员积分变动记录 --- 全部
          let obj = {
            pageIndex: 1,
            pageSize: app.pageSize
          }
          return app.user.integralRecordList(obj)
        }
      })
      .then((res) => {
        console.log(JSON.stringify(that.data.list) == '{}');
        if (that.data.tabIndex == 0 && JSON.stringify(that.data.list) == '{}') {
          console.log(res)
          that.setData({
            list: res
          })
        }
        return Promise.resolve();
      })
      .then(() => {
        console.log(JSON.stringify(that.data.incomeList) == '{}');
        if (that.data.tabIndex == 1 && JSON.stringify(that.data.incomeList) == '{}') {
          // 获取会员积分变动记录 --- 收入
          let obj = {
            type: 1,
            pageIndex: 1,
            pageSize: app.pageSize
          }
          return app.user.integralRecordList(obj)
        }
      })
      .then((res) => {
        console.log(JSON.stringify(that.data.incomeList) == '{}');
        if (that.data.tabIndex == 1 && JSON.stringify(that.data.incomeList) == '{}') {
          console.log(res)
          that.setData({
            incomeList: res
          })
        }
        return Promise.resolve();
      })
      .then(() => {
        console.log(JSON.stringify(that.data.spendingList) == '{}');
        if (that.data.tabIndex == 2 && JSON.stringify(that.data.spendingList) == '{}') {
          // 获取会员积分变动记录 --- 支出
          let obj = {
            type: 2,
            pageIndex: 1,
            pageSize: app.pageSize
          }
          return app.user.integralRecordList(obj)
        }
      })
      .then((res) => {
        console.log(JSON.stringify(that.data.spendingList) == '{}');
        if (that.data.tabIndex == 2 && JSON.stringify(that.data.spendingList) == '{}') {
          console.log(res)
          that.setData({
            spendingList: res
          })
        }
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading()
      })
      .catch(app.hideLoading())
  },

  tabToggle: function (event) {
    console.log(event)
    this.setData({
      tabIndex: event.currentTarget.id
    })

    if (this.data.tabIndex == 0 && JSON.stringify(this.data.list) == '{}') {
      this.get_integral()
    } else if (this.data.tabIndex == 1 && JSON.stringify(this.data.incomeList) == '{}') {
      this.get_integral()
    } else if (this.data.tabIndex == 2 && JSON.stringify(this.data.spendingList) == '{}') {
      this.get_integral()
    }
  },

  // 获取索引
  get_current: function (event) {
    this.setData({
      tabIndex: event.detail.current
    })

    if (this.data.tabIndex == 0 && JSON.stringify(this.data.list) == '{}') {
      this.get_integral()
    } else if (this.data.tabIndex == 1 && JSON.stringify(this.data.incomeList) == '{}') {
      this.get_integral()
    } else if (this.data.tabIndex == 2 && JSON.stringify(this.data.spendingList) == '{}') {
      this.get_integral()
    }
  },

  // 查询积分消息
  getMessage: function() {
    // 获取消息列表
    let params = {
      type: '6'
    }
    app.other.messageList(params)
      .then((data) => {
        if (data.list != null && data.list.length>0) {
          that.setData({
            message: data.list[0]
          });
        }
      })
  },

  // 触底加载更多
  lower: function () {
    let that = this;
    if (that.data.tabIndex == 0 && that.data.list.pageIndex < that.data.list.pageCount){
      let pageIndex = that.data.list.pageIndex + 1;
      app.showLoading().then(() => {
        // 获取会员积分变动记录 --- 全部
        let obj = {
          pageIndex: pageIndex,
          pageSize: app.pageSize
        }
        return app.user.integralRecordList(obj)
      }).then((res) => {
        console.log(res);
        let list = util.cycle(res.list, that.data.list.list);
        that.data.list.list = list;
        that.data.list.pageIndex = pageIndex;
        that.setData({
          list: that.data.list
        })
      }).then(() => {
        app.hideLoading()
      })
    } else if (that.data.tabIndex == 1 && that.data.incomeList.pageIndex < that.data.incomeList.pageCount) {
      let pageIndex = that.data.incomeList.pageIndex + 1;
      app.showLoading().then(() => {
        // 获取会员积分变动记录 --- 收入
        let obj = {
          type: 1,
          pageIndex: pageIndex,
          pageSize: app.pageSize
        }
        return app.user.integralRecordList(obj)
      }).then((res) => {
        console.log(res);
        let list = util.cycle(res.list, that.data.incomeList.list);
        that.data.incomeList.list = list;
        that.data.incomeList.pageIndex = pageIndex;
        that.setData({
          incomeList: that.data.incomeList
        })
      }).then(() => {
        app.hideLoading()
      })
    } else if (that.data.tabIndex == 2 && that.data.spendingList.pageIndex < that.data.spendingList.pageCount) {
      let pageIndex = that.data.spendingList.pageIndex + 1;
      app.showLoading().then(() => {
        // 获取会员积分变动记录 --- 支出
        let obj = {
          type: 2,
          pageIndex: pageIndex,
          pageSize: app.pageSize
        }
        return app.user.integralRecordList(obj)
      }).then((res) => {
        console.log(res);
        let list = util.cycle(res.list, that.data.spendingList.list);
        that.data.spendingList.list = list;
        that.data.spendingList.pageIndex = pageIndex;
        that.setData({
          spendingList: that.data.spendingList
        })
      }).then(() => {
        app.hideLoading()
      })
    }
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
  onShareAppMessage: function () {

  }
})