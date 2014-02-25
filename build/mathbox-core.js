(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Context, Primitives, Render, Stage;

Stage = require('./stage');

Render = require('./render');

Primitives = require('./primitives');

Context = (function() {
  function Context(gl, scene, camera, script) {
    if (script == null) {
      script = [];
    }
    this.renderables = new Render.Factory(gl, Render.Types.Classes);
    this.attributes = new Primitives.Attributes(Primitives.Types.Traits);
    this.primitives = new Primitives.Factory(Primitives.Types.Classes, this.attributes, this.renderables);
    this.model = new Stage.Model(camera);
    this.scene = new Render.Scene(scene, camera);
    this.controller = new Stage.Controller(this.model, this.scene, this.primitives);
    this.animator = new Stage.Animator(this.model);
    this.director = new Stage.Director(this.controller, this.animator, script);
    this.api = new Stage.API(this.controller, this.animator, this.director);
  }

  Context.prototype.init = function() {
    return this.scene.inject();
  };

  Context.prototype.destroy = function() {
    return this.scene.unject();
  };

  Context.prototype.update = function() {
    this.animator.update();
    return this.attributes.digest();
  };

  return Context;

})();

module.exports = Context;


},{"./primitives":5,"./render":22,"./stage":32}],2:[function(require,module,exports){
var Context, mathBox;

mathBox = function(options) {
  var three;
  if (options == null) {
    options = {};
  }
  if (options.plugins == null) {
    options.plugins = ['core', 'mathbox'];
  }
  three = THREE.Bootstrap(options);
  return three.mathbox;
};

window.MathBox = exports;

window.mathBox = exports.mathBox = mathBox;

exports.version = '2';


/*
 */

Context = require('./context');

THREE.Bootstrap.registerPlugin('mathbox', {
  defaults: {
    init: true
  },
  listen: ['ready', 'update'],
  install: function(three) {
    var inited;
    inited = false;
    return three.MathBox = {
      init: (function(_this) {
        return function(options) {
          var camera, scene, script;
          if (inited) {
            return;
          }
          inited = true;
          scene = (options != null ? options.scene : void 0) || _this.options.scene || three.scene;
          camera = (options != null ? options.camera : void 0) || _this.options.camera || three.camera;
          script = (options != null ? options.script : void 0) || _this.options.script;
          _this.context = new Context(three.renderer.context, scene, camera, script);
          _this.context.api.three = three;
          three.mathbox = _this.context.api;
          return _this.context.init();
        };
      })(this),
      destroy: (function(_this) {
        return function() {
          if (!inited) {
            return;
          }
          inited = false;
          _this.context.destroy();
          delete three.mathbox;
          delete _this.context.api.three;
          return delete _this.context;
        };
      })(this),
      object: function() {
        var _ref;
        return (_ref = this.context) != null ? _ref.scene.getRoot() : void 0;
      }
    };
  },
  uninstall: function(three) {
    three.MathBox.destroy();
    return delete three.MathBox;
  },
  ready: function(event, three) {
    if (this.options.init) {
      return three.MathBox.init();
    }
  },
  update: function(event, three) {
    var _ref;
    return (_ref = this.context) != null ? _ref.update() : void 0;
  }
});


/*
 */


},{"./context":1}],3:[function(require,module,exports){

/*
 Custom attribute model
 - Stores attributes in three.js uniform-style object so they can be passed around by reference
 - Avoids copying value objects on set
 - Coalesces update notifications per object
 */
var Attributes, Data;

Attributes = (function() {
  function Attributes(traits) {
    this.traits = traits;
    this.pending = [];
  }

  Attributes.prototype.getSpec = function(name) {
    return this.traits[name];
  };

  Attributes.prototype.queue = function(callback) {
    return this.pending.push(callback);
  };

  Attributes.prototype.apply = function(object, traits) {
    if (traits == null) {
      traits = [];
    }
    return new Data(object, traits, this);
  };

  Attributes.prototype.digest = function() {
    var callback, calls, limit, _i, _len, _ref;
    limit = 10;
    while (this.pending.length > 0 && --limit > 0) {
      _ref = [this.pending, []], calls = _ref[0], this.pending = _ref[1];
      for (_i = 0, _len = calls.length; _i < _len; _i++) {
        callback = calls[_i];
        callback();
      }
    }
    if (limit === 0) {
      console.error('While digesting: ', object);
      throw Error("Infinite loop in Data::digest");
    }
  };

  return Attributes;

})();

Data = (function() {
  function Data(object, traits, attributes) {
    var change, changes, digest, dirty, get, key, makers, name, options, set, spec, trait, validate, validators, values, _i, _len, _ref;
    if (traits == null) {
      traits = [];
    }
    get = (function(_this) {
      return function(key) {
        return _this[key].value;
      };
    })(this);
    set = (function(_this) {
      return function(key, value, ignore) {
        var replace;
        replace = validate(key, value, _this[key].value);
        if (replace != null) {
          _this[key].value = replace;
        }
        if (!ignore) {
          return change(key);
        }
      };
    })(this);
    object.get = function(key) {
      var out, value;
      if (key != null) {
        if (validators[key] != null) {
          return get(key);
        }
      } else {
        out = {};
        for (key in this) {
          value = this[key];
          out[key] = value.value;
        }
        return out;
      }
    };
    object.set = function(key, value, ignore) {
      var options;
      if ((key != null) && (value != null)) {
        if (validators[key] != null) {
          set(key, value, ignore);
        }
      } else {
        options = key;
        for (key in options) {
          value = options[key];
          if (validators[key] != null) {
            set(key, value, ignore);
          }
        }
      }
    };
    makers = {};
    validators = {};
    validate = function(key, value, target) {
      return validators[key](value, target);
    };
    object.validate = function(key, value) {
      var make, replace, target;
      make = makers[key];
      if (make != null) {
        target = make();
      }
      replace = validate(key, value, target);
      if (replace != null) {
        return replace;
      } else {
        return target;
      }
    };
    dirty = false;
    changes = {};
    change = (function(_this) {
      return function(key) {
        if (!dirty) {
          dirty = true;
          attributes.queue(digest);
        }
        return changes[key] = _this[key].value;
      };
    })(this);
    digest = function() {
      var changed;
      changed = changes;
      changes = {};
      dirty = false;
      return object.trigger({
        type: 'change',
        changed: changed
      });
    };
    values = {};
    for (_i = 0, _len = traits.length; _i < _len; _i++) {
      trait = traits[_i];
      _ref = trait.split(':'), trait = _ref[0], name = _ref[1];
      if (name == null) {
        name = trait;
      }
      spec = attributes.getSpec(trait);
      for (key in spec) {
        options = spec[key];
        key = [name, key].join('.');
        this[key] = {
          type: typeof options.uniform === "function" ? options.uniform() : void 0,
          value: options.make()
        };
        change(key);
        makers[key] = options.make;
        validators[key] = options.validate;
      }
    }
  }

  return Data;

})();

module.exports = Attributes;


},{}],4:[function(require,module,exports){
var Factory;

Factory = (function() {
  function Factory(classes, attributes, renderables) {
    this.classes = classes;
    this.attributes = attributes;
    this.renderables = renderables;
  }

  Factory.prototype.getTypes = function() {
    return Object.keys(this.classes);
  };

  Factory.prototype.make = function(type, options) {
    return new this.classes[type](options, this.attributes, this.renderables);
  };

  return Factory;

})();

module.exports = Factory;


},{}],5:[function(require,module,exports){
exports.Factory = require('./factory');

exports.Primitive = require('./primitive');

exports.Attributes = require('./attributes');

exports.Types = require('./types');


},{"./attributes":3,"./factory":4,"./primitive":6,"./types":10}],6:[function(require,module,exports){
var Primitive;

Primitive = (function() {
  function Primitive(options, attributes, _factory) {
    this._factory = _factory;
    this._attributes = attributes.apply(this, this.traits);
    this.parent = null;
    this.root = null;
    this.set(options, null, true);
    this.on('change', (function(_this) {
      return function(event) {
        if (_this.root) {
          return _this._change(event.changed);
        }
      };
    })(this));
  }

  Primitive.prototype.rebuild = function() {
    if (this.root) {
      this._unmake();
      return this._make();
    }
  };

  Primitive.prototype._make = function() {};

  Primitive.prototype._unmake = function() {};

  Primitive.prototype._change = function(changed) {};

  Primitive.prototype._added = function(parent) {
    this.parent = parent;
    this.root = parent.root;
    return this._make();
  };

  Primitive.prototype._removed = function() {
    this._unmake();
    return this.root = this.parent = null;
  };

  Primitive.prototype._extend = function() {
    if (this.traits == null) {
      this.traits = [];
    }
    return this.traits = [].concat.apply(this.traits, arguments);
  };

  Primitive.prototype._render = function(object) {
    return this.trigger({
      type: 'render',
      object: object
    });
  };

  Primitive.prototype._unrender = function(object) {
    return this.trigger({
      type: 'unrender',
      object: object
    });
  };

  return Primitive;

})();

THREE.Binder.apply(Primitive.prototype);

module.exports = Primitive;


},{}],7:[function(require,module,exports){
var Cartesian, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

View = require('./view');

Cartesian = (function(_super) {
  __extends(Cartesian, _super);

  function Cartesian(options, attributes, factory) {
    Cartesian.__super__.constructor.call(this, options, attributes, factory);
  }

  return Cartesian;

})(View);

module.exports = Cartesian;


},{"./view":12}],8:[function(require,module,exports){
var Grid, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive');

Grid = (function(_super) {
  __extends(Grid, _super);

  function Grid(options, attributes, factory) {
    this._extend('line', 'object', 'view', 'grid', 'axis:axis1', 'axis:axis2');
    Grid.__super__.constructor.call(this, options, attributes, factory);
    this.line1 = null;
    this.line2 = null;
    this.ticks1 = null;
    this.ticks2 = null;
  }

  Grid.prototype._make = function() {
    var map;
    this.ticks1 = this._factory.make('linebuffer');
    this.ticks2 = this._factory.make('linebuffer');
    map = {
      lineWidth: this._attributes['line.width'],
      lineColor: this._attributes['line.color']
    };
    this.line1 = this._factory.make('line', map);
    this.line2 = this._factory.make('line', map);
    this._render(this.line1);
    return this._render(this.line2);
  };

  Grid.prototype._unmake = function() {
    if (this.line1 != null) {
      this._unrender(this.line1);
    }
    if (this.line2 != null) {
      this._unrender(this.line2);
    }
    this.line1 = null;
    return this.line2 = null;
  };

  Grid.prototype.change = function(changed) {};

  return Grid;

})(Primitive);

module.exports = Grid;


},{"../primitive":6}],9:[function(require,module,exports){
var Group, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive');

Group = (function(_super) {
  __extends(Group, _super);

  function Group(options, attributes, factory) {
    this.children = [];
    Group.__super__.constructor.call(this, options, attributes, factory);
  }

  Group.prototype.add = function(primitive) {
    this.children.push(primitive);
    return primitive._added(this);
  };

  Group.prototype.remove = function(primitive) {
    var child;
    this.children = (function() {
      var _i, _len, _ref, _results;
      _ref = this.children;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (child !== primitive) {
          _results.push(child);
        }
      }
      return _results;
    }).call(this);
    return primitive._removed(this);
  };

  return Group;

})(Primitive);

module.exports = Group;


},{"../primitive":6}],10:[function(require,module,exports){
var Classes, Traits, Types;

Classes = {
  root: require('./root'),
  group: require('./group'),
  view: require('./view'),
  cartesian: require('./cartesian'),
  grid: require('./grid')
};

Types = {
  array: function(type, size) {
    return {
      uniform: function() {
        return type.uniform() + 'v';
      },
      make: function() {
        var i, _i, _results;
        _results = [];
        for (i = _i = 0; 0 <= size ? _i < size : _i > size; i = 0 <= size ? ++_i : --_i) {
          _results.push(type.make());
        }
        return _results;
      },
      validate: function(value, target) {
        var i, replace, _i, _j, _ref, _ref1;
        if ((value.constructor != null) && value.constructor === Array) {
          target.length = size ? size : value.length;
          for (i = _i = 0, _ref = target.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            replace = type.validate(value[i], target[i]);
            if (replace != null) {
              target[i] = replace;
            }
          }
        } else {
          target.length = size;
          for (i = _j = 0, _ref1 = target.length; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            target[i] = type.value;
          }
        }
      }
    };
  },
  bool: function(value) {
    return {
      uniform: function() {
        return 'f';
      },
      make: function() {
        return !!value;
      },
      validate: function(value) {
        return !!value;
      }
    };
  },
  number: function(value) {
    if (value == null) {
      value = 0;
    }
    return {
      uniform: function() {
        return 'f';
      },
      make: function() {
        return +value;
      },
      validate: function(value) {
        return +value || 0;
      }
    };
  },
  string: function(value) {
    if (value == null) {
      value = '';
    }
    return {
      make: function() {
        return "" + value;
      },
      validate: function(value) {
        return "" + value;
      }
    };
  },
  scale: function(value) {
    return new Types.string(value);
  },
  vec2: function(x, y) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    return {
      uniform: function() {
        return 'v2';
      },
      make: function() {
        return new THREE.Vector2(x, y);
      },
      validate: function(value, target) {
        var _ref, _ref1;
        if (value instanceof THREE.Vector2) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          target.set((_ref = value[0]) != null ? _ref : x, (_ref1 = value[1]) != null ? _ref1 : y);
        } else {
          target.set(x, y);
        }
      }
    };
  },
  vec3: function(x, y, z) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    return {
      uniform: function() {
        return 'v3';
      },
      make: function() {
        return new THREE.Vector3(x, y, z);
      },
      validate: function(value, target) {
        var _ref, _ref1, _ref2;
        if (value instanceof THREE.Vector3) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          target.set((_ref = value[0]) != null ? _ref : x, (_ref1 = value[1]) != null ? _ref1 : y, (_ref2 = value[2]) != null ? _ref2 : z);
        } else {
          target.set(x, y, z);
        }
      }
    };
  },
  vec4: function(x, y, z, w) {
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 0;
    }
    return {
      uniform: function() {
        return 'v4';
      },
      make: function() {
        return new THREE.Vector4(x, y, z, w);
      },
      validate: function(value, target) {
        var _ref, _ref1, _ref2, _ref3;
        if (value instanceof THREE.Vector4) {
          target.copy(value);
        } else if ((value != null ? value.constructor : void 0) === Array) {
          target.set((_ref = value[0]) != null ? _ref : x, (_ref1 = value[1]) != null ? _ref1 : y, (_ref2 = value[2]) != null ? _ref2 : z, (_ref3 = value[3]) != null ? _ref3 : w);
        } else {
          target.set(x, y, z, w);
        }
      }
    };
  },
  quat: function(x, y, z, w) {
    var vec4;
    if (x == null) {
      x = 0;
    }
    if (y == null) {
      y = 0;
    }
    if (z == null) {
      z = 0;
    }
    if (w == null) {
      w = 1;
    }
    vec4 = Types.vec4(x, y, z, w);
    return {
      uniform: function() {
        return 'v4';
      },
      make: function() {
        return new THREE.Quaternion;
      },
      validate: function(value, target) {
        var ret;
        if (value instanceof THREE.Quaternion) {
          target.copy(value);
        } else {
          ret = vec4.validate(value, target);
        }
        (ret != null ? ret : target).normalize();
        return ret;
      }
    };
  },
  color: function(r, g, b) {
    var vec3;
    if (r == null) {
      r = .5;
    }
    if (g == null) {
      g = .5;
    }
    if (b == null) {
      b = .5;
    }
    vec3 = Types.vec3(r, g, b);
    return {
      uniform: function() {
        return 'v3';
      },
      make: function() {
        return new THREE.Vector3();
      },
      validate: function(value, target) {
        if (value === +value) {
          value = new THREE.Color(value);
        }
        if (value instanceof THREE.Color) {
          target.set(value.r, value.g, value.b);
        } else {
          return vec3.validate(value, target);
        }
      }
    };
  }
};

