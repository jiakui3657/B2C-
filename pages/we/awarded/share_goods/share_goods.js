// pages/we/awarded/share_goods/share_goods.js
let app = getApp()
let util = require('../../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // tab切换  
    currentTab: 0,
    //商品
    goods: {},
    //好物
    circle: {},
    circleType: ''
  },

  //点击tab切换
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      });
      console.log(e.target.dataset.current);
    }

    if (that.data.currentTab == 0 && JSON.stringify(that.data.goods) == '{}') {
      that.get_goods();
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.circle) == '{}') {
      that.get_circle();
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    this.setData({
      currentTab: options.flag
    })

    let that = this;
    console.log(that.data.currentTab == 0, JSON.stringify(that.data.goods) == '{}');
    if (that.data.currentTab == 0 && JSON.stringify(that.data.goods) == '{}') {
      that.get_goods();
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.circle) == '{}') {
      that.get_circle();
    }
  },

  // 触底加载更多
  lower: function (event) {
    let that = this;
    if (that.data.currentTab == 0 && that.data.goods.pageIndex < that.data.goods.pageCount){
      let pageIndex = that.data.goods.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 获取全部商品
          let params = {
            areaId: app.areaId,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          };
          return app.goods.list(params);
        })
        .then((data) => {
          console.log(data);
          let goodsList = 'goods.list',
              goodsPageIndex = 'goods.pageIndex',
              list = util.cycle(data.list, that.data.goods.list);
          that.setData({
            [goodsList]: list,
            [goodsPageIndex]: pageIndex
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
        .catch(app.hideLoading)
    } else if (that.data.currentTab == 1 && that.data.circle.pageIndex < that.data.circle.pageCount) {
      let pageIndex = that.data.circle.pageIndex + 1;
      app.showLoading()
        .then(() => {
          // 获取好物
          let params = {
            typeCode: that.data.circleType,
            pageIndex: pageIndex,
            pageSize: app.pageSize
          }
          return app.thing.thingList(params)
        })
        .then((data) => {
          console.log(data);
          // 截取富文本中的文字和图片
          data.list.forEach((items, index) => {
            let arr = [],
                imgList = [];
            imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
            console.log(imgList);
            imgList.forEach((item) => {
              console.log(item);
              var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
              console.log(src[1]);
              arr.push(src[1]);
              console.log(arr);
            })
            items.imgList = items.imgList.concat(arr);
            console.log(items.imgList);

            items.content = items.content.replace(/<[^>]*>|/g, "");
          })
          let circleList = 'circle.list',
            circlePageIndex = 'circle.pageIndex',
            list = util.cycle(data.list, that.data.circle.list);
          that.setData({
            [circleList]: list,
            [circlePageIndex]: pageIndex
          });
          return Promise.resolve();
        })
        .then(app.hideLoading)
        .catch(app.hideLoading)
    }
  },

  // 获取商品
  get_goods: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        // 获取全部商品
        let params = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        };
        return app.goods.list(params);
      })
      .then((data) => {
        console.log(data);
        that.setData({
          goods: data
        });
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 获取好物
  get_circle: function () {
    let that = this;
    app.showLoading()
      .then(() => {
        // 获取好物分类
        return app.thing.thingTypeList()
      })
      .then((data) => {
        that.setData({
          circleType: data.list[1]
        })
        return Promise.resolve(data.list);
      })
      .then((data) => {
        // 获取好物
        let params = {
          typeCode: data[1].code,
          pageIndex: 1,
          pageSize: app.pageSize
        }
        return app.thing.thingList(params)
      })
      .then((data) => {
        // 截取富文本中的文字和图片
        data.list.forEach((items, index) => {
          let arr = [],
            imgList = [];
          imgList = items.content.match(/<img.*?(?:>|\/>)/gi) || [];
          console.log(imgList);
          imgList.forEach((item) => {
            console.log(item);
            var src = item.match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
            console.log(src[1]);
            arr.push(src[1]);
            console.log(arr);
          })
          items.imgList = items.imgList.concat(arr);
          console.log(items.imgList);

          items.content = items.content.replace(/<[^>]*>|/g, "");
        })
        that.setData({
          circle: data
        });
        return Promise.resolve();
      })
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    var query = wx.createSelectorQuery().in(this);
    query.select('.order_Content').boundingClientRect();
    query.exec(res => {
      var searchHeight = res[0].height;
      var windowHeight = wx.getSystemInfoSync().windowHeight;
      var scrollHeight = windowHeight - searchHeight;
      this.setData({ scrollHeight: scrollHeight });
    });
  },

  //滑动切换tab 
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
    if (that.data.currentTab == 0 && JSON.stringify(that.data.goods) == '{}') {
      that.get_goods();
    } else if (that.data.currentTab == 1 && JSON.stringify(that.data.circle) == '{}') {
      that.get_circle();
    }
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
  onShareAppMessage: function (res) {
    console.log(res);
    let that = this,
        index = res.target.dataset.index;
    console.log(app.globalData.userInfo)
    if (res.from == 'button' && res.target.dataset.type == 0) {
      return {
        path: '/pages/classify/goods_detail/goods_detail?id=' + that.data.goods.list[index].goodsId + '&goodsSpecId=' + that.data.goods.list[index].goodsSpecId + '&shareUserId=' + app.globalData.userInfo.userId,
        title: that.data.goods.list[index].goodsName,
        imageUrl: that.data.goods.list[index].goodsImg,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    } else if (res.from == 'button' && res.target.dataset.type == 1) {
      return {
        title: res.target.dataset.title,
        path: '/pages/home/circle/share_dynamic_details/share_dynamic_details?shareid=' + res.target.dataset.shareid + '&path=' + '/pages/home/circle/share_dynamic_details/share_dynamic_details&shareUserId=' + app.globalData.userInfo.userId,
        imageUrl: res.target.dataset.src,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
  }
})