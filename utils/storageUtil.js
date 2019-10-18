Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


function get(key){
  return new Promise(function (resolve, reject){
    wx.getStorage({
      key: key,
      success(res) {
        resolve(res.data)
      }
    })
  });
}

function saveSearch(key, keyword, historyWords) {
  return new Promise(function (resolve, reject) {
    historyWords.forEach(function (e, i, array) {
      if (e == keyword) {
        historyWords.remove(i);
      }
    });

    historyWords.unshift(keyword);
    if (historyWords.length > 10) {
      historyWords = historyWords.slice(0, 10);
    }
    wx.setStorage({
      key: key,
      data: historyWords,
      success: function (res) {
        resolve(historyWords)
      }
    })
  });
}

function clear(key) {
  return new Promise(function (resolve, reject) {
    wx.removeStorage({
      key: key,
      success(res) {
        resolve()
      }
    })
  });
}

module.exports = {
  saveSearch: saveSearch,
  get: get,
  clear: clear
}


