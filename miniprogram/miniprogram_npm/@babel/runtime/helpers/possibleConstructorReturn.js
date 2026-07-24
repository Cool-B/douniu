// miniprogram_npm/@babel/runtime/helpers/possibleConstructorReturn.js
function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === 'object' || typeof call === 'function')) {
    return call;
  }
  return _assertThisInitialized(self);
}
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
module.exports = _possibleConstructorReturn;
module.exports.default = _possibleConstructorReturn;
