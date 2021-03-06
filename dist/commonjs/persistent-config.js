'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PersistentConfig = exports.PropertyType = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _persistentData = require('./persistent-data');

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var configurations = new WeakMap();
var propertyKeys = new Map();

var PropertyType = exports.PropertyType = Object.freeze({
  COLLECTION: 'collection',
  EMBEDDED: 'embedded',
  ID: 'id',
  TEMPORAL: 'temporal',
  TRANSIENT: 'transient'
});

function inheritConfig(config, Class) {
  var prototype = Class.prototype;
  var proto = prototype ? Reflect.getPrototypeOf(prototype) : null;
  var SuperClass = proto ? proto.constructor : null;
  if (!SuperClass) {
    return false;
  }
  if (!configurations.has(SuperClass)) {
    return inheritConfig(config, SuperClass);
  }
  var superConfig = configurations.get(SuperClass);
  for (var key in superConfig) {
    if (key === 'propertyMap') {
      Object.assign(config[key], superConfig[key]);
    } else {
      config[key] = superConfig[key];
    }
  }
  return true;
}

var PersistentConfig = exports.PersistentConfig = function () {
  function PersistentConfig() {
    _classCallCheck(this, PersistentConfig);

    this.cacheOnly = false;
    this.idKey = undefined;
    this.nonPersistent = false;
    this.path = undefined;
    this.postLoad = undefined;
    this.postPersist = undefined;
    this.postRemove = undefined;
    this.preLoad = undefined;
    this.prePersist = undefined;
    this.preRemove = undefined;
    this.propertyMap = {};
  }

  _createClass(PersistentConfig, [{
    key: 'configure',
    value: function configure(config) {
      var _this = this;

      Object.keys(config).forEach(function (key) {
        if (!Reflect.has(_this, key)) {
          throw new Error('entity key \'' + key + '\' is not a valid configuration');
        }
        if (_this[key] && /^(pre|post)/.test(key)) {
          (function () {
            var cb1 = _this[key];
            var cb2 = config[key];
            _this[key] = function () {
              var _this2 = this;

              return Promise.resolve().then(function () {
                return Reflect.apply(cb1, _this2, []);
              }).then(function () {
                return Reflect.apply(cb2, _this2, []);
              });
            };
          })();
        } else {
          if (key === 'propertyMap') {
            throw new Error('cannot configure propertyMap directly');
          }
          _this[key] = config[key];
        }
      });
    }
  }, {
    key: 'configureProperty',
    value: function configureProperty(propertyKey, config) {
      if (!(propertyKey in this.propertyMap)) {
        this.propertyMap[propertyKey] = new EntityPropertyConfig(propertyKey);
      }
      this.propertyMap[propertyKey].configure(config);
    }
  }, {
    key: 'getProperty',
    value: function getProperty(propertyKey) {
      if (!(propertyKey in this.propertyMap)) {
        this.configureProperty(propertyKey, {});
      }
      return this.propertyMap[propertyKey];
    }
  }], [{
    key: 'get',
    value: function get(objectOrClass) {
      var Class = _util.Util.getClass(objectOrClass);
      if (!configurations.has(Class)) {
        var config = new PersistentConfig();
        inheritConfig(config, Class);
        configurations.set(Class, config);
      }
      return configurations.get(Class);
    }
  }, {
    key: 'has',
    value: function has(objectOrClass) {
      var Class = _util.Util.getClass(objectOrClass);
      return configurations.has(Class);
    }
  }]);

  return PersistentConfig;
}();

var EntityPropertyConfig = function () {
  _createClass(EntityPropertyConfig, [{
    key: 'fullPath',
    get: function get() {
      return this.path || propertyKeys.get(this);
    }
  }]);

  function EntityPropertyConfig(propertyKey) {
    _classCallCheck(this, EntityPropertyConfig);

    this.getter = undefined;
    this.path = undefined;
    this.setter = undefined;
    this.type = undefined;

    var config = this;
    propertyKeys.set(config, propertyKey);
    this.getter = function () {
      return _persistentData.PersistentData.getProperty(this, config.fullPath);
    };
    this.setter = function (value) {
      return _persistentData.PersistentData.setProperty(this, config.fullPath, value);
    };
  }

  _createClass(EntityPropertyConfig, [{
    key: 'configure',
    value: function configure(config) {
      var _this3 = this;

      Object.keys(config).forEach(function (key) {
        if (!Reflect.has(_this3, key)) {
          throw new Error('unknown entity property configuration key: ' + key);
        }
        _this3[key] = config[key];
      });
    }
  }]);

  return EntityPropertyConfig;
}();