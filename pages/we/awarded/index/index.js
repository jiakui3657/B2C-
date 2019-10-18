let app = getApp();
let util = require('../../../../utils/util.js');
let time;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalFlag: false,
    signList: {},
    goodsList: [],
    signIndex: '',
    date: '',
    securitiesFlag: false,
    bangCoupon: {},
    time: {
      hour: '',
      minute: '',
      seconds: ''
    },
    shareId: '',
    pull_new: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
      imgSrc: getApp().imgSrc
    });

    let that = this, flag = true, pull_new1 = '', pull_new2 = '';
    app.showLoading()
      .then(() => {
        // 积分
        that.setData({
          userInfo: app.globalData.userInfo
        })
        return Promise.resolve();        
      })
      .then(() => {
        // 签到记录
        return app.activity.signInRecord();
      })
      .then((res) => {
        console.log(res);

        res.signin = res.signin || [];

        // 修改数据结构 --- 补签
        let obj = util.format(Date.parse(new Date()));
        obj = obj.date.replace("月", "-");
        let signIndex = '';
        res.signin.forEach((item, index) => {
          if (item.date == obj) {
            flag = false;
            item.retroactive = false;
            item.date = '今日';
            signIndex = index;
          } else if (item.isSignin == 0 && flag) {
            item.retroactive = true;
          } else {
            item.retroactive = false;
          }
        })

        that.setData({
          signList: res,
          date: obj,
          signIndex: signIndex
        })
        console.log(that.data.signList);
        return Promise.resolve();
      })
      .then(() => {
        // 获取推荐商品
        let params = {
          areaId: app.areaId,
          pageIndex: 1,
          pageSize: app.pageSize
        }
        return app.goods.recommendList(params)
      })
      .then((data) => {
        that.setData({
          goodsList: data
        })
        return Promise.resolve()
      })
      .then(() => {
        // 拉新页面数据初始化
        let obj = {
          type: 'coupon01'
        }
        return app.activity.getSystemCoupon(obj)
      })
      .then((res) => {
        console.log(res);
        pull_new1 = JSON.stringify(res) == '{}' ? false : true;
        return Promise.resolve();
      })
      .then(() => {
        // 拉新页面数据初始化
        let obj = {
          type: 'coupon02'
        }
        return app.activity.getSystemCoupon(obj)
      })
      .then((res) => {
        console.log(res);
        pull_new2 = JSON.stringify(res) == '{}' ? false : true;
        return Promise.resolve();
      })
      .then(() => {
        that.data.pull_new = pull_new1 && pull_new2 ? true : false
        that.setData({
          pull_new: that.data.pull_new
        })
      })
      .then(() => {
        app.hideLoading();
      })
      .catch((e) => {
        if (e) {
          console.error(e);
        }
        app.hideLoading();
      })
  },

  // 时间转换
  sec_to_time: function (s) {
    var t;
    if (s > -1) {
      var hour = Math.floor(s / 3600);
      var min = Math.floor(s / 60) % 60;
      var sec = s % 60;
      if (hour < 10) {
        t = '0' + hour + ":";
      } else {
        t = hour + ":";
      }

      if (min < 10) { t += "0"; }
      t += min + ":";
      if (sec < 10) { t += "0"; }
      t += sec.toFixed(0);
    }
    return t;
  },

  // 签到
  sign: function (event) {
    let that = this
    let index = event.currentTarget.dataset.index
    if (event.currentTarget.dataset.issignin == 0) {
      if (that.data.signList.signin[index].date == "今日" && that.data.signList.signin[index].isSignin == 0 || !event.currentTarget.dataset.retroactive && that.data.date > that.data.signList.signin[index].date) {
        app.showLoading()
          .then(() => {
            // 获取年份
            var date = new Date;
            var year = date.getFullYear() + '-';
            // 签到日期
            console.log(that.data.signList.signin[index].date, that.data.date);
            let day = that.data.signList.signin[index].date == '今日' ? that.data.date : that.data.signList.signin[index].date;
            day = year + day;
            // 签到记录
            let obj = {
              signDate: day
            }
            return app.activity.signIn(obj)
          })
          .then((data) => {
            console.log(data);
            let title = '恭喜获得' + that.data.signList.signin[index].integral + '积分';
            let obj = {
              title: '签到成功',
              icon: 'success'
            }
            app.showToast(obj);
            that.onLoad();
            return Promise.resolve();
          })
          .catch((e) => {
            if (e) {
              console.error('签到失败', e);
            }
            app.hideLoading();
          })
          .finally(()=>{
            // 积分
            app.refreshUserInfo().then(()=>{
              that.setData({
                userInfo: app.globalData.userInfo
              });
            });
          });
      } else if (event.currentTarget.dataset.retroactive && that.data.signList.repairTimes > 0 && that.data.userInfo.integral >= that.data.signList.expendIntegral) {
        wx.showModal({
          title: '提示',
          content: '补签将会消耗' + that.data.signList.expendIntegral+'个积分哦~',
          cancelColor: '#999999',
          confirmColor: '#F94929',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              app.showLoading()
                .then(() => {
                  // 获取年份
                  var date = new Date;
                  var year = date.getFullYear() + '-';
                  // 签到日期
                  let day = year + (that.data.signList.signin[index].date == '今日' ? that.data.date : that.data.signList.signin[index].date);
                  // 签到记录
                  let obj = {
                    signDate: day
                  };
                  return app.activity.signIn(obj);
                })
                .then((res) => {
                  console.log(res);
                  let title = '补签成功';
                  let obj = {
                    title: title,
                    icon: 'success'
                  };
                  app.showToast(obj, () => {
                    // let up = "signList.signin[" + index + "].isSignin";
                    // let up1 = "signList.signin[" + index + "].retroactive";
                    // let up2 = "signList.runningDays";
                    // that.setData({
                    //   [up]: 1,
                    //   [up1]: false,
                    //   [up2]: that.data.signList.runningDays + 1
                    // });
                    that.onLoad();
                  });
                  return Promise.resolve();
                })
                .catch((e) => {
                  if (e) {
                    console.error('补签失败', e);
                  }
                  app.hideLoading();
                })
                .finally(() => {
                  // 积分
                  app.refreshUserInfo().then(() => {
                    that.setData({
                      userInfo: app.globalData.userInfo
                    });
                  });
                });
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      } else if (event.currentTarget.dataset.retroactive && that.data.signList.repairTimes <= 0) {
        app.showToast({title: '补签次数已用完'});
      } else if (event.currentTarget.dataset.retroactive && that.data.userInfo.integral < that.data.signList.expendIntegral) {
        app.showToast({ title: '积分不足，补签失败' });
      }
    }
  },

  // 邀请规则
  cancel: function () {
    this.setData({
      modalFlag: !this.data.modalFlag
    });
  },

  // 关闭红包
  close: function () {
    this.setData({
      securitiesFlag: false
    });
  },

  // 跳转邀请好友
  invite: function () {
    if (this.data.pull_new) {
      wx.navigateTo({
        url: '../invite/invite'
      });
    } else {
      app.showToast({title: '暂无活动'})
    }
  },

  // 跳转帮帮领劵
  go_help: function () {
    clearInterval(time);
    wx.navigateTo({
      url: '../help/help'
    });
    this.setData({
      securitiesFlag: false
    });
  },

  // 判断是否有帮帮领劵
  help: function () {
    let that = this, status = '';
    app.showLoading()
      .then(() => {
        // 判断是否有帮帮领劵
        return app.activity.checkBangCoupon();
      })
      .then((res) => {
        console.log(res);
        status = res.status;
        if (res.status == 1) {
          wx.navigateTo({
            url: '../help/help'
          });
        }
        return Promise.resolve(res);
      })
      .then((res) => {
        if (status == 0) {
          // 查询系统的帮帮领券信息
          return app.activity.getBangCoupon();
        }
      })
      .then((data) => {
        if (status == 0) {
          let date = data.timeLength * 60 * 60;
          time = setInterval(function () {
            if (date > 0) {
              date = date - 1;
              let day = that.sec_to_time(date);
              day = day.split(':');
              that.data.time.hour = day[0];
              that.data.time.minute = day[1];
              that.data.time.seconds = day[2];
              that.setData({
                time: that.data.time
              });
            } else {
              clearInterval(time)
            }
          }, 1000);

          that.setData({
            bangCoupon: data,
            securitiesFlag: data.joinedTimesDaily < data.joinTimesLimitDaily ? true : false
          })
        }
        return Promise.resolve();
      })
      .catch(() => {
        app.showToast({ title: '暂无活动' });
        return Promise.reject();
      })
      .then((res) => {
        if (status == 0 && that.data.bangCoupon.joinedTimesDaily < that.data.bangCoupon.joinTimesLimitDaily) {
          // 发起帮帮领券
          return app.activity.joinBangCoupon();
        } else if (that.data.bangCoupon.joinedTimesDaily >= that.data.bangCoupon.joinTimesLimitDaily) {
          app.showToast({ title: '不能贪心哦~每天只可以发起' + that.data.bangCoupon.joinTimesLimitDaily+'次'})
          return Promise.reject();
        }
      })
      .then(() => {
        if (status == 0) {
          // 获取用户进行中的帮帮领券
          return app.activity.getBangingCoupon();
        }
      })
      .then((data) => {
        if (status == 0) {
          that.setData({
            shareId: data.id
          })
        }
        return Promise.resolve();
      })
      .then(() => {
        app.hideLoading();
      })
      .catch((e) => {
        if (e) {
          console.error('判断是否有帮帮领劵', e);
        }
        app.hideLoading();
      })
  },

  // 跳转分享商品
  share_goods: function () {
    wx.navigateTo({
      url: '/pages/we/awarded/share_polite/share_polite'
    });
  },

  // 跳转积分兑换
  integral: function () {
    wx.navigateTo({
      url: '../../credits_exchange/index/index'
    });
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
    clearInterval(time);
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
    let that = this;
    if (res.from == 'button') {
      return {
        title: '拜托帮我点一下，你也可以领福利！',
        path: '/pages/we/awarded/help_couple/help_couple?id=' + that.data.shareId + '&consumerId=' + app.globalData.userInfo.consumerId,
        imageUrl: that.data.imgSrc +'/images/online/we/awarded/shareImage.png',
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