let app = getApp()
const QRCode = require('./weapp-qrcode.js')

  /**
   * 显示加载提示框。
   */

  const showLoading = () => {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '加载中',
        mask: true,
        success: () => {
          resolve()
        }
      })
    })
  }

  /**
   * 隐藏加载提示框。
   */

  const hideLoading = () => {
    wx.hideLoading()
  }

  /**
   * 消息提示框。
   */

  const showToast = ( obj ) => {
    wx.showToast({
      title: obj.title,
      icon: obj.icon ? obj.icon : 'none',
      duration: 2000,
      mask: true
    });
  }

  /**
   * 模态对话框。
   * 
   * @param obj (参数  类型： obj)
   *        obj.title  (提示标题  类型: String)
   *        obj.showCancel  (是否显示取消按钮  类型: Boolean)
   *        obj.content  (提示内容  类型: String)
   */

  const showModal = (obj) => {
    return new Promise((resolve, reject) => {
      wx.showModal({
        title: obj.title ? obj.title : '提示',
        showCancel: obj.showCancel ? obj.showCancel : true,
        content: obj.content,
        cancelText: obj.cancelText ? obj.cancelText : '取消',
        confirmText: obj.confirmText ? obj.confirmText : '确定',
        cancelColor: '#999999',
        confirmColor: '#F94929',
        success(res) {
          if (res.confirm) {
            resolve()
          } else if (res.cancel) {
            reject()
          }
        }
      })
    })
  }

  /**
   * 数据同步。
   */

  const promise = new Promise((resolve, reject) => {
    resolve()
  })

  /**
   * 为 tabBar 某一项的右上角添加文本。
   * 
   * @param num (参数: 数量 类型： String)
   *        
   */

  const setTabBarBadge = (num) => {
    wx.setTabBarBadge({
      index: 3,
      text: num + ''
    })
  }

  /**
   * 获取元素位置。
   * 
   * @param dom 目标元素
   */

  const getDom = (dom) => {
    return new Promise(function (resolve, reject) {
      let query = wx.createSelectorQuery()
      query.selectAll(dom).boundingClientRect((rect) => {
        resolve(rect);
      }).exec()
    });
  }

  /**
   * 获取二维码。
   * 
   * @param obj 获取二维码的参数
   *        obj.dom 显示的目标元素
   *        obj.text 扫描二维码后的内容
   *        obj.image 二维码的图片
   *        obj.width 二维码的宽度
   *        obj.height 二维码的高度
   *        obj.colorDark 二维码的颜色
   *        obj.colorLight 二维码的背景色
   */

  const get_code = (obj) => {
    let qrcode = new QRCode(obj.dom, {
      text: obj.text,
      image: obj.image,
      width: obj.width,
      height: obj.height,
      colorDark: obj.colorDark,
      colorLight: obj.colorLight,
      correctLevel: QRCode.CorrectLevel.H,
    });
  }

  /**
   * 使用微信内置地图查看位置。
   * 
   * @param obj 地图参数
   *        obj.latitude 纬度
   *        obj.longitude 经度
   *        obj.scale 缩放比
   *        obj.name 名字
   *        obj.address 地址
   */

  const openLocation = (obj) => {
    wx.openLocation({
      latitude: obj.latitude,
      longitude: obj.longitude,
      scale: obj.scale,
      name: obj.name,
      address: obj.address
    })
  }

  /**
   * 获取用户信息。
   */

  const getUserInfo = () => {
    return new Promise((resolve, reject) => {
      wx.getUserInfo({
        success: function (res) {
          resolve(res)
        },
        fail: function (res) {
          reject(res)
        }
      })
    })
  }

  /**
   * 时间单数加0。
   * 
   * @param m 时间
   */
  const add0 = (m) => { return m < 10 ? '0' + m : m }

  /**
   * 日期倒计时。
   * 
   * @param diff 时间
   */
  const time = (diff) => {
    let obj = {
      hour:'00',
      minute:'00',
      second:'00'
    }
    obj.minute = add0(parseInt(diff / 60)); //算出一共有多少分钟
    obj.second = add0(diff % 60);//算出有多少秒
    if (obj.minute > 60) { //如果分钟大于60，计算出小时和分钟
      obj.hour = add0(parseInt(obj.minute / 60));
      obj.minute = add0(obj.minute % 60);//算出有多分钟
    } 
    return obj
  };

  /**
   * 时间戳转换时间。
   * 
   * @param time 时间
   */
  const format = (time) => {
    var time = new Date(time); 
    var obj = {};
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds(); 
    obj.date = add0(m) + '月' + add0(d);
    obj.time = add0(h) + ':' + add0(mm);
    return obj
  };

  /**
   * 数组混编。
   * 
   * @param single 当前数组
   *        total  总数组
   */
  const cycle = (single, total) => {
    let list = total || [];
    single.forEach((item) => {
      list.push(item)
    });
    return list;
  };

  /**
   * 获取小程序页面栈。
   * 
   * @param index 倒数的页面栈
   */
  // const getCurrentPages = (index) => {
  //   let pages = getCurrentPages();
  //   let beforePage = pages[pages.length - index];
  //   beforePage.onLoad();
  // };

  function getPreviousPage(index) {
    let pages = getCurrentPages();
    return pages[pages.length - index - 1];
  }

  //链接跳转
  function linkTo (e) {
    let url = e.currentTarget.dataset.path;
    wx.navigateTo({
      url: url
    });
  }

  // 缓动动画
  const animation = function (startX, startY, endX, endY) {
    return new Promise((resolve, reject) => {

    });
  };

  /**
  * 加法运算，避免数据相加小数点后产生多位数和计算精度损失。
  *
  * @param num1加数1 | num2加数2
  */
  const add = (num1, num2) => {
    var r1, r2, m;
    try {
      r1 = num1.toString().split(".")[1].length;
    } catch (e) { r1 = 0 }

    try {
      r2 = num2.toString().split(".")[1].length;
    } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    return (num1 * m + num2 * m) / m;
  };

  /**
  * 减法运算，避免数据相加小数点后产生多位数和计算精度损失。
  *
  * @param num1减数  |  num2被减数
  */
  const sub = (num1, num2) => {
    var r1, r2, m;
    try {
      r1 = num1.toString().split(".")[1].length;
    } catch (e) { r1 = 0 }

    try {
      r2 = num2.toString().split(".")[1].length;
    } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    return (num1 * m - num2 * m) / m;
  };

  /**
   * 乘法运算，避免数据相乘小数点后产生多位数和计算精度损失。
   *
   * @param num1被乘数 | num2乘数
   */
  const mul = (num1, num2) => {
    var m = 0, s1 = num1.toString(),
      s2 = num2.toString();
    try {
      m += s1.split(".")[1].length
    } catch (e) { }
    try {
      m += s2.split(".")[1].length
    } catch (e) { }
    return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
  };

  /**
   * 图片预览。
   *
   * @param current当前图片 | urls图片列表
   */
  const preview = (current, urls) => {
    wx.previewImage({
      current: current,
      urls: urls
    })
  };



module.exports = {
  showLoading,
  hideLoading,
  showToast,
  getDom,
  linkTo,
  add,
  sub,
  mul,
  preview,
  get_code,
  openLocation,
  getUserInfo,
  time,
  format,
  promise,
  cycle,
  setTabBarBadge,
  showModal,
  getCurrentPages,
  animation,
  getPreviousPage
}