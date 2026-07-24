// miniprogram_npm/@babel/runtime/helpers/get.js
// class member access optimization helper
function _get(target, property, receiver) {
  if (typeof Reflect !== 'undefined' && Reflect.get) {
    return Reflect.get(target, property, receiver);
  }
  var desc = Object.getOwnPropertyDescriptor(target, property);
  if (desc) {
    if (desc.get) return desc.get.call(receiver);
    if (typeof desc.value === 'function') return desc.value;
    return desc.value;
  }
  var parent = Object.getPrototypeOf(target);
  if (parent === null) return undefined;
  return _get(parent, property, receiver);
}
module.exports = _get;
module.exports.default = _get;
