// miniprogram_npm/@babel/runtime/helpers/iterableToArray.js
function iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === '[object Arguments]') {
    return Array.from(iter);
  }
  throw new TypeError('Invalid attempt to spread non-iterable instance');
}
module.exports = iterableToArray;
module.exports.default = iterableToArray;
