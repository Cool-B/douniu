// miniprogram_npm/@babel/runtime/index.js
// 通用入口: 暴露所有 helper (按需 require)
module.exports = {
  arrayWithoutHoles: require('./helpers/arrayWithoutHoles.js'),
  iterableToArray: require('./helpers/iterableToArray.js'),
  unsupportedIterableToArray: require('./helpers/unsupportedIterableToArray.js'),
  nonIterableSpread: require('./helpers/nonIterableSpread.js'),
  toConsumableArray: require('./helpers/toConsumableArray.js'),
  get: require('./helpers/get.js'),
  defineProperty: require('./helpers/defineProperty.js'),
  assertThisInitialized: require('./helpers/assertThisInitialized.js'),
  classCallCheck: require('./helpers/classCallCheck.js'),
  inherits: require('./helpers/inherits.js'),
  createSuper: require('./helpers/createSuper.js'),
  getPrototypeOf: require('./helpers/getPrototypeOf.js'),
  possibleConstructorReturn: require('./helpers/possibleConstructorReturn.js'),
  createClass: require('./helpers/createClass.js'),
  slicedToArray: require('./helpers/slicedToArray.js'),
  asyncToGenerator: require('./helpers/asyncToGenerator.js')
};
