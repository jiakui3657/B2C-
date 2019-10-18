// pages/we/certification/certification.js
let app = getApp();
var util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    card: '',
    phone: '',
    code: '',
    num: '获取验证码',
    flag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.setData({
		  imgSrc: app.imgSrc
		});
    // 初始化认证信息
  },

  // 获取姓名
  get_name: function(event) {
    let that = this
    that.setData({
      name: event.detail.value
    })
  },

  // 获取手机号
  get_phone: function(event) {
    let that = this
    console.log(event)
    that.setData({
      phone: event.detail.value
    })
  },

  // 获取身份证
  get_card: function(event) {
    let that = this
    that.setData({
      card: event.detail.value
    })
  },

  // 获取验证码
  get_code: function(event) {
    let that = this
    that.setData({
      code: event.detail.value
    })
  },

  // 点击验证码
  code: function() {
    let that = this,
      myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (that.data.flag) {
      console.log(that.data.phone)
      if (that.data.phone.length == 0) {
        let obj = {
          title: '输入的手机号为空'
        }
        app.showToast(obj)
        return false;
      } else if (that.data.phone.length < 11) {
        let obj = {
          title: '手机号长度有误！'
        }
        app.showToast(obj)
        return false;
      } else if (!myreg.test(that.data.phone)) {
        let obj = {
          title: '手机号有误！'
        }
        app.showToast(obj)
        return false;
      } else {
        util.promise.then(() => {
          let num = 120
          that.setData({
            num: num
          })
          let time = setInterval(function() {
            if (num <= 0) {
              clearInterval(time)
              that.setData({
                num: '获取验证码',
                flag: true
              })
            } else {
              num--
              that.setData({
                num: num,
                flag: false
              })
            }
          }, 1000)
        }).then(() => {
          // 发送手机验证码
          let obj = {
            mobile: that.data.phone,
            type: 1
          }
          return app.other.sendValidateCode(obj)
        }).then((res) => {
          console.log(res)
        })
      }
    }
  },

  // 立即验证
  validation: function() {
    let that = this,
      myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!that.data.name) {
      let obj = {
        title: '请完善姓名'
      }
      return util.showToast(obj)
    } else if (!that.data.card) {
      let obj = {
        title: '请完善身份证'
      }
      return util.showToast(obj)
    } else if (!myreg.test(that.data.phone)) {
      let obj = {
        title: '请完善手机号'
      }
      return util.showToast(obj)
    } else if (!that.data.code) {
      let obj = {
        title: '请完善验证码'
      }
      return util.showToast(obj)
    } else {
      util.showLoading().then(() => {
        // 更新用户信息
        let obj = {
          name: that.data.name,
          phone: that.data.phone,
          identityNo: that.data.card,
          code: that.data.code
        }
        return app.user.realName(obj)
      }).then(() => {
        let pages = getCurrentPages();
        console.log(pages);
        pages.forEach((item) => {
          if (item.route == "pages/we/user_info/index/index") {
            pages[pages.length - 2].authSuccess();
          }
        })
        
        wx.redirectTo({
          url: '../authenticationOk/authenticationOk',
        })
        return Promise.resolve();
      })
      .catch(res => {
        let obj = {
          title: "认证失败"
        }
        return util.showToast(obj)
      }).finally(app.hideLoading);
    }
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

  }
})