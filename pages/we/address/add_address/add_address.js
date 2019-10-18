// pages/we/address/add_address/add_address.js
let app = getApp()
let util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    labelFlag: 0,
    labelList: [],
    add_label: false,
    labelNote: '',
    region: [],
    regionId: 110101,
    name: '',
    phone: '',
    address: '',
    code: 0,
    defaultFlag: '',
    definition: '',
    beforePage: false,
    order_address: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({

      imgSrc: getApp().imgSrc

    });

    console.log(options);
    let that = this;

    if (options) {
      that.setData({
        order_address: options.order_address ? options.order_address : false
      })
    }
   
    if (options.id){
      wx.setNavigationBarTitle({
        title: '修改收货地址'
      })
      util.showLoading().then(() => {
        // 获取收货地址信息
        let obj = {
          deliveryAddressId: options.id
        }
        return app.user.deliveryAddressInfo(obj)
      }).then((res) => {
        console.log(res)
        that.setData({
          name: res.linkmanName,
          phone: res.linkmanPhone,
          region: that.data.region.concat(res.provinceName, res.cityName, res.districtName),
          address: res.address,
          code: res.isDefault,
          id: options.id,
          regionId: res.districtId
        })
        return Promise.resolve()
      }).then(() => {
        // 获取标签
        let obj = {
          deliveryAddressId: options.id
        }
        return app.user.deliveryAddressLabelList(obj)
      }).then((res) => {
        console.log(res)
        let list = res.list.filter((item) => item.labelName != '其他');
        var labelIndex = 0;
        for (var x in list) {
          if (list[x].isSelect == 1) {
            labelIndex = x;
          }
        }
        that.setData({
          labelList: list,
          labelFlag: labelIndex,
          definition: res.list[res.list.length - 1].labelCode
        })
        console.log(that.data.definition);
        return Promise.resolve()
      }).then(() => {
        util.hideLoading();
      })
    } else {
      wx.setNavigationBarTitle({
        title: '新增收货地址'
      })
      util.showLoading().then(() => {
        // 获取标签
        return app.user.deliveryAddressLabelList();
      }).then((res) => {
        console.log(res);
        let list = res.list.filter((item) => item.labelName != '其他');
        that.setData({
          labelList: list,
          definition: res.list[res.list.length - 1].labelCode
        })
        console.log(that.data.definition);
        return Promise.resolve();
      }).then(() => {
        util.hideLoading();
      })
    }
  },

  // 保存地址
  save_address: function() {
    let that = this;
    if (that.data.name == '' || that.data.phone == '' || that.data.regionId == '' || that.data.address == '') {
      if (that.data.name == '') {
        app.showToast({
          title: '姓名不能为空！'
        });
        return
      } else if (that.data.phone == '') {
        app.showToast({
          title: '手机号码不能为空！'
        });
        return
      } else if (that.data.regionId == '') {
        app.showToast({
          title: '所在地区不能为空！'
        });
        return
      } else {
        app.showToast({
          title: '详细地址不能为空！'
        })
      }
    } else {
      if (that.data.id) {
        app.showLoading()
          .then(() => {
            // 更新收货地址
            let obj = {
              id: that.data.id,
              linkmanName: that.data.name,
              linkmanPhone: that.data.phone,
              areaId: that.data.regionId,
              address: that.data.address,
              isDefault: that.data.code,
              labelCode: that.data.labelList[that.data.labelFlag].labelCode,
              labelName: that.data.labelList[that.data.labelFlag].labelName
            };
            return app.user.updateDeliveryAddress(obj);
          }).then((res) => {
            console.log(res);
            that.setData({
              beforePage: true
            })
            let obj = {
              title: '地址更新成功',
              icon: 'success'
            }
            app.showToast(obj);
            return Promise.resolve();
          }).then(() => {
            wx.navigateBack({
              delta: 1
            })
            return Promise.resolve();
          }).then(() => {
            app.hideLoading();
          }).catch(app.hideLoading())
      } else {
        app.showLoading().then(() => {
          // 新增收货地址
          let obj = {
            linkmanName: that.data.name,
            linkmanPhone: that.data.phone,
            areaId: that.data.regionId,
            address: that.data.address,
            isDefault: that.data.code,
            labelCode: that.data.labelList[that.data.labelFlag].labelCode,
            labelName: that.data.labelList[that.data.labelFlag].labelName
          };
          return app.user.addDeliveryAddress(obj, true);
        }).then((res) => {
          console.log(res);
          that.setData({
            beforePage: true
          })
          let obj = {
            title: '添加地址成功',
            icon: 'success'
          }
          app.showToast(obj);
          return Promise.resolve();
        })
        .then(() => {
          if (that.data.order_address) {
            let pages = getCurrentPages();
            let beforePage = pages[pages.length - 2];
            console.log(beforePage);
            beforePage.get_address();
          }
          return Promise.resolve();
        })
        .then((res) => {
          wx.navigateBack({
            delta: 1
          })
          return Promise.resolve();
        }).then(() => {
          app.hideLoading();
        })
        .catch(app.hideLoading())
      }
    }
  },

  // 删除自定义标签
  delect: function (event) {
    console.log(event);
    let index = event.currentTarget.dataset.index;
    this.data.labelList.splice(index, 1);
    this.setData({
      labelList: this.data.labelList
    })
  },

  // 添加标签切换
  addLabelToggle: function() {
    this.setData({
      add_label: !this.data.add_label
    })
  },

  // 获取添加标签内容
  getValue: function(event) {
    if (event.detail.value.length <= 5) {
      this.setData({
        labelNote: event.detail.value
      })
    } else {
      console.log(event.detail.value);
      let str = event.detail.value.substr(0, 5);
      this.setData({
        labelNote: str
      })
    }
  },

  // 添加标签
  addLabel: function() {
    if (this.data.labelNote.length == 0) {
      return;
    }
    this.data.add_label = true;
    this.setData({
      labelList: this.data.labelList.concat({
        labelCode: this.data.definition,
        labelName: this.data.labelNote,
        isSelect: 0
      })
    })
    if (this.data.add_label) {
      this.setData({
        labelNote: '',
        add_label: false
      })
    }
  },

  // 切换标签
  labelToggle: function(event) {
    console.log(event.currentTarget.dataset.index)
    this.setData({
      labelFlag: event.currentTarget.dataset.index
    })
  },

  // 获取地区
  bindRegionChange: function(e) {
    let region = e.detail.value;
    let regionId = e.detail.code[e.detail.code.length - 1];
    if (region == undefined || regionId == undefined || region == '' || regionId == '') {
      region = ['北京市', '北京市', '东城区'];
      regionId = 110101;
    } 

    this.setData({
      region: region,
      regionId: regionId
    })
  },

  // 获取联系人
  get_name: function(event) {
    console.log(event.detail.value)
    this.setData({
      name: event.detail.value
    })
  },

  // 获取手机号
  get_phone: function(event) {
    console.log(event)
    this.setData({
      phone: event.detail.value
    })
  },

  // 获取详细地址
  get_address: function(event) {
    console.log(event)
    this.setData({
      address: event.detail.value
    })
  },

  // 获取默认地址
  get_code: function(event) {
    console.log(event.detail.value)
    this.setData({
      code: event.detail.value ? 1 : 0
    })
  },

  // 删除地址
  del: function() {
    let that = this
    console.log(that.data.id)
    app.showLoading().then(() => {
      // 删除收货地址
      let obj = {
        deliveryAddressId: that.data.id
      }
      return app.user.deleteDeliveryAddress(obj)
    }).then((res) => {
      console.log(res);
      that.setData({
        beforePage: true
      })
      let obj = {
        title: '删除成功',
        icon: 'success'
      }
      app.showToast(obj);
      return Promise.resolve();
    }).then(() => {
      wx.navigateBack({
        delta: 1
      })
      return Promise.resolve();
    }).then(() => {
      app.hideLoading();
    })
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
    if (this.data.beforePage && !this.data.order_address) {
      let pages = getCurrentPages();
      let beforePage = pages[pages.length - 2];
      console.log(beforePage)
      beforePage.onLoad();
    }
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