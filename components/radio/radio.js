// components/shopingList/shopList.js
let util = require('../../utils/util.js');
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    type: Number,
    checked: Boolean,
    label: String,
    show: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgSrc: app.imgSrc
  },

  lifetimes: {
    attached: function() {
      // 在组件实例进入页面节点树时执行
      console.log(this.data.checked)
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    checkRadio: function () {
      this.triggerEvent('radioChange',this.data)
    }
  }
})
