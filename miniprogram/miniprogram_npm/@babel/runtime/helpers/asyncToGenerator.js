// miniprogram_npm/@babel/runtime/helpers/asyncToGenerator.js
// babel runtime helper - async/await 实现
function asyncToGenerator(fn) {
  return function() {
    var self = this;
    var args = arguments;
    return new Promise(function(resolve, reject) {
      var gen = fn.apply(self, args);
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
          if (info.done) {
            resolve(value);
          } else {
            Promise.resolve(value).then(function(v) { step('next', v); }, function(e) { step('throw', e); });
          }
        } catch (e) {
          reject(e);
        }
      }
      step('next');
    });
  };
}
module.exports = asyncToGenerator;
module.exports.default = asyncToGenerator;
