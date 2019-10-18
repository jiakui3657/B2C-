// pages/we/vip_club/open_vip/open_vip.js
let util = require('../../../../utils/util.js');
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    privilegeList: [],
    vip_card_index: 0,
    vip_card_list: [],
    vipCardList: [],
    memberGradeCode: '',
    vipCardCode: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

	this.setData({

		imgSrc: getApp().imgSrc

	});

    let that = this, memberGradeCode = '';
    app.showLoading().then(() => {
      // Vip会员卡列表
      return app.user.vipCardList();
    }).then((res) => {
      let newList = [], list = res.list;
      let selfGradeCode = app.globalData.userInfo.memberGradeCode;
      if (selfGradeCode == 'M103') {
        for (let index in list) {
          if (list[index].memberGradeCode == 'M103') {
            newList.push(list[index]);
          }
        }
      } else {
        newList = newList.concat(list);
      }

      that.setData({
        vipCardList: newList,
        vipCardCode: newList[0].vipCardCode
      })
      memberGradeCode = newList[0].memberGradeCode;
      return Promise.resolve();
    }).then(() => {
      // 获取会员权益
      let obj = {
        memberGradeCode: memberGradeCode
      }
      return app.user.privilegeList(obj)
    }).then((res) => {
      console.log(res)
      that.setData({
        privilegeList: res.privilegeList
      })
      return Promise.resolve();
    }).then(() => {
      app.hideLoading();
    }).catch((e)=>{
      app.hideLoading();
    })
  },

  // 开通会员
  open_start: function () {
    let that = this, index = that.data.vip_card_index, id = that.data.vipCardList[index].id, vipCardCode = that.data.vipCardList[index].vipCardCode;
    console.log(vipCardCode, app.globalData.userInfo);
    if (app.globalData.userInfo.walletId == undefined || app.globalData.userInfo.walletId == '') {
      wx.navigateTo({
        url: '/pages/register/register'
      })
    } else if (vipCardCode == 'M301' && app.globalData.userInfo.isAuth == 1) {
      app.showLoading()
      .then(()=>{
        let param = {
          vipCardId: id
        };
        return app.user.vipCardOnTrial(param)
      })
      .then((res) => {
        app.hideLoading();
        wx.navigateTo({
          url: '../open_end/open_end?vipCardCode=' + 　vipCardCode
        })
      })
      .catch(()=>{
        app.hideLoading();
      });
      return;
    } else if (vipCardCode != 'M301' && app.globalData.userInfo.isAuth == 1) {
      return app.showLoading()
        .then(() => {
          // 获取会员权益
          let obj = {
            vipCardId: id
          }
          return app.user.buyVipCard(obj)
        })
        .then((data) => {
          let pay = data;
          return app.pay(pay.pay_info);
        })
        .then(() => {
          let obj = {
            title: '购买成功',
            icon: 'success'
          }
          app.showToast(obj)
          return Promise.resolve()
        })
        .then(() => {
          setTimeout(() => {
            app.hideLoading();
            wx.navigateTo({
              url: '../open_end/open_end?vipCardCode=' + vipCardCode
            })
          }, 2000)
        })
        .catch(() => {
          app.hideLoading();
        })
    } else {
      wx.navigateTo({
        url: '/pages/we/vip_club/prove/prove',
      })
    }

    // let obj = {
    //   content: '是否购买会员卡？'
    // }
    // return util.showModal(obj)
    //   .then(() => {
    //     return app.showLoading()
    //     .then(() => {
    //       // 获取会员权益
    //       let obj = {
    //         vipCardId: id
    //       }
    //       return app.user.buyVipCard(obj)
    //     })
    //     .then((data) => {
    //       let pay = data;
    //       return app.pay(pay.pay_info);
    //     })
    //     .then(()=>{
    //       let obj = {
    //         title: '购买成功',
    //         icon: 'success'
    //       }
    //       app.showToast(obj)
    //       return Promise.resolve()
    //     })
    //     .then(() => {
    //       app.hideLoading();
    //       wx.navigateTo({
    //         url: '../open_end/open_end?vipCardCode=' + vipCardCode
    //       })
    //     })
    //   })
    //   .catch((e) => {console.log(e)})
    //   .finally(()=>{
    //     app.hideLoading();
    //     return Promise.resolve();
    //   });
  },

  // 切换会员
  vipCardToggle: function (event) {
    console.log(event)
    let that = this, id = event.currentTarget.id, gradeCode = event.currentTarget.dataset.grade;
    that.setData({
      vip_card_index: event.currentTarget.dataset.index
    })
    if (that.data.memberGradeCode != gradeCode) {
      app.showLoading().then(() => {
        // 获取会员权益
        let obj = {
          memberGradeCode: gradeCode
        }
        return app.user.privilegeList(obj)
      }).then((res) => {
        console.log(res)
        that.setData({
          privilegeList: res.privilegeList,
          memberGradeCode: gradeCode,
          vipCardCode: id
        })
        return Promise.resolve();
      }).then(() => {
        app.hideLoading();
      })
    }
  },

  vipProtocol:function(){
    wx.navigateTo({
      url: '/pages/we/vip_club/vip_protocol/vip_protocol'
    })
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