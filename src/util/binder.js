// Recycled from threestrap. TODO get it in Threestrap in a better wqy, export i
// there

import * as THREE from "three";

export const bind = function (context, globals) {
  return function (key, object) {
    // Prepare object
    if (!object.__binds) {
      object.__binds = [];
    }

    // Set base target
    var fallback = context;
    if (Array.isArray(key)) {
      fallback = key[0];
      key = key[1];
    }

    // Match key
    var match = /^([^.:]*(?:\.[^.:]+)*)?(?::(.*))?$/.exec(key);
    var path = match[1].split(/\./g);

    var name = path.pop();
    var dest = match[2] || name;

    // Whitelisted objects
    var selector = path.shift();
    var target =
      {
        this: object,
      }[selector] ||
      globals[selector] ||
      context[selector] ||
      fallback;

    // Look up keys
    while (target && (key = path.shift())) {
      target = target[key];
    }

    // Attach event handler at last level
    if (target && (target.on || target.addEventListener)) {
      var callback = function (event) {
        object[dest] && object[dest](event, context);
      };

      // Polyfill for both styles of event listener adders
      _polyfill(target, ["addEventListener", "on"], function (method) {
        target[method](name, callback);
      });

      // Store bind for removal later
      var bind = { target: target, name: name, callback: callback };
      object.__binds.push(bind);

      // Return callback
      return callback;
    } else {
      throw "Cannot bind '" + key + "' in " + this.__name;
    }
  };
};

export const unbind = function () {
  return function (object) {
    // Remove all binds belonging to object
    if (object.__binds) {
      object.__binds.forEach(
        function (bind) {
          // Polyfill for both styles of event listener removers
          _polyfill(
            bind.target,
            ["removeEventListener", "off"],
            function (method) {
              bind.target[method](bind.name, bind.callback);
            }
          );
        }.bind(this)
      );

      object.__binds = [];
    }
  };
};

export const apply = function (object) {
  Object.assign(object, THREE.EventDispatcher.prototype);

  object.trigger = _trigger;
  object.triggerOnce = _triggerOnce;

  object.on = object.addEventListener;
  object.off = object.removeEventListener;
  object.dispatchEvent = object.trigger;
};

export const _triggerOnce = function (event) {
  this.trigger(event);
  if (this._listeners) {
    delete this._listeners[event.type];
  }
};

export const _trigger = function (event) {
  if (this._listeners === undefined) return;

  var type = event.type;
  var listeners = this._listeners[type];
  if (listeners !== undefined) {
    listeners = listeners.slice();
    var length = listeners.length;

    event.target = this;
    for (var i = 0; i < length; i++) {
      // add original target as parameter for convenience
      listeners[i].call(this, event, this);
    }
  }
};

export const _polyfill = function (object, methods, callback) {
  methods.map(function (_method) {
    return object.method;
  });
  if (methods.length) callback(methods[0]);
};
