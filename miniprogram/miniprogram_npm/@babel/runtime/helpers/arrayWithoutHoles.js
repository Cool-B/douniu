// miniprogram_npm/@babel/runtime/helpers/arrayWithoutHoles.js
function arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arr;
  if (Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === '[object Arguments]') {
    return Array.from(arr);
  }
  throw new TypeError('Invalid attempt to destructure non-iterable instance');
}
module.exports = arrayWithoutHoles;
module.exports.default = arrayWithoutHoles;
