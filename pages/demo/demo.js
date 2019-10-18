var app = getApp();
Page({
  data: {
    showAnmimation: false
  },
  // add: function () {
  //   this.setData({
  //     showAnmimation: true
  //   })
  // },
  onReady: function () {
    //第一个动画，控制图标飘入购物车
    this.animation = wx.createAnimation({
      duration: 400,
      timingFunction: 'linear',
      transformOrigin: 'left top 0',
      success: function (res) {
      }
    })
    //第二个动画，飘入购物车后，图标还原到原来的位置
    this.animations = wx.createAnimation({
      duration: 0,
      timingFunction: 'linear',
      transformOrigin: 'left top 0',
      success: function (res) {
      }
    })
  },
  middlejia: function (e) {
    //先还原动画
    this.animations.translateY(0, 20).translateX(20, 0).opacity(1).step();
    this.setData({
      animation: this.animations.export(),
      showAnmimation: true,
    })
    //再执行动画
    this.animation.translateY(80, 20).opacity(0).step();
    this.setData({
      animation: this.animation.export()
    })

  }
})