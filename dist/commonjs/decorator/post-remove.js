'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PostRemove = PostRemove;

var _persistentConfig = require('../persistent-config');

var _util = require('../util');

function PostRemove(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    var postRemove = target[propertyKey];
    if (typeof postRemove !== 'function') {
      throw new Error('@PostRemove ' + propertyKey + ' is not a function');
    }
    var config = _persistentConfig.PersistentConfig.get(target);
    config.configure({ postRemove: postRemove });
    return _util.Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: true
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}