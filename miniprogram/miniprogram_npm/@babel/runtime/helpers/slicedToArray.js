// miniprogram_npm/@babel/runtime/helpers/slicedToArray.js
var arrayWithHoles = require('./arrayWithHoles.js');
var iterableToArrayLimit = require('./iterableToArrayLimit.js');
var unsupportedIterableToArray = require('./unsupportedIterableToArray.js');
var nonIterableGet = require('./nonIterableGet.js');

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableGet();
}
module.exports = _slicedToArray;
module.exports.default = _slicedToArray;
