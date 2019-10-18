// components/search/search.js
let util = require('../../utils/util.js');
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    place: String,
    placeholder: String,
    pathTo: String,
    readonly: Boolean,
    mapCode: {
      type: Boolean,
      value: false
    },
    disabled: {
      type: Boolean,
      value: false
    },
    value: String,
    focus: {
      type: Boolean,
      value: false
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    delFlag: false,
    value2: '',
    imgSrc: app.imgSrc
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 跳转搜素页面
    shop_location: function() {
      wx.navigateTo({
        url: '/pages/near/shop_location/shop_location'
      })
    },

    // 获取输入内容
    get_value: function(event) {
      console.log(event.detail.value2);
      if (event.detail.value) {
        this.setData({
          delFlag: true,
          value2: event.detail.value
        });
      } else {
        this.setData({
          delFlag: false,
          value2: event.detail.value
        });
      }

      // 返回搜索状态
      var val = this.data.delFlag;
      var myEventDetail = {
        val: val,
        shopList: false,
        value: event.detail.value
      };
      this.triggerEvent('componentsearch', myEventDetail);
    },

    // 删除搜索内容
    del: function() {
      this.setData({
        value2: '',
        value: '',
        delFlag: false
      });

      // 返回搜索状态
      var val = this.data.delFlag
      var myEventDetail = {
        val: val,
        shopList: false,
        clear: true
      };
      this.triggerEvent('componentsearch', myEventDetail);
    },

    // 搜索内容
    search: function() {
      // 返回搜索状态
      console.log(this.data.value2);
      var myEventDetail = {
        val: true,
        shopList: true,
        value: this.data.value2
      };
      this.triggerEvent('componentsearch', myEventDetail);
    },

    // 输入框获得焦点时调用
    bindfocus: function() {
      this.triggerEvent('componentBindfocus', {});
    }
  },

  observers: {
    'value': function(value) {
      if (value.length > 0) {
        this.setData({
          delFlag: true,
        });
      }
    }
  }
})