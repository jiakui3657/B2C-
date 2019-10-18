// components/formId/formId.js
let util = require('../../utils/util.js');
let app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    submitFormId(e) {
      if (e.detail.formId != 'formid the formId is a mock one') {
        let params = {
          formid: e.detail.formId
        }
        app.other.collectFormid(params)
          .then((data) => {
            console.log(data);
          })
      }
    }
  }
})
