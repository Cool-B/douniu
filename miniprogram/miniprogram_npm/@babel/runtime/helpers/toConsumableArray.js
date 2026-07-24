// miniprogram_npm/@babel/runtime/helpers/toConsumableArray.js
var arrayWithoutHoles = require('./arrayWithoutHoles.js');
var iterableToArray = require('./iterableToArray.js');
var unsupportedIterableToArray = require('./unsupportedIterableToArray.js');
var nonIterableSpread = require('./nonIterableSpread.js');

function toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}
module.exports = toConsumableArray;
module.exports.default = toConsumableArray;
