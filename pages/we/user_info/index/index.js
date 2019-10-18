// pages/we/we_info/we_info.js
let app = getApp();
var util = require('../../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: "请选择出生日期",
    gender: 1,
    name: '',
    userInfo: {},
    avatar: '',
    beforePage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    console.log(app.globalData.userInfo)
    // 初始化个人信息
    that.setData({
      date: app.globalData.userInfo.birthday || '',
      gender: app.globalData.userInfo.sex || '',
      name: app.globalData.userInfo.nickName,
      avatar: app.globalData.userInfo.avatar,
      userInfo: app.globalData.userInfo,
      imgSrc: app.imgSrc
    })
  },

  // 获取昵称
  get_name: function(event) {
    let that = this;
    that.setData({
      name: event.detail.value
    })
  },

  // 选择性别
  genderToggle: function(e) {
    this.setData({
      gender: e.currentTarget.dataset.sex
    })
  },

  // 获取出生日期
  bindDateChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },

  // 跳转实名认证
  certification: function() {
    if (this.data.userInfo.isAuth == 0) {
      wx.navigateTo({
        url: '../certification/certification'
      })
    } else {
      let obj = {
        title: '您已实名认证'
      }
      app.showToast(obj)
    }
  },

  // 获取用户图片
  getUserAvatar: function() {
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        wx.uploadFile({
          url: app.apiUrl + '/other/imgUpload?site=2',
          filePath: res.tempFilePaths[0],
          name: 'file',
          success(res) {
            let data = JSON.parse(res.data);
            if (data.code == '200') {
              let avatar = data.data.imgUrl + data.data.imgName;
              that.setData({
                avatar: avatar
              });
            } else {
              let obj = {
                title: '头像上传失败'
              }
              app.showToast(obj);
            }
          }
        });
      }
    })
  },

  // 保存用户信息
  save: function() {
    let that = this
    if (!that.data.avatar) {
      let obj = {
        title: '请上传图片'
      }
      return app.showToast(obj)
    } else if (!that.data.name) {
      let obj = {
        title: '请填写姓名'
      }
      return app.showToast(obj)
    } else if (!that.data.gender) {
      let obj = {
        title: '请选择性别'
      }
      return app.showToast(obj)
    } else if (!that.data.date) {
      let obj = {
        title: '请选择出生日期'
      }
      return app.showToast(obj)
    } else {
      app.showLoading().then(() => {
        // 更新用户信息
        let obj = {
          nickName: that.data.name,
          sex: that.data.gender,
          birthday: that.data.date,
          avatar: that.data.avatar
        }
        return app.user.updateUserInfo(obj)
      }).then((res) => {
        console.log(res)
        that.setData({
          beforePage: true
        })
        let obj = {
          title: '用户更新成功',
          icon: 'success'
        }
        return app.showToast(obj)
      }).then(() => {
        // 获取用户信息
        return app.user.getUserInfo()
      }).then((res) => {
        console.log(res)
        app.globalData.userInfo = res;
      }).then(() => {
        wx.navigateBack({
          delta: 1
        })
      }).then(() => {
        app.hideLoading();
      })
    }
  },

  authSuccess: function() {
    app.globalData.userInfo.isAuth = 1;
    this.data.userInfo.isAuth = 1;
    this.setData({
      userInfo: this.data.userInfo
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
    if (this.data.beforePage) {
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