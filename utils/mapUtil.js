const app = getApp();
const mapKey = 'CFNBZ-3VFRD-LPP4X-PF2WD-HLEAZ-3CFAO';

// 地图相关
const QQMapWX = require('qqmap-wx-jssdk.min.js');
var qqmapsdk;

// 初始化地图sdk
function initQQMapSDK() {
  qqmapsdk = new QQMapWX({
    key: mapKey
  });
}

// 获取当前经纬度
function getLocation() {
  return new Promise(function(resolve, reject) {
    wx.getLocation({
      type: 'gcj02', // wgs84 gcj02
      success(res) {
        console.log(res);
        resolve(res);
      },
      fail(res) {
        reject(res)
      }
    });
  })
}

// 经纬度转地址
function locationToAddress(longitude, latitude) {
  return new Promise(function(resolve, reject) {
    qqmapsdk.reverseGeocoder({
      location: {
        longitude: longitude,
        latitude: latitude
      },
      success: function(res) {
        let info = {
          city: res.result.address_component.city,
          district: res.result.address_component.district,
          street: res.result.address_component.street,
          address: res.result.formatted_addresses.recommend
        }
        resolve(info);
      },
      fail: function(error) {
        reject(error);
      },
    });
  });
}

// 地图选点
function chooseLocation() {
  return new Promise(function(resolve, reject) {
    wx.chooseLocation({
      success: function(res) {
        resolve(res);
      },
      fail: function(error) {
        reject(error);
      }
    });
  });
}

// 导航到店
function startNavi(shopInfo) {
  wx.openLocation({
    latitude: shopInfo.latitude,
    longitude: shopInfo.longitude,
    name: shopInfo.name,
    address: shopInfo.address
  })
}

module.exports = {
  initQQMapSDK: initQQMapSDK,
  locationToAddress: locationToAddress,
  getLocation: getLocation,
  chooseLocation: chooseLocation,
  startNavi: startNavi
}