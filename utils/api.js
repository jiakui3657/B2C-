let app = getApp()
const QRCode = require('./weapp-qrcode.js')

/**
 * 获取购物车商品数量。
 */

const getCartGoodsNum = () => {
  return app.cart.getCartGoodsNum()
}

module.exports = {
  getCartGoodsNum
}