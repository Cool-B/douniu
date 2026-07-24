// miniprogram_npm/@babel/runtime/helpers/unsupportedIterableToArray.js
function unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return Array.from(o);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) {
    return Array.from(o);
  }
  if (minLen != null && minLen >= 0) {
    var idx = 0;
    var arr = new Array(minLen);
    while (idx < minLen) {
      arr[idx++] = o[idx];
    }
    return arr;
  }
  throw new TypeError('Invalid attempt to destructure non-iterable instance');
}
module.exports = unsupportedIterableToArray;
module.exports.default = unsupportedIterableToArray;
