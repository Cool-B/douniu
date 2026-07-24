// miniprogram_npm/@babel/runtime/helpers/getPrototypeOf.js
function _getPrototypeOf(o) {
  if (typeof Object.getPrototypeOf === 'function') {
    return Object.getPrototypeOf(o);
  }
  return o.__proto__ || Object.getPrototypeOf(o);
}
module.exports = _getPrototypeOf;
module.exports.default = _getPrototypeOf;
