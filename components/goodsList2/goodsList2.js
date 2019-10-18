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
    animationFlag: {
      type: Boolean,
      value: true
    },
    shopId: String
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
    num: 0,
    imgSrc: app.imgSrc
  },

  // 监视器
  observers: {
    'coordinates': function(coordinates) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.setData({
        axisX: coordinates.x,
        axisY: coordinates.y
      });
    },
    'animationFlag': function(res) {
      console.log(res)
    }
  },

  /**
   * 在组件实例进入页面节点树时执行
   */
  attached: function() {
    console.log(this.properties.coordinates)
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 加入购物车动画
    addCart: function(event) {
      let that = this;
      let index = event.currentTarget.dataset.index,
        id = '#' + event.currentTarget.dataset.id,
        animation = 'animationList[' + event.currentTarget.dataset.index + ']',
        current_left = null,
        current_top = null,
        target_left = null,
        target_top = null,
        distance_left = null,
        distance_top = null;
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
              query.select(id).boundingClientRect(function(rect) {
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
              setTimeout(function() {
                this.animations = wx.createAnimation({
                  duration: 0,
                  timingFunction: 'linear',
                  success: function(res) {}
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
            .then(() => {
              app.refreshCartNum;
              app.cart.userCartList()
                .then((res) => {
                  let money = 0;
                  res.validCartList.forEach((item) => {
                    if (item.shopId == that.data.shopId) {
                      item.goodsVoList.forEach((item) => {
                        let product = util.mul(item.goodsNum, item.price);
                        money = util.add(money, product);
                        this.data.num = util.add(this.data.num, item.goodsNum);
                      })
                    }
                  })
                  let obj = {
                    num: this.data.num,
                    money: money
                  };
                  this.triggerEvent('get_cart_num', obj);
                })
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
    },

    // 跳转商品详情
    goods_detail: function(event) {
      let goodId = event.currentTarget.id
      wx.navigateTo({
        url: '/pages/near/shop_detail/shop_detail?shopId=' + this.properties.shopId + '&goodId=' + goodId + '&shop_num=' + this.data.num
      });
    }
  }
})