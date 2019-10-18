// pages/cart/index/index.js
let util = require('../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    platform_munit_flag: false,
    merchant_munit_flag: false,
    goodsList: {},
    orderList: [],
    unGoodsVoList: [],
    slideWidth: 320,
    startX: 0,
    rolling: true,
    idx: 0,
    index: 0,
    specificationList: [],
    cartGoodsSpecVo: [],
    tShopGoodsSpecVo: [],
    goodsSpecId: '',
    price: '',
    actPrice: '',
    specificationName: '',
    goodsBuyNum: '',
    stock: '',
    coordinates: {
      x: 0,
      y: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imgSrc: getApp().imgSrc
    });
  },

  drawStart: function (e) {
    let orderList = this.data.orderList
    orderList.forEach((item) => {
      item.goodsVoList.forEach((item) => {
        item.right = 0;
      });
    });
    this.setData({
      orderList: orderList,
      startX: e.touches[0].clientX
    });
    console.log(orderList, this.data.startX)
  },
  drawMove: function (e) {
    console.log(e)
    var touch = e.touches[0]
    var item = this.data.orderList[e.currentTarget.dataset.idx].goodsVoList[e.currentTarget.dataset.index]
    var disX = this.data.startX - touch.clientX
    var slideWidth = this.data.slideWidth
    if (disX >= 20) {
      if (disX > slideWidth) {
        disX = slideWidth;
      };
      console.log(disX);
      item.right = disX;
      wx.stopPullDownRefresh();
      this.setData({
        orderList: this.data.orderList,
        rolling: false
      });
    } else {
      item.right = 0;
      this.setData({
        orderList: this.data.orderList,
        rolling: true
      });
    }
  },
  drawEnd: function (e) {
    var item = this.data.orderList[e.currentTarget.dataset.idx].goodsVoList[e.currentTarget.dataset.index];
    var slideWidth = this.data.slideWidth;
    if (item.right >= slideWidth / 4) {
      item.right = slideWidth;
      this.setData({
        orderList: this.data.orderList,
        rolling: true
      });
    } else {
      item.right = 0;
      this.setData({
        orderList: this.data.orderList,
        rolling: true
      });
    }
  },

  // 跳转商品详情
  goods_detail: function (event) {
    console.log(event);
    let isSelf = event.currentTarget.dataset.isself;
    let shopId = event.currentTarget.dataset.shopid;
    let goodsId = event.currentTarget.dataset.goodsid;
    let num = event.currentTarget.dataset.num;

    if (isSelf == 1) {
      wx.navigateTo({
        url: '/pages/near/shop_detail/shop_detail?shopId=' + shopId + '&&goodId=' + goodsId + '&&shop_num=' + num
      });
    } else {
      wx.navigateTo({
        url: '/pages/classify/goods_detail/goods_detail?id=' + goodsId
      });
    }
  },

  // 选择商品
  choose: function (event) {
    let index = event.currentTarget.dataset.index, idx = event.currentTarget.dataset.idx, price = 0;
    this.data.orderList[idx].goodsVoList[index].selected = !this.data.orderList[idx].goodsVoList[index].selected;
    this.data.orderList.forEach((item) => {
      let selected = item.goodsVoList.filter((item, index, arr) => item.selected == false);
      console.log(this.data.orderList);
      if (selected.length < 1) {
        item.selectedAll = true;
      } else {
        item.selectedAll = false;
      }
    })

    this.data.orderList[idx].goodsVoList.forEach((item) => {
      if (item.selected) {
        let goods_price = item.goodsBuyNum && item.goodsNum <= item.goodsBuyNum ? util.mul(item.actPrice, item.goodsNum) : util.mul(item.price, item.goodsNum);
        price = util.add(price, goods_price);
      }
    });
    this.data.orderList[idx].goodsAmount = price;

    this.setData({
      orderList: this.data.orderList
    });
  },

  // 选择商家
  chooseAll: function (event) {
    let idx = event.currentTarget.dataset.idx, price = 0;
    this.data.orderList[idx].selectedAll = !this.data.orderList[idx].selectedAll;
    this.data.orderList[idx].goodsVoList.forEach((item) => {
      item.selected = this.data.orderList[idx].selectedAll
      if (item.selected) {
        let goods_price = item.goodsBuyNum && item.goodsNum <= item.goodsBuyNum ? util.mul(item.actPrice, item.goodsNum) : util.mul(item.price, item.goodsNum);
        price = util.add(price, goods_price);
      }
    })
    this.data.orderList[idx].goodsAmount = price;
    console.log(this.data.orderList);
    this.setData({
      orderList: this.data.orderList
    });
  },

  // 打开模态框
  open_modal: function (event) {
    console.log(event)
    let that = this, index = event.currentTarget.dataset.index, idx = event.currentTarget.dataset.idx;
    app.showLoading()
      .then(() => {
        // 获取商品规格
        let obj = {
          goodsId: that.data.orderList[idx].goodsVoList[index].goodsId,
          organId: that.data.orderList[idx].goodsVoList[index].organId,
          goodsSpecId: that.data.orderList[idx].goodsVoList[index].goodsSpecId
        };
        return app.cart.getCartGoodsSpec(obj);
      }).then((res) => {
        console.log(res)
        that.setData({
          idx: idx,
          index: index,
          price: that.data.orderList[idx].goodsVoList[index].price,
          actPrice: that.data.orderList[idx].goodsVoList[index].goodsNum <= that.data.orderList[idx].goodsVoList[index].goodsBuyNum ? that.data.orderList[idx].goodsVoList[index].actPrice : 0,
          specificationList: res.goodsAttrGroupVo,
          cartGoodsSpecVo: res.cartGoodsSpecVo,
          goodsSpecId: that.data.orderList[idx].goodsVoList[index].goodsSpecId
        });

        console.log(that.data.actPrice);

        if (res.TOrganType == 'B1') {
          // 修改商家规格选中字段
          res.TShopGoodsSpecVo.forEach((item) => {
            if (that.data.orderList[idx].goodsVoList[index].goodsSpecId == item.id) {
              item.isSelect = 1;
            } else {
              item.isSelect = 0;
            }
          });
          console.log(res.TShopGoodsSpecVo);
          that.setData({
            merchant_munit_flag: true,
            tShopGoodsSpecVo: res.TShopGoodsSpecVo
          });
        } else {
          that.setData({
            platform_munit_flag: true
          });
        }

        return Promise.resolve();
      }).then(() => {
        app.hideLoading();
      })
  },

  // 关闭模态框
  close_modal: function () {
    this.setData({
      platform_munit_flag: false,
      merchant_munit_flag: false
    })
  },

  // 自营店规格切换
  specificationToggle: function (event) {
    console.log(event);
    let index = event.currentTarget.dataset.index, idx = event.currentTarget.dataset.idx, staging = '', list = [], goodsSpecId = '', price = '', specificationName = '';

    this.data.specificationList[idx].values.forEach((item, i) => {
      if (item.isSelect == 1) {
        staging = i;
      }
    })

    // 当前规格选中
    this.data.specificationList[idx].values.forEach((item, i) => {
      console.log(index, i);
      item.isSelect = index == i ? 1 : 0;
    })

    // 获取规格的组合id
    this.data.specificationList.forEach((item) => {
      item.values.forEach((item) => {
        if (item.isSelect == 1) {
          // str += item.id + ',';
          list.push(item.id);
        }
      })
    })

    let str = list.join();
    let str1 = list.reverse();
    str1 = str1.join();

    // 匹配购物车id
    this.data.cartGoodsSpecVo.forEach((item) => {
      if (item.goodsAttrs == str || item.goodsAttrs == str1) {
        if (item.stock >= 1) {
          this.setData({
            specificationList: this.data.specificationList,
            goodsSpecId: item.id,
            price: item.price,
            actPrice: item.actPrice ? item.actPrice : 0,
            specificationName: item.name,
            goodsBuyNum: item.goodsBuyNum ? item.goodsBuyNum : 0,
            stock: item.stock
          });
          console.log(this.data.actPrice);
        } else {
          app.showToast({ title: '该规格无库存' });
          this.data.specificationList[idx].values.forEach((item, i) => {
            item.isSelect = staging == i ? 1 : 0;
          })
        }
      }
    })
  },

  // 自营店修改规格
  specification: function (event) {
    let that = this, index = that.data.index, idx = that.data.idx;
    app.showLoading()
      .then(() => {
        // 修改规格
        let obj = {
          cartId: that.data.orderList[idx].goodsVoList[index].cartId,
          goodsId: that.data.orderList[idx].goodsVoList[index].goodsId,
          goodsSpecId: that.data.goodsSpecId
        };
        return app.cart.updateSpec(obj);
      })
      .then((res) => {
        console.log(res);

        // 修改规格提示
        app.showToast({ title: '规格修改成功' });

        // 修改购物车列表价格
        let item_price = 'orderList[' + idx + '].goodsVoList[' + index + '].price';
        let item_goodsSpecName = 'orderList[' + idx + '].goodsVoList[' + index + '].goodsSpecName';
        let item_goodsSpecId = 'orderList[' + idx + '].goodsVoList[' + index + '].goodsSpecId';
        let item_goodsBuyNum = 'orderList[' + idx + '].goodsVoList[' + index + '].goodsBuyNum';
        let item_goodsActPrice = 'orderList[' + idx + '].goodsVoList[' + index + '].actPrice';
        let item_stock = 'orderList[' + idx + '].goodsVoList[' + index + '].stock';
        that.setData({
          [item_price]: that.data.price,
          [item_goodsSpecName]: that.data.specificationName,
          [item_goodsSpecId]: that.data.goodsSpecId,
          [item_goodsBuyNum]: that.data.goodsBuyNum,
          [item_goodsActPrice]: that.data.actPrice,
          [item_stock]: that.data.stock
        });
        console.log(that.data.actPrice);
        return Promise.resolve();
      }).then(() => {
        that.setData({
          platform_munit_flag: false
        })
        app.hideLoading();
      })
  },

  // 商家规格切换
  merchant_specificationToggle: function (event) {
    let index = event.currentTarget.dataset.index, goodsSpecId = '', price = '', specificationName = '',stock = '';

    // 切换商家规格
    this.data.tShopGoodsSpecVo.forEach((item, i) => {
      item.isSelect = index == i ? 1 : 0;
      if (index == i) {
        item.isSelect = 1;
        goodsSpecId = item.goodsSpecId;
        price = item.price;
        specificationName = item.specificationName;
        stock = item.stock;
      } else {
        item.isSelect = 0;
      }
    });

    this.setData({
      tShopGoodsSpecVo: this.data.tShopGoodsSpecVo,
      goodsSpecId: goodsSpecId,
      price: price,
      stock: stock,
      specificationName: specificationName
    });
  },

  // 商家修改规格
  merchant_specification: function (event) {
    let that = this, idx = that.data.idx, index = that.data.index, goodsSpecId = '', price = '', specificationName = '';
    app.showLoading()
      .then(() => {
        that.data.tShopGoodsSpecVo.forEach((item) => {
          if (item.isSelect == 1) {
            goodsSpecId = item.id;
            price = item.price;
            specificationName = item.name;
          }
        });
        return Promise.resolve();
      })
      .then(() => {
        // 修改规格
        let obj = {
          cartId: that.data.orderList[idx].goodsVoList[index].cartId,
          goodsId: that.data.orderList[idx].goodsVoList[index].goodsId,
          goodsSpecId: goodsSpecId
        };
        return app.cart.updateSpec(obj);
      }).then((res) => {
        console.log(res);

        // 修改规格提示
        app.showToast({ title: '规格修改成功' });

        // 修改购物车列表价格
        let item_price = 'orderList[' + idx + '].goodsVoList[' + index + '].price';
        let item_goodsSpecName = 'orderList[' + idx + '].goodsVoList[' + index + '].goodsSpecName';
        let item_goodsSpecId = 'orderList[' + idx + '].goodsVoList[' + index + '].goodsSpecId';
        that.setData({
          [item_price]: price,
          [item_goodsSpecName]: specificationName,
          [item_goodsSpecId]: goodsSpecId
        });
        return Promise.resolve();
      }).then(() => {
        that.setData({
          merchant_munit_flag: false
        });
        app.hideLoading();
      })
  },

  // 删除商品
  delect: function (event) {
    console.log(event)
    let that = this, index = event.currentTarget.dataset.index, idx = event.currentTarget.dataset.idx, item = 'that.data.orderList[' + idx + '].goodsVoList[' + index + '].right';
    app.showLoading()
      .then(() => {
        // 删除商品
        let obj = {
          cartId: that.data.orderList[idx].goodsVoList[index].cartId
        };
        return app.cart.deleteCartGoods(obj, true);
      })
      .then((res) => {
        console.log(res, index);

        // 删除商品
        that.data.orderList[idx].goodsVoList.splice(index, 1);

        // 判断是否是最后一个商品
        if (that.data.orderList[idx].goodsVoList.length <= 0) {
          that.data.orderList.splice(idx, 1);
        }

        that.setData({
          orderList: that.data.orderList
        });
      })
      .then(app.refreshCartNum)
      .then(() => {
        that.setData({
          [item]: 0
        });
        app.hideLoading();
      });
  },

  // 数量加
  add: function (event) {
    let that = this, index = event.currentTarget.dataset.index, idx = event.currentTarget.dataset.idx;
    if (this.data.orderList[idx].goodsVoList[index].goodsNum < this.data.orderList[idx].goodsVoList[index].stock) {
      this.data.orderList[idx].goodsVoList[index].goodsNum = util.add(this.data.orderList[idx].goodsVoList[index].goodsNum, 1)
      // this.data.shop_price = util.mul(this.data.shop_num, this.data.goods_data.goodsSpecList[this.data.munit_flag].price)
      // 修改购物车商品数量
      let obj = {
        cartId: that.data.orderList[idx].goodsVoList[index].cartId,
        goodsId: that.data.orderList[idx].goodsVoList[index].goodsId,
        goodsSpecId: that.data.orderList[idx].goodsVoList[index].goodsSpecId,
        goodsNum: that.data.orderList[idx].goodsVoList[index].goodsNum
      };
      app.cart.updateCartGoodsNum(obj)
        .then((data) => {
          console.log(data);

          // 重置商家商品总金额
          let price = 0;
          that.data.orderList.forEach((item) => {
            item.goodsVoList.forEach((item) => {
              if (item.selected) {
                let goods_price = item.goodsBuyNum && item.goodsNum <= item.goodsBuyNum ? util.mul(item.actPrice, item.goodsNum) : util.mul(item.price, item.goodsNum);
                price = util.add(price, goods_price);
              }
            });
            item.goodsAmount = price;
          });
          that.setData({
            orderList: that.data.orderList
          });
        })
        .then(app.refreshCartNum)
        .then(() => {
          app.hideLoading();
        })
    } else {
      app.showToast({title: '库存不足'})
    }
  },

  // 数量减
  reduction: function (event) {
    let that = this, index = event.currentTarget.dataset.index, idx = event.currentTarget.dataset.idx;
    if (this.data.orderList[idx].goodsVoList[index].goodsNum > 1) {
      this.data.orderList[idx].goodsVoList[index].goodsNum = util.sub(this.data.orderList[idx].goodsVoList[index].goodsNum, 1);
      let obj = {
        cartId: that.data.orderList[idx].goodsVoList[index].cartId,
        goodsId: that.data.orderList[idx].goodsVoList[index].goodsId,
        goodsSpecId: that.data.orderList[idx].goodsVoList[index].goodsSpecId,
        goodsNum: that.data.orderList[idx].goodsVoList[index].goodsNum
      };
      app.cart.updateCartGoodsNum(obj)
        .then((data) => {
          console.log(data);

          // 重置商家商品总金额
          let price = 0;
          that.data.orderList.forEach((item) => {
            item.goodsVoList.forEach((item) => {
              if (item.selected) {
                let goods_price = item.goodsBuyNum && item.goodsNum <= item.goodsBuyNum ? util.mul(item.actPrice, item.goodsNum) : util.mul(item.price, item.goodsNum);
                price = util.add(price, goods_price);
              }
            });
            item.goodsAmount = price;
          });
          that.setData({
            orderList: that.data.orderList
          });
        })
        .then(() => {
          // 更新购物车商品数量
          return app.cart.getCartGoodsNum();
        })
        .then(app.refreshCartNum)
        .then(() => {
          app.hideLoading();
        })
    } else {
      let obj = {
        content: '您确定删除该商品吗'
      }
      util.showModal(obj)
        .then(() => {
          return app.showLoading()
            .then(() => {
              // 删除商品
              let obj = {
                cartId: that.data.orderList[idx].goodsVoList[index].cartId
              }
              return app.cart.deleteCartGoods(obj, true);
            })
            .then((data) => {
              console.log(data, index);

              // 删除商品
              that.data.orderList[idx].goodsVoList.splice(index, 1);

              // 判断是否是最后一个商品
              if (that.data.orderList[idx].goodsVoList.length <= 0) {
                that.data.orderList.splice(idx, 1);
              }

              that.setData({
                orderList: that.data.orderList
              });
            })
            .then(() => {
              // 更新购物车商品数量
              return app.cart.getCartGoodsNum();
            })
            .then((data) => {
              console.log(data);
              app.globalData.totalNumber = data.num;
              util.setTabBarBadge(data.num);
            })
            .then(() => {
              app.hideLoading();
            });
        });
    }
  },

  // 收藏
  collection: function (event) {
    let that = this, index = event.currentTarget.dataset.index, idx = event.currentTarget.dataset.idx;
    console.log(index, idx);
    app.showLoading()
      .then(() => {
        let obj = {
          id: event.currentTarget.id,
          type: 1
        }
        return app.user.addCollection(obj);
      })
      .then((data) => {
        console.log(data);
        return Promise.resolve();
      })
      .then(() => {
        console.log(that.data.orderList[idx].goodsVoList[index]);
        // 删除商品
        let obj = {
          cartId: that.data.orderList[idx].goodsVoList[index].cartId
        };
        return app.cart.deleteCartGoods(obj, true);
      })
      .then((data) => {
        console.log(data);

        // 删除商品
        that.data.orderList[idx].goodsVoList.splice(index, 1);

        // 判断是否是最后一个商品
        if (that.data.orderList[idx].goodsVoList.length <= 0) {
          that.data.orderList.splice(idx, 1);
        }

        that.setData({
          orderList: that.data.orderList
        })

        app.showToast({ title: '收藏成功', icon: 'success' });

        return Promise.resolve();
      })
      .then(app.refreshCartNum)
      .then(app.hideLoading)
      .catch(app.hideLoading)
  },

  // 接受组件传过来的值
  refresh: function (data) {
    console.log(data.detail.refreshState);
    this.onShow();
  },

  // 自定义数字
  // get_number: function (event) {
  //   console.log(event)
  //   let that = this, index = event.currentTarget.dataset.index, idx = event.currentTarget.dataset.idx;
  //   let value = event.detail.value > 0 ? event.detail.value : 1;
  //   that.data.orderList[idx].goodsVoList[index].goodsNum = value
  //   app.showLoading().then(() => {
  //     // 修改购物车商品数量
  //     let obj = {
  //       cartId: that.data.orderList[idx].goodsVoList[index].cartId,
  //       goodsId: that.data.orderList[idx].goodsVoList[index].goodsId,
  //       goodsSpecId: that.data.orderList[idx].goodsVoList[index].goodsSpecId,
  //       goodsNum: that.data.orderList[idx].goodsVoList[index].goodsNum
  //     };
  //     return app.cart.updateCartGoodsNum(obj)
  //   }).then((res) => {
  //     console.log(res)

  //     // 重置商家商品总金额
  //     let price = 0;
  //     that.data.orderList.forEach((item) => {
  //       item.goodsVoList.forEach((item) => {
  //         if (item.selected) {
  //           price += item.price * item.goodsNum
  //         }
  //       })
  //       item.goodsAmount = price
  //     })
  //     that.setData({
  //       orderList: that.data.orderList
  //     });

  //     let obj = {
  //       title: '商品数量修改成功',
  //       icon: 'success'
  //     }
  //     app.showToast(obj)
  //   }).then(() => {
  //     // 更新购物车商品数量
  //     return app.cart.getCartGoodsNum()
  //   }).then((res) => {
  //     console.log(res)
  //     app.globalData.totalNumber = res.num;
  //     util.setTabBarBadge(res.num)
  //   }).then(() => {
  //     app.hideLoading();
  //   })
  //   console.log(this.data.orderList)
  // },

  // 去凑单
  spell_go: function (event) {
    console.log();
    if (event.currentTarget.dataset.isself == 2) {
      wx.switchTab({
        url: '/pages/classify/index/index'
      });
    } else {
      wx.navigateTo({
        url: '/pages/near/shop/shop?id=' + event.currentTarget.id
      })
    }
  },

  // 订单结算
  order: function (event) {
    let that = this, idx = event.currentTarget.dataset.idx, flag = false, arr = [];
    that.data.orderList[idx].goodsVoList.forEach((item) => {
      if (item.selected) {
        flag = true;
        arr.push({
          goodsId: item.goodsId,
          goodsSpecId: item.goodsSpecId,
          // goodsNum: item.goodsNum > item.goodsBuyNum ? item.goodsBuyNum : item.goodsNum,
          goodsNum: item.goodsNum,
          organId: item.organId
        });
      }
    })
    console.log(arr, flag);

    let list = that.data.orderList[idx].goodsVoList.filter((item, index, arr) => item.goodsNum > item.stock && item.selected);
    let list2 = that.data.orderList[idx].goodsVoList.filter((item, index, arr) => item.goodsNum <= item.goodsBuyNum && item.selected);
    let list3 = that.data.orderList[idx].goodsVoList.filter((item, index, arr) => item.goodsNum > item.goodsBuyNum && item.selected);
    let list4 = that.data.orderList[idx].goodsVoList.filter((item, index, arr) => item.goodsNum > item.activityStock && item.selected);
    console.log(list, list2);

    if (flag) {
      if (list3.length > 0 && list.length > 0 || list2.length > 0 && list4.length > 0 || list.length > 0) {
        app.showToast({ title: '库存不足' });
      } else {
        wx.navigateTo({
          url: '/pages/cart/confirm_order/confirm_order?isCartOrder=1',
          success: function (res) {
            res.eventChannel.emit('acceptDataFromOpenerPage', { data: arr })
          }
        })
      }
    } else {
      app.showToast({ title: '您还没有选择商品哦' })
    }
  },

  // 失效商品提示
  failure_goods_title: function () {
    app.showToast({ title: '该商品已经下架了~' })
  },

  empty_goods: function () {
    let that = this, str = '';
    app.showLoading()
      .then(() => {
        that.data.unGoodsVoList.forEach((item, index) => {
          str += item.cartId + ',';
        });
        str = str.substr(0, str.length - 1)
        console.log(str);
      })
      .then(() => {
        // 获取购物车有效商品列表
        console.log(str);
        let obj = {
          cartId: str
        };
        return app.cart.deleteCartGoods(obj);
      })
      .then((res) => {
        console.log(res);
        that.setData({
          unGoodsVoList: []
        })
        return Promise.resolve();
      })
      .then(() => {
        app.showToast({ title: '删除商品成功' });
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    util.getDom('#target')
      .then((rect) => {
        console.log(rect);
        let coordinatesX = 'coordinates.x', coordinatesY = 'coordinates.y';
        that.setData({
          [coordinatesX]: rect[0].left + rect[0].width / 2,
          [coordinatesY]: rect[0].top + rect[0].height / 2
        });
      });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    app.showLoading()
      .then(() => {
        // 获取购物车有效商品列表
        return app.cart.userCartList()
      })
      .then((data) => {
        console.log(data);
        let price = 0;

        // 给商家和商品添加选中状态
        data.validCartList.forEach((item, index) => {
          let selected = false;
          let goodsAmount = 0;
          item.goodsVoList.forEach((item) => {
            console.log(app.globalData);
            if (app.globalData.goodsId) {
              let goodsList = app.globalData.goodsId.filter((items, index, arr) => items == item.goodsId);
              if (goodsList.length > 0) {
                item.selected = true;
              } else {
                item.selected = false;
              }
            } else {
              item.selected = false;
            }

            if (item.selected) {
              goodsAmount += item.price * item.goodsNum;
            }
          });
          item.selectedAll = item.goodsVoList.filter((item) => item.selected == false).length > 0 ? false : true;
          item.goodsAmount = goodsAmount;
          price += goodsAmount;
        });
        console.log(data.validCartList);
        that.setData({
          orderList: data.validCartList,
          unGoodsVoList: data.unGoodsVoList,
          goods_price: price
        });
      })
      .then(() => {
        // 获取推荐商品
        let obj = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        }
        return app.goods.recommendList(obj)
      })
      .then((data) => {
        console.log(data);
        that.setData({
          goodsList: data
        });
      })
      .then(app.refreshCartNum)
      .then(() => {
        app.hideLoading();
      })
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