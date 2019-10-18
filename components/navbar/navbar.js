// components/navbar/navbar.js
const App = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageName: String,
    showNav: {
      type: Boolean,
      value: false
    },
    showHome: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgSrc: App.imgSrc
  },

  lifetimes: {
    attached: function () {
      this.setData({
        navH: App.navHeight,
        navTop: App.navTop,
        menuHeight: App.menuHeight
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //回退
    navBack: function () {
      wx.navigateBack({
        delta: 1
      })
    },
    //回主页
    toIndex: function () {
      wx.switchTab({
        url: '/pages/home/index/index'
      })
    }
  }
})
