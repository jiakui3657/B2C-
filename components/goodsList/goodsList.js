// components/goodsList/goodsList.js
let util = require('../../utils/util.js');
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: Array,
    coordinates: Object,
    shopid: String,
    couponsource: String,
    animationFlag: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    animationList: [],
    animationIndex: 0,
    flag: true,
    axisX: 0,
    axisY: 0,
    imgSrc: app.imgSrc,
    shopping_cart: ''
  },

  // 监视器
  observers: {
    'coordinates': function (coordinates) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.setData({
        axisX: coordinates.x,
        axisY: coordinates.y
      });
    },
    'animationFlag': function (res) {
      console.log(res)
    }
  },

  /**
   * 在组件实例进入页面节点树时执行
   */
  attached: function () {
    let that = this;
    this.setData({
      couponsource: this.properties.couponsource
    })
    console.log(that.properties.couponsource);
    app.cart.userCartList()
      .then((res) => {
        console.log(res, that.properties.shopid);
        res.validCartList.forEach((item) => {
          if (item.shopId == that.properties.shopid) {
            that.setData({
              shopping_cart: item.goodsVoList.length
            })
          }
        })
      })
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 加入购物车动画
    addCart: function (event) {
      let that = this;
      let index = event.currentTarget.dataset.index, id = '#' + event.currentTarget.dataset.id, animation = 'animationList[' + event.currentTarget.dataset.index + ']', current_left = null, current_top = null, target_left = null, target_top = null, distance_left = null, distance_top = null;
      console.log(that.properties.animationFlag);
      if (that.properties.animationFlag) {
        let query = this.createSelectorQuery();

        that.animation = wx.createAnimation()

        let promise = new Promise((resolve, reject) => {
          resolve();
        })

        if (that.data.flag) {
          promise.then(() => {
            that.setData({
              flag: false
            })
          })
            .then(() => {
              // 获取当前元素的坐标
              query.select(id).boundingClientRect(function (rect) {
                current_left = rect.left + rect.width / 2
                current_top = rect.top + rect.height / 2
                // 获取终点元素的坐标
                console.log(that.data.axisX, that.data.axisY)
                distance_left = that.data.axisX - current_left
                distance_top = that.data.axisY - current_top
                console.log(current_left, current_top, that.data.axisX, that.data.axisY, distance_left, distance_top)

                that.animation.translateX(distance_left)
                  .translateY(distance_top)
                  .scale(0)
                  .step()
                that.setData({
                  animationIndex: event.currentTarget.dataset.index,
                  [animation]: that.animation.export()
                })
              }).exec()
            })
            .then(app.refreshCartNum)
            .then(() => {
              // 回到初始化坐标
              setTimeout(function () {
                this.animations = wx.createAnimation({
                  duration: 0,
                  timingFunction: 'linear',
                  success: function (res) {
                  }
                })
                this.animations.translateX(0)
                  .translateY(0)
                  .scale(1)
                  .step()
                that.setData({
                  flag: true,
                  [animation]: this.animations.export()
                })
              }, 400)
            })
            .then(() => {
              // 加入购物车
              console.log(that.data.list);
              let obj = {
                goodsId: that.data.list[index].goodsId,
                organId: that.data.list[index].organId,
                goodsSpecId: that.data.list[index].goodsSpecId,
                goodsNum: 1
              };
              return app.cart.addUserCart(obj);
            })
            .then((data) => {
              let goodsList = app.globalData.goodsId || [];
              goodsList.push(that.data.list[index].goodsId);
              app.setGlobalData('goodsId', goodsList);
              let obj = {
                refreshState: true
              }
              this.triggerEvent('refresh', obj);
              return Promise.resolve();
            })
            .then(app.refreshCartNum)
            .then(() => {
              console.log(app.globalData.totalNumber);
              let obj = {
                num: app.globalData.totalNumber
              };
              this.triggerEvent('get_cart_num', obj);
            })
        }
      } else {
        app.showLoading()
          .then(() => {
            // 加入购物车
            console.log(that.data.list);
            let obj = {
              goodsId: that.data.list[index].goodsId,
              organId: that.data.list[index].organId,
              goodsSpecId: that.data.list[index].goodsSpecId,
              goodsNum: 1
            };
            return app.cart.addUserCart(obj);
          })
          .then((data) => {
            let obj = {
              title: '添加成功',
              icon: 'success'
            };
            app.showToast(obj);
            return Promise.resolve();
          })
          .then(app.refreshCartNum)
          .then(app.hideLoading)
          .catch(app.hideLoading)
      }
      
      // let that = this
      // let id = '#' + event.currentTarget.dataset.id
      // let animation = 'animationList[' + event.currentTarget.dataset.index + ']'
      // let current_left = null, current_top = null, target_left = null, target_top = null, distance_left = null, distance_top = null
      // let query = this.createSelectorQuery()
      // query.select(id).boundingClientRect(function (rect) {
      //   current_left = rect.left + rect.width / 2
      //   current_top = rect.top + rect.height / 2
      // }).exec()

      // let query_target = this.createSelectorQuery()
      // query_target.select('#target').boundingClientRect(function (rect) {
      //   console.log(rect)
      //   target_left = rect.left + rect.width / 2
      //   target_top = rect.top + rect.height / 2
      //   distance_left = target_left - current_left
      //   distance_top = target_top - current_top
      //   console.log(current_left, current_top, target_left, target_top, distance_left, distance_top)
        
      //   this.animation = wx.createAnimation()
      //   this.animation.translateX(distance_left)
      //     .translateY(distance_top)
      //     .scale(0)
      //     .step()

      //   if(that.data.flag){
      //     that.setData({
      //       flag: false
      //     })
      //     that.setData({
      //       animationIndex: event.currentTarget.dataset.index,
      //       [animation]: this.animation.export()
      //     })
      //   }
        
      //   setTimeout(function () {
      //     this.animations = wx.createAnimation({
      //       duration: 0,
      //       timingFunction: 'linear',
      //       success: function (res) {
      //       }
      //     })
      //     this.animations.translateX(0)
      //       .translateY(0)
      //       .scale(1)
      //       .step()
      //     that.setData({ 
      //       flag: true,
      //       [animation]: this.animations.export()
      //     })
      //   }, 400)
      // }).exec()
    },

    // 跳转商品详情
    goods_detail: function (event) {
      let id = event.currentTarget.id;
      console.log(this);
      wx.navigateTo({
        url: '/pages/classify/goods_detail/goods_detail?id=' + id
      });
    },

    // 跳转店铺商品详情
    shop_goods_detail: function (event) {
      let id = event.currentTarget.id;
      console.log(this);
      wx.navigateTo({
        url: '/pages/near/shop_detail/shop_detail?shopId=' + this.data.shopid + '&goodId=' + id + '&shop_num=' + this.data.shopping_cart + '&come=shop'
      });
    }
  }
})