Traits = {
  object: {
    visible: Types.bool(),
    position: Types.vec4(),
    rotation: Types.quat(),
    scale: Types.vec4(1, 1, 1, 1)
  },
  line: {
    width: Types.number(1),
    color: Types.color()
  },
  surface: {
    color: Types.color()
  },
  view: {
    range: Types.array(Types.vec2(-1, 1), 4)
  },
  grid: {
    axes: Types.vec2(0, 1)
  },
  axis: {
    inherit: Types.bool(),
    ticks: Types.number(10),
    unit: Types.number(1),
    base: Types.number(10),
    detail: Types.number(2),
    scale: Types.scale()
  }
};

exports.Classes = Classes;

exports.Types = Types;

exports.Traits = Traits;


},{"./cartesian":7,"./grid":8,"./group":9,"./root":11,"./view":12}],11:[function(require,module,exports){
var Group, Root,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Group = require('./group');

Root = (function(_super) {
  __extends(Root, _super);

  function Root(options, attributes, factory) {
    Root.__super__.constructor.call(this, options, attributes, factory);
    this.root = this;
  }

  return Root;

})(Group);

module.exports = Root;


},{"./group":9}],12:[function(require,module,exports){
var Group, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Group = require('./group');

View = (function(_super) {
  __extends(View, _super);

  function View(options, attributes, factory) {
    this._extend('object', 'view');
    View.__super__.constructor.call(this, options, attributes, factory);
  }

  return View;

})(Group);

module.exports = View;


},{"./group":9}],13:[function(require,module,exports){
var Buffer, Renderable,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

Buffer = (function(_super) {
  var iterationLimit;

  __extends(Buffer, _super);

  iterationLimit = 0xFFFF;

  function Buffer(gl) {
    this.gl = gl;
    this.build();
  }

  Buffer.prototype.build = function() {
    return this.data = new Float32Array(this.samples * 4);
  };

  Buffer.prototype.generate = function() {
    var data, done, limit, output, p;
    limit = this.samples * 4;
    data = this.data;
    done = false;
    p = 0;
    return output = function(x, y, z, w) {
      if (!done) {
        data[p++] = x || 0;
        data[p++] = y || 0;
        data[p++] = z || 0;
        data[p++] = w || 0;
      }
      return !(done = p >= limit);
    };
  };

  Buffer.prototype.iterate = function() {};

  Buffer.prototype.write = function() {};

  Buffer.prototype.update = function() {
    this.iterate();
    return this.write();
  };

  Buffer.prototype.dispose = function() {
    this.data = null;
    this.texture.dispose();
    return Buffer.__super__.dispose.apply(this, arguments);
  };

  return Buffer;

})(Renderable);

module.exports = Buffer;


},{"../renderable":25}],14:[function(require,module,exports){
exports.Texture = require('./texture');

exports.Buffer = require('./buffer');

exports.LineBuffer = require('./linebuffer');

exports.SurfaceBuffer = require('./surfacebuffer');


},{"./buffer":13,"./linebuffer":15,"./surfacebuffer":16,"./texture":17}],15:[function(require,module,exports){
var Buffer, LineBuffer, Texture,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

Texture = require('./texture');

LineBuffer = (function(_super) {
  __extends(LineBuffer, _super);

  function LineBuffer(gl, options) {
    this.gl = gl;
    this.callback = options.callback || function() {};
    this.width = options.width || 1;
    this.history = options.history || 1;
    this.samples = this.width;
    this.build();
  }

  LineBuffer.prototype.build = function() {
    LineBuffer.__super__.build.apply(this, arguments);
    this.texture = new Texture(this.gl, this.samples, this.history);
    this.index = 0;
    this.uniforms = {
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2()
      }
    };
    this.dataPointer = this.uniforms.dataPointer.value;
    return this._adopt(this.texture.uniforms);
  };

  LineBuffer.prototype.iterate = function() {
    var callback, i, output;
    callback = this.callback;
    output = this.generate();
    i = 0;
    while (callback(i++, output) && i < Buffer.iterationLimit) {
      true;
    }
  };

  LineBuffer.prototype.write = function() {
    this.dataPointer.set(.5, this.index + .5);
    this.texture.write(this.data, 0, this.index, this.samples, 1);
    return this.index = (this.index + 1) % this.history;
  };

  return LineBuffer;

})(Buffer);

module.exports = LineBuffer;


},{"./buffer":13,"./texture":17}],16:[function(require,module,exports){
var Buffer, SurfaceBuffer, Texture,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

Texture = require('./texture');

SurfaceBuffer = (function(_super) {
  __extends(SurfaceBuffer, _super);

  function SurfaceBuffer(gl, options) {
    this.gl = gl;
    this.callback = options.callback || function() {};
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.history = options.history || 1;
    this.samples = this.width * this.height;
    this.build();
  }

  SurfaceBuffer.prototype.build = function() {
    SurfaceBuffer.__super__.build.apply(this, arguments);
    this.texture = new Texture(this.gl, this.width, this.height * this.history);
    this.index = 0;
    this.uniforms = {
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2()
      }
    };
    this.dataPointer = this.uniforms.dataPointer.value;
    return this._adopt(this.texture.uniforms);
  };

  SurfaceBuffer.prototype.iterate = function() {
    var callback, i, j, k, n, output, repeat;
    callback = this.callback;
    output = this.generate();
    n = this.width;
    i = j = k = 0;
    while (++k < Buffer.iterationLimit) {
      repeat = callback(i, j, output);
      if (!repeat) {
        break;
      }
      if (++i === n) {
        i = 0;
        j++;
      }
    }
  };

  SurfaceBuffer.prototype.write = function() {
    this.dataPointer.set(.5, this.index + .5);
    this.texture.write(this.data, 0, this.index, this.samples, 1);
    return this.index = (this.index + 1) % this.history;
  };

  return SurfaceBuffer;

})(Buffer);

module.exports = SurfaceBuffer;


},{"./buffer":13,"./texture":17}],17:[function(require,module,exports){
var Texture;

Texture = (function() {
  function Texture(gl, w, h) {
    this.gl = gl;
    this.w = w;
    this.h = h;
    this.n = this.w * this.h * 4;
    this.build();
  }

  Texture.prototype.build = function() {
    var gl;
    gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.data = new Float32Array(this.n);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.w, this.h, 0, gl.RGBA, gl.FLOAT, this.data);
    this.textureObject = new THREE.Texture(new Image(), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
    this.textureObject.__webglInit = true;
    this.textureObject.__webglTexture = texture;
    return this.uniforms = {
      dataResolution: {
        type: 'v2',
        value: new THREE.Vector2(1 / this.w, 1 / this.h)
      },
      dataTexture: {
        type: 't',
        value: this.textureObject
      }
    };
  };

  Texture.prototype.write = function(data, x, y, w, h) {
    var gl;
    gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    return gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, gl.RGBA, gl.FLOAT, data);
  };

  Texture.prototype.dispose = function() {
    throw 'Texture::dispose not yet implemented';
  };

  return Texture;

})();

module.exports = Texture;


},{}],18:[function(require,module,exports){
var Factory;

Factory = (function() {
  function Factory(gl, classes) {
    this.gl = gl;
    this.classes = classes;
  }

  Factory.prototype.getTypes = function() {
    return Object.keys(this.classes);
  };

  Factory.prototype.make = function(type, options, uniforms) {
    return new this.classes[type](this.gl, options, uniforms);
  };

  return Factory;

})();

module.exports = Factory;


},{}],19:[function(require,module,exports){
var Geometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = (function(_super) {
  __extends(Geometry, _super);

  function Geometry() {
    THREE.BufferGeometry.call(this);
  }

  Geometry.prototype._emitter = function(name) {
    var array, attribute, four, n, offset, one, three, two;
    attribute = this.attributes[name];
    array = attribute.array;
    n = attribute.itemSize;
    offset = 0;
    one = function(a) {
      return array[offset++] = a;
    };
    two = function(a, b) {
      array[offset++] = a;
      return array[offset++] = b;
    };
    three = function(a, b, c) {
      array[offset++] = a;
      array[offset++] = b;
      return array[offset++] = c;
    };
    four = function(a, b, c, d) {
      array[offset++] = a;
      array[offset++] = b;
      array[offset++] = c;
      return array[offset++] = d;
    };
    return [null, one, two, three, four][itemSize];
  };

  return Geometry;

})(THREE.BufferGeometry);

module.exports = Geometry;


},{}],20:[function(require,module,exports){
exports.Geometry = require('./geometry');

exports.LineGeometry = require('./linegeometry');


},{"./geometry":19,"./linegeometry":21}],21:[function(require,module,exports){
var Geometry, LineGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');

LineGeometry = (function(_super) {
  __extends(LineGeometry, _super);

  function LineGeometry(options) {
    var base, edge, i, index, j, k, line, points, position, ribbons, samples, segments, strips, triangles, x, y, _i, _j, _k, _l, _m, _n, _ref;
    THREE.BufferGeometry.call(this);
    samples = +options.samples || 2;
    strips = +options.strips || 1;
    ribbons = +options.ribbons || 1;
    segments = samples - 1;
    points = samples * strips * ribbons;
    triangles = segments * 2 * strips * ribbons;
    this.addAttribute('index', Uint16Array, triangles * 3, 1);
    this.addAttribute('position', Float32Array, points, 3);
    this.addAttribute('line', Float32Array, points, 2);
    index = this._emitter('index');
    position = this._emitter('position');
    line = this._emitter('line');
    base = 0;
    for (i = _i = 0; 0 <= ribbons ? _i < ribbons : _i > ribbons; i = 0 <= ribbons ? ++_i : --_i) {
      for (j = _j = 0; 0 <= strips ? _j < strips : _j > strips; j = 0 <= strips ? ++_j : --_j) {
        for (k = _k = 0, _ref = samples - 1; 0 <= _ref ? _k < _ref : _k > _ref; k = 0 <= _ref ? ++_k : --_k) {
          index(base);
          index(base + 1);
          index(base + 2);
          index(base + 2);
          index(base + 1);
          index(base + 3);
        }
        base += 2;
      }
      base += 2;
    }
    for (i = _l = 0; 0 <= ribbons ? _l < ribbons : _l > ribbons; i = 0 <= ribbons ? ++_l : --_l) {
      y = 0;
      for (j = _m = 0; 0 <= strips ? _m < strips : _m > strips; j = 0 <= strips ? ++_m : --_m) {
        x = 0;
        for (k = _n = 0; 0 <= samples ? _n < samples : _n > samples; k = 0 <= samples ? ++_n : --_n) {
          edge = k === 0 ? -1 : k === segments ? 1 : 0;
          position(x, y, 0);
          position(x, y, 0);
          line(edge, 1);
          line(edge, -1);
          x++;
        }
      }
      y++;
    }
    return;
  }

  return LineGeometry;

})(Geometry);

module.exports = LineGeometry;


},{"./geometry":19}],22:[function(require,module,exports){
exports.Scene = require('./scene');

exports.Factory = require('./factory');

exports.Renderable = require('./scene');

exports.Types = require('./types');


},{"./factory":18,"./scene":26,"./types":27}],23:[function(require,module,exports){
exports.Line = require('./line');


},{"./line":24}],24:[function(require,module,exports){
var Line, LineGeometry, Renderable,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

LineGeometry = require('../geometry').LineGeometry;

Line = (function(_super) {
  __extends(Line, _super);

  function Line(gl, options, map) {
    var geometry, material;
    this.gl = gl;
    this.options = options;
    this._map(map, ['lineWidth', 'lineColor']);
    geometry = new LineGeometry({
      samples: 2,
      strips: 1,
      ribbons: 1
    });
    return;
    material = new THREE.ShaderMaterial({
      attributes: this.attributes(),
      uniforms: this.uniforms(),
      vertexShader: getShader(this.vertexShader),
      fragmentShader: getShader(this.fragmentShader),
      side: THREE.DoubleSide
    });
    material.defaultAttributeValues = null;
    this._geometry = geometry;
    this._material = material;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.object = mesh;
  }

  Line.prototype.dispose = function() {
    return Line.__super__.dispose.apply(this, arguments);
  };

  return Line;

})(Renderable);

module.exports = Line;


/*

Acko.Line = function (options) {
  if (options === undefined) return;

  options = options || {};

  this.buffer    = options.buffer     || null;
  this.n         = options.n          || this.buffer.n || 1;
  this.m         = options.m          || this.buffer.m || this.buffer.history || 1;
  this.color     = options.color      || new THREE.Vector4(1, 1, 1, 1);
  this.lineWidth = options.lineWidth  || 1;
  this.lineClip  = options.lineClip   || 1;
  this.zBias     = options.zBias      || 0;
  this.mode      = options.mode       || 'linestrip';
  this.transpose = options.transpose  || false;
  this._uniforms = options.uniforms   || {};

  this.vertexShader   = options.vertexShader   || 'multiline-vertex-data';
  this.fragmentShader = options.fragmentShader || 'multiline-fragment';

  THREE.Object3D.apply(this);

  this.build();
};

Acko.Line.prototype = _.extend(new THREE.Object3D(), {

  attributes: function () {
    return {
      line: {
        type: 'v2',
        value: null,
      },
    };
  },

  set: function (props) {
    for (var i in props) {
      var u = this._uniforms[i];
      if (u) {
        u.value = props[i];
      }
    }
  },

  uniforms: function () {
    return _.extend({}, this._uniforms, this.buffer.uniforms());
  },

  build: function () {
    this._uniforms = _.extend({}, this._uniforms, {
      lineWidth: {
        type: 'f',
        value: this.lineWidth,
      },
      lineClip: {
        type: 'f',
        value: this.lineClip,
      },
      color: {
        type: 'v4',
        value: this.color,
      },
      zBias: {
        type: 'f',
        value: this.zBias,
      },
    });

    var klass = {
      linestrip: Acko.LineStripGeometry,
      lines:     Acko.LinesGeometry,
    }[this.mode];

    var geometry = new klass(this.n, this.m, this.transpose);
    var material = new THREE.ShaderMaterial({
      attributes: this.attributes(),
      uniforms: this.uniforms(),
      vertexShader: getShader(this.vertexShader),
      fragmentShader: getShader(this.fragmentShader),
      side: THREE.DoubleSide,
    });
    material.defaultAttributeValues = null;

    this._geometry = geometry;
    this._material = material;
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;

    this.add(this.mesh);
  },

});
 */


},{"../geometry":20,"../renderable":25}],25:[function(require,module,exports){
var Renderable;

Renderable = (function() {
  function Renderable(gl) {
    this.gl = gl;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
  }

  Renderable.prototype.dispose = function() {
    return this.uniforms = null;
  };

  Renderable.prototype._adopt = function(uniforms) {
    var key, value, _results;
    _results = [];
    for (key in uniforms) {
      value = uniforms[key];
      _results.push(this.uniforms[key] = value);
    }
    return _results;
  };

  Renderable.prototype._map = function(map, uniforms) {
    var key, _results;
    if (this.uniforms == null) {
      this.uniforms = {};
    }
    _results = [];
    for (key in uniforms) {
      if (map[key] != null) {
        _results.push(this.uniforms[key] = map[key]);
      }
    }
    return _results;
  };

  Renderable.prototype._set = function(uniforms) {
    var key, value, _results;
    _results = [];
    for (key in uniforms) {
      value = uniforms[key];
      if (this.uniforms[key] != null) {
        _results.push(this.uniforms[key].value = value);
      }
    }
    return _results;
  };

  return Renderable;

})();

module.exports = Renderable;


},{}],26:[function(require,module,exports){
var Scene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Scene = (function() {
  function Scene(scene, camera) {
    var MathBox;
    this.scene = scene;
    this.camera = camera;
    MathBox = (function(_super) {
      __extends(MathBox, _super);

      function MathBox() {
        THREE.Object3D.apply(this);
      }

      return MathBox;

    })(THREE.Object3D);
    this.root = new MathBox;
  }

  Scene.prototype.getRoot = function() {
    return this.root;
  };

  Scene.prototype.inject = function() {
    return this.scene.add(this.root);
  };

  Scene.prototype.unject = function() {
    return this.scene.remove(this.root);
  };

  Scene.prototype.add = function(object) {
    return this.root.add(object);
  };

  Scene.prototype.remove = function(object) {
    return this.root.remove(object);
  };

  return Scene;

})();

module.exports = Scene;


},{}],27:[function(require,module,exports){
var Classes;

Classes = {
  line: require('./meshes').Line,
  linebuffer: require('./buffer').LineBuffer,
  surfacebuffer: require('./buffer').SurfaceBuffer
};

exports.Classes = Classes;


},{"./buffer":14,"./meshes":23}],28:[function(require,module,exports){
var Animator;

Animator = (function() {
  function Animator(model) {
    this.model = model;
  }

  Animator.prototype.update = function() {};

  return Animator;

})();

module.exports = Animator;


},{}],29:[function(require,module,exports){
var API;

API = (function() {
  function API(_controller, _animator, _director, _up, _target) {
    var type, _i, _len, _ref;
    this._controller = _controller;
    this._animator = _animator;
    this._director = _director;
    this._up = _up;
    this._target = _target;
    _ref = this._controller.getTypes();
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      type = _ref[_i];
      if (type !== 'root' && type !== 'group') {
        (function(_this) {
          return (function(type) {
            return _this[type] = function(options) {
              return _this.add(type, options);
            };
          });
        })(this)(type);
      }
    }
    this._model = this._controller.model;
  }

  API.prototype.add = function(type, options) {
    var object, primitive, target, _ref;
    primitive = this._controller.make(type, options);
    target = (_ref = this.target) != null ? _ref : this._controller.getRoot();
    if (!primitive.children && target === this._controller.getRoot()) {
      target = ((function() {
        var _i, _len, _ref1, _results;
        _ref1 = target.children;
        _results = [];
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          object = _ref1[_i];
          if (object.children != null) {
            _results.push(object);
          }
        }
        return _results;
      })())[0] || target;
    }
    this._controller.add(primitive, target);
    if (primitive.children) {
      return this.push(primitive);
    } else {
      return this;
    }
  };

  API.prototype.push = function(target) {
    return new API(this._controller, this._animator, this._director, this, target);
  };

  API.prototype.end = function() {
    var _ref;
    return (_ref = this._up) != null ? _ref : this;
  };

  API.prototype.reset = function() {
    return push({
      target: void 0
    });
  };

  return API;

})();

module.exports = API;


},{}],30:[function(require,module,exports){
var Controller;

Controller = (function() {
  function Controller(model, scene, factory) {
    this.model = model;
    this.scene = scene;
    this.factory = factory;
    this.model.setRoot(this.factory.make('root'));
    this.render = (function(_this) {
      return function(event) {
        return _this.scene.add(event.renderable.object);
      };
    })(this);
    this.unrender = (function(_this) {
      return function(event) {
        return _this.scene.remove(event.renderable.object);
      };
    })(this);
  }

  Controller.prototype.getRoot = function() {
    return this.model.getRoot();
  };

  Controller.prototype.getTypes = function() {
    return this.factory.getTypes();
  };

  Controller.prototype.make = function(type, options) {
    return this.factory.make(type, options);
  };

  Controller.prototype.add = function(primitive, target) {
    if (target == null) {
      target = this.model.getRoot();
    }
    primitive.on('render', this.render);
    primitive.on('unrender', this.unrender);
    return target.add(primitive);
  };

  Controller.prototype.remove = function(primitive) {
    var target;
    primitive.unmake();
    target = primitive.parent || this.model.getRoot();
    target.remove(primitive);
    primitive.off('render', this.render);
    return primitive.off('unrender', this.unrender);
  };

  return Controller;

})();

module.exports = Controller;


},{}],31:[function(require,module,exports){
var Director;

Director = (function() {
  function Director(model, script) {
    this.model = model;
    this.script = script;
  }

  return Director;

})();

module.exports = Director;


},{}],32:[function(require,module,exports){
exports.Animator = require('./animator');

exports.API = require('./api');

exports.Controller = require('./controller');

exports.Director = require('./director');

exports.Model = require('./model');


},{"./animator":28,"./api":29,"./controller":30,"./director":31,"./model":33}],33:[function(require,module,exports){
var Model;

Model = (function() {
  function Model(camera) {
    this.camera = camera;
  }

  Model.prototype.setRoot = function(root) {
    this.root = root;
  };

  Model.prototype.getRoot = function() {
    return this.root;
  };

  return Model;

})();

module.exports = Model;


},{}]},{},[2])