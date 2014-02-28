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
    this.scene = new Render.Scene(scene);
    this.renderables = new Render.Factory(gl, Render.Types.Classes);
    this.attributes = new Primitives.Attributes(Primitives.Types.Traits, Primitives.Types.Types);
    this.primitives = new Primitives.Factory(Primitives.Types.Classes, this.attributes, this.renderables);
    this.model = new Stage.Model(camera);
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


},{"./primitives":5,"./render":25,"./stage":35}],2:[function(require,module,exports){
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
 - Stores attributes in three.js uniform-style objects so they can be passed around by reference into renderables
 - Avoids copying value objects on set
 - Coalesces update notifications per object
 */
var Attributes, Data;

Attributes = (function() {
  function Attributes(traits, types) {
    this.traits = traits;
    this.types = types;
    this.pending = [];
  }

  Attributes.prototype.make = function(type) {
    return {
      type: typeof type.uniform === "function" ? type.uniform() : void 0,
      value: type.make()
    };
  };

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
    var change, changes, digest, dirty, event, get, key, makers, name, options, set, spec, trait, validate, validators, values, _i, _len, _ref;
    if (traits == null) {
      traits = [];
    }
    get = (function(_this) {
      return function(key) {
        var _ref;
        return (_ref = _this[key]) != null ? _ref.value : void 0;
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
    object.get = (function(_this) {
      return function(key) {
        var out, value;
        if (key != null) {
          return get(key);
        } else {
          out = {};
          for (key in _this) {
            value = _this[key];
            out[key] = value.value;
          }
          return out;
        }
      };
    })(this);
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
    event = {
      type: 'change',
      changed: null
    };
    digest = function() {
      event.changed = changes;
      changes = {};
      dirty = false;
      return object.trigger(event);
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


},{"./attributes":3,"./factory":4,"./primitive":6,"./types":11}],6:[function(require,module,exports){
var Primitive,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Primitive = (function() {
  function Primitive(options, _attributes, _factory) {
    this._attributes = _attributes;
    this._factory = _factory;
    this.attributes = this._attributes.apply(this, this.traits);
    this.parent = null;
    this.root = null;
    this.ancestors = [];
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

  Primitive.prototype._inherit = function(trait) {
    var handler, object;
    object = this;
    while (object) {
      if (__indexOf.call(object.traits, trait) >= 0) {
        handler = (function(_this) {
          return function(event) {
            if (_this.root) {
              return _this._change(event.changed);
            }
          };
        })(this);
        this.ancestors.push([object, handler]);
        object.on('change', handler);
        return object;
      }
      object = object.parent;
    }
    return null;
  };

  Primitive.prototype._unherit = function() {
    var ancestor, handler, object, _i, _len, _ref;
    _ref = this.ancestors;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      ancestor = _ref[_i];
      object = ancestor[0], handler = ancestor[1];
      object.off('change', handler);
    }
    return this.ancestors = [];
  };

  Primitive.prototype._added = function(parent) {
    this.parent = parent;
    this.root = parent.root;
    this._make();
    return this._change({});
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

  Primitive.prototype._render = function(renderable) {
    return this.trigger({
      type: 'render',
      renderable: renderable
    });
  };

  Primitive.prototype._unrender = function(renderable) {
    return this.trigger({
      type: 'unrender',
      renderable: renderable
    });
  };

  return Primitive;

})();

THREE.Binder.apply(Primitive.prototype);

module.exports = Primitive;


},{}],7:[function(require,module,exports){
var Axis, Primitive,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive');

Axis = (function(_super) {
  __extends(Axis, _super);

  function Axis(options, attributes, factory) {
    this._extend('object', 'style', 'line', 'axis');
    Axis.__super__.constructor.call(this, options, attributes, factory);
    this.line = null;
  }

  Axis.prototype._make = function() {
    var detail, samples, types, uniforms;
    this.inherit = this._inherit('view');
    types = this._attributes.types;
    uniforms = {
      lineWidth: this.attributes['line.width'],
      lineColor: this.attributes['style.color'],
      lineOpacity: this.attributes['style.opacity'],
      axisLength: this._attributes.make(types.vec4()),
      axisPosition: this._attributes.make(types.vec4())
    };
    this.axisLength = uniforms.axisLength.value;
    this.axisPosition = uniforms.axisPosition.value;
    detail = this.get('axis.detail');
    samples = detail + 1;
    this.line = this._factory.make('line', {
      uniforms: uniforms,
      samples: samples
    });
    return this._render(this.line);
  };

  Axis.prototype._unmake = function() {
    this._unrender(this.line);
    this.line.dispose();
    this.line = null;
    return this._unherit();
  };

  Axis.prototype._change = function(changed) {
    var dimension, inherit, max, min, range, ranges, w, x, y, z;
    if (changed['axis.detail'] != null) {
      this.rebuild();
    }
    inherit = this.get('axis.inherit');
    dimension = this.get('axis.dimension');
    if (inherit && this.inherit) {
      ranges = this.inherit.get('view.range');
      range = ranges[dimension - 1];
    } else {
      range = this.get('axis.range');
    }
    min = range.x;
    max = range.y;
    x = dimension === 1 ? 1 : 0;
    y = dimension === 2 ? 1 : 0;
    z = dimension === 3 ? 1 : 0;
    w = dimension === 4 ? 1 : 0;
    this.axisPosition.set(x, y, z, w).multiplyScalar(min);
    return this.axisLength.set(x, y, z, w).multiplyScalar(max - min);
  };

  return Axis;

})(Primitive);

module.exports = Axis;


},{"../primitive":6}],8:[function(require,module,exports){
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


},{"./view":15}],9:[function(require,module,exports){
var Grid, Primitive, Ticks, Types,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Primitive = require('../primitive');

Ticks = require('../../util').Ticks;

Types = require('./types');

Grid = (function(_super) {
  __extends(Grid, _super);

  function Grid(options, attributes, factory) {
    this._extend('line', 'object', 'grid', 'axis:axis[0]', 'axis:axis[1]');
    Grid.__super__.constructor.call(this, options, attributes, factory);
    this.widths = [];
    this.lines = null;
    this.buffers = null;
    this.grids = [];
  }

  Grid.prototype._make = function() {
    var axes, axis, uniforms;
    this.inherit = this._inherit('view');
    uniforms = {
      lineWidth: this.attributes['line.width'],
      lineColor: this.attributes['style.color'],
      lineOpacity: this.attributes['style.opacity']
    };
    axis = function(prefix, dimension) {
      var buffer, grid, key, line, ticks, types, value, width;
      types = this._attributes.types;
      grid = {
        gridRange: this._attributes.make(types.vec2(-1, 1)),
        gridAxis: this._attributes.make(types.vec3(0, 2, 0)),
        gridOffset: this._attributes.make(types.vec2(0, -1, 0))
      };
      for (key in uniforms) {
        value = uniforms[key];
        grid[key] = value;
      }
      ticks = this.get(prefix + 'ticks');
      width = ticks * 2;
      buffer = this._factory.make('databuffer', {
        samples: width,
        channels: 1
      });
      line = this._factory.make('line', {
        uniforms: uniforms,
        buffer: buffer
      });
      this.widths.push(width);
      this.buffers.push(buffer);
      this.lines.push(line);
      this.grids.push(grid);
      return this._render(line);
    };
    axes = this.get('grid.axes');
    return axis('axis[0].', axes[0]);
  };

  Grid.prototype._unmake = function() {
    var buffer, line, _i, _j, _len, _len1, _ref, _ref1;
    _ref = this.buffers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      buffer = _ref[_i];
      buffer.dispose();
    }
    _ref1 = this.lines;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      line = _ref1[_j];
      this._unrender(line);
      line.dispose();
    }
    this.widths = [];
    this.lines = null;
    return this.buffers = null;
  };

  Grid.prototype._change = function(changed) {
    var axes, axis;
    if ((changed['axis1.ticks'] != null) || (changed['axis2.ticks'] != null)) {
      return this.rebuild();
    }
    axis = function(prefix, dimension, buffer, grid) {
      var base, inherit, max, min, range, ranges, scale, ticks, unit;
      inherit = this.get(prefix + 'inherit');
      if (inherit && this.inherit) {
        ranges = this.inherit.get('view.range');
        range = ranges[dimension];
      } else {
        range = this.get(prefix + 'range');
      }
      ticks = this.get(prefix + 'ticks');
      unit = this.get(prefix + 'unit');
      base = this.get(prefix + 'base');
      scale = this.get(prefix + 'scale');
      min = range.x;
      max = range.y;
      ticks = Ticks.make(scale, min, max, ticks, unit, base);
      return buffer.copy(ticks);
    };
    axes = this.get('grid.axes');
    return axis('axis[0].', axes[0], this.buffer[0], this.grid[0]);
  };

  return Grid;

})(Primitive);

module.exports = Grid;


},{"../../util":37,"../primitive":6,"./types":14}],10:[function(require,module,exports){
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


},{"../primitive":6}],11:[function(require,module,exports){
var Classes;

Classes = {
  axis: require('./axis'),
  cartesian: require('./cartesian'),
  grid: require('./grid'),
  group: require('./group'),
  root: require('./root'),
  view: require('./view')
};

exports.Classes = Classes;

exports.Types = require('./types');

exports.Traits = require('./traits');


},{"./axis":7,"./cartesian":8,"./grid":9,"./group":10,"./root":12,"./traits":13,"./types":14,"./view":15}],12:[function(require,module,exports){
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


},{"./group":10}],13:[function(require,module,exports){
var Traits, Types;

Types = require('./types');

Traits = {
  object: {
    position: Types.vec4(),
    rotation: Types.quat(),
    scale: Types.vec4(1, 1, 1, 1),
    visible: Types.bool(true)
  },
  style: {
    opacity: Types.number(1),
    color: Types.color()
  },
  data: {
    position: Types.object(),
    color: Types.object()
  },
  line: {
    width: Types.number(.01)
  },
  view: {
    range: Types.array(Types.vec2(-1, 1), 4)
  },
  axis: {
    inherit: Types.bool(true),
    range: Types.vec2(-1, 1),
    dimension: Types.number(1),
    detail: Types.number(1)
  },
  ticks: {
    divide: Types.number(10),
    unit: Types.number(1),
    base: Types.number(10),
    scale: Types.scale(),
    size: Types.number(5)
  }
};

module.exports = Traits;


},{"./types":14}],14:[function(require,module,exports){
var Types;

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
  object: function() {
    return {
      make: function() {
        return {};
      },
      validate: function(value) {
        return value;
      }
    };
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
        return new THREE.Vector3(r, g, b);
      },
      validate: function(value, target) {
        var string;
        if (value === "" + value) {
          string = value;
          value = new THREE.Color().setStyle(string);
        } else if (value === +value) {
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

module.exports = Types;


},{}],15:[function(require,module,exports){
var Group, View,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Group = require('./group');

View = (function(_super) {
  __extends(View, _super);

  function View(options, attributes, factory) {
    this._extend('object', 'style', 'view');
    View.__super__.constructor.call(this, options, attributes, factory);
  }

  return View;

})(Group);

module.exports = View;


},{"./group":10}],16:[function(require,module,exports){
var Buffer, Renderable,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Renderable = require('../renderable');

Buffer = (function(_super) {
  var iterationLimit;

  __extends(Buffer, _super);

  iterationLimit = 0xFFFF;

  function Buffer(gl, options) {
    if (this.samples == null) {
      this.samples = options.samples || 1;
    }
    if (this.channels == null) {
      this.channels = options.channels || 4;
    }
    Buffer.__super__.constructor.call(this, gl);
    this.build();
  }

  Buffer.prototype.build = function() {
    return this.uniforms = {
      dataPointer: {
        type: 'v2',
        value: new THREE.Vector2()
      }
    };
  };

  Buffer.prototype.dispose = function() {
    this.data = null;
    this.texture.dispose();
    return Buffer.__super__.dispose.apply(this, arguments);
  };

  Buffer.prototype.update = function() {
    this.iterate();
    return this.write();
  };

  Buffer.prototype.copy = function(data) {
    var i, n, _i;
    n = Math.min(data.length, this.samples * this.channels);
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      this.data[i] = data[i];
    }
    return this.write();
  };

  Buffer.prototype.write = function() {};

  Buffer.prototype.iterate = function() {};

  Buffer.prototype.generate = function() {
    var data, done, limit, p;
    limit = this.samples;
    data = this.data;
    done = false;
    p = 0;
    switch (this.channels) {
      case 1:
        return function(x) {
          if (!done) {
            data[p++] = x || 0;
          }
          return !(done = p >= limit);
        };
      case 2:
        return function(x, y) {
          if (!done) {
            data[p++] = x || 0;
            data[p++] = y || 0;
          }
          return !(done = p >= limit);
        };
      case 3:
        return function(x, y, z) {
          if (!done) {
            data[p++] = x || 0;
            data[p++] = y || 0;
            data[p++] = z || 0;
          }
          return !(done = p >= limit);
        };
      case 4:
        return function(x, y, z, w) {
          if (!done) {
            data[p++] = x || 0;
            data[p++] = y || 0;
            data[p++] = z || 0;
            data[p++] = w || 0;
          }
          return !(done = p >= limit);
        };
    }
  };

  return Buffer;

})(Renderable);

module.exports = Buffer;


},{"../renderable":28}],17:[function(require,module,exports){
exports.Texture = require('./texture');

exports.Buffer = require('./buffer');

exports.LineBuffer = require('./linebuffer');

exports.SurfaceBuffer = require('./surfacebuffer');


},{"./buffer":16,"./linebuffer":18,"./surfacebuffer":19,"./texture":20}],18:[function(require,module,exports){
var Buffer, LineBuffer, Texture,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

Texture = require('./texture');

LineBuffer = (function(_super) {
  __extends(LineBuffer, _super);

  function LineBuffer(gl, options) {
    this.callback = options.callback || function() {};
    this.width = options.width || 1;
    this.history = options.history || 1;
    this.samples = this.width;
    LineBuffer.__super__.constructor.call(this, gl, options);
  }

  LineBuffer.prototype.build = function() {
    LineBuffer.__super__.build.apply(this, arguments);
    this.data = new Float32Array(this.samples * this.channels);
    this.texture = new Texture(this.gl, this.samples, this.history, this.channels);
    this.index = 0;
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
    this.texture.write(this.data, 0, this.index, this.samples, 1);
    this.dataPointer.set(.5, this.index + .5);
    return this.index = (this.index + 1) % this.history;
  };

  return LineBuffer;

})(Buffer);

module.exports = LineBuffer;


},{"./buffer":16,"./texture":20}],19:[function(require,module,exports){
var Buffer, SurfaceBuffer, Texture,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Buffer = require('./buffer');

Texture = require('./texture');

SurfaceBuffer = (function(_super) {
  __extends(SurfaceBuffer, _super);

  function SurfaceBuffer(gl, options) {
    this.callback = options.callback || function() {};
    this.width = options.width || 1;
    this.height = options.height || 1;
    this.history = options.history || 1;
    this.channels = options.channels || 4;
    this.samples = this.width * this.height;
    SurfaceBuffer.__super__.constructor.call(this, gl, options);
  }

  SurfaceBuffer.prototype.build = function() {
    SurfaceBuffer.__super__.build.apply(this, arguments);
    this.data = new Float32Array(this.samples * this.channels);
    this.texture = new Texture(this.gl, this.width, this.height * this.history, this.channels);
    this.index = 0;
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
    this.texture.write(this.data, 0, this.index, this.width, this.height);
    this.dataPointer.set(.5, this.index + .5);
    return this.index = (this.index + 1) % this.history;
  };

  return SurfaceBuffer;

})(Buffer);

module.exports = SurfaceBuffer;


},{"./buffer":16,"./texture":20}],20:[function(require,module,exports){
var Texture;

Texture = (function() {
  function Texture(gl, width, height, channels) {
    this.gl = gl;
    this.width = width;
    this.height = height;
    this.channels = channels;
    this.n = this.width * this.height * this.channels;
    this.build();
  }

  Texture.prototype.build = function() {
    var gl;
    gl = this.gl;
    this.texture = gl.createTexture();
    this.type = [null, gl.LUMINANCE, gl.LUMINANCE_ALPHA, gl.RGB, gl.RGBA][this.channels];
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.data = new Float32Array(this.n);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, this.type, gl.FLOAT, this.data);
    this.textureObject = new THREE.Texture(new Image(), new THREE.UVMapping(), THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.NearestFilter, THREE.NearestFilter);
    this.textureObject.__webglInit = true;
    this.textureObject.__webglTexture = texture;
    return this.uniforms = {
      dataResolution: {
        type: 'v2',
        value: new THREE.Vector2(1 / this.width, 1 / this.height)
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
    return gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, w, h, this.type, gl.FLOAT, data);
  };

  Texture.prototype.dispose = function() {
    throw 'Texture::dispose not yet implemented';
  };

  return Texture;

})();

module.exports = Texture;


},{}],21:[function(require,module,exports){
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


},{}],22:[function(require,module,exports){
var Geometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = (function(_super) {
  __extends(Geometry, _super);

  function Geometry() {
    THREE.BufferGeometry.call(this);
  }

  Geometry.prototype._emitter = function(name) {
    var array, attribute, dimensions, four, offset, one, three, two;
    attribute = this.attributes[name];
    dimensions = attribute.itemSize;
    array = attribute.array;
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
    return [null, one, two, three, four][dimensions];
  };

  return Geometry;

})(THREE.BufferGeometry);

module.exports = Geometry;


},{}],23:[function(require,module,exports){
exports.Geometry = require('./geometry');

exports.LineGeometry = require('./linegeometry');


},{"./geometry":22,"./linegeometry":24}],24:[function(require,module,exports){
var Geometry, LineGeometry,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Geometry = require('./geometry');

LineGeometry = (function(_super) {
  __extends(LineGeometry, _super);

  LineGeometry.prototype.shaderAttributes = function() {
    return {
      line: {
        type: 'v2',
        value: null
      }
    };
  };

  LineGeometry.prototype.clip = function(start, end) {
    return this.offsets = [
      {
        start: start * 6,
        count: (end - start) * 6
      }
    ];
  };

  function LineGeometry(options) {
    var base, edge, i, index, j, k, line, points, position, quads, ribbons, samples, segments, strips, triangles, x, y, _i, _j, _k, _l, _m, _n;
    THREE.BufferGeometry.call(this);
    this.samples = samples = +options.samples || 2;
    this.strips = strips = +options.strips || 1;
    this.ribbons = ribbons = +options.ribbons || 1;
    this.segments = segments = samples - 1;
    points = samples * strips * ribbons * 2;
    quads = segments * strips * ribbons;
    triangles = quads * 2;
    this.addAttribute('index', Uint16Array, triangles * 3, 1);
    this.addAttribute('position', Float32Array, points, 3);
    this.addAttribute('line', Float32Array, points, 2);
    index = this._emitter('index');
    position = this._emitter('position');
    line = this._emitter('line');
    base = 0;
    for (i = _i = 0; 0 <= ribbons ? _i < ribbons : _i > ribbons; i = 0 <= ribbons ? ++_i : --_i) {
      for (j = _j = 0; 0 <= strips ? _j < strips : _j > strips; j = 0 <= strips ? ++_j : --_j) {
        for (k = _k = 0; 0 <= samples ? _k <= samples : _k >= samples; k = 0 <= samples ? ++_k : --_k) {
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
    this.clip(0, quads);
    return;
  }

  return LineGeometry;

})(Geometry);

module.exports = LineGeometry;


},{"./geometry":22}],25:[function(require,module,exports){
exports.Scene = require('./scene');

exports.Factory = require('./factory');

exports.Renderable = require('./scene');

exports.Types = require('./types');


},{"./factory":21,"./scene":29,"./types":30}],26:[function(require,module,exports){
exports.Line = require('./line');


},{"./line":27}],27:[function(require,module,exports){
var Line, LineGeometry, Renderable, fragmentShader, vertexShader,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

vertexShader = "\n/*\n//Data sampler\n\nuniform sampler2D dataTexture;\nuniform vec2 dataResolution;\nuniform vec2 dataPointer;\n\nvec2 mapUV(vec2 xy) {\n  return vec2(xy.y, 0);\n}\n\nvec4 sampleData(vec2 xy) {\n  vec2 uv = fract((mapUV(xy) + dataPointer) * dataResolution);\n  vec4 sample = texture2D(dataTexture, uv);\n  return transformData(uv, sample);\n}\n\n*/\n\n/*\n// Grid\nuniform vec2 gridRange;\nuniform vec4 gridAxis;\nuniform vec4 gridOffset;\n\nvec4 transformData(vec2 uv, vec4 data) {\n  return vec4(data.r, 0, 0, 0) + gridAxis * uv.x + gridOffset;\n}\n*/\n\n/*\n// Axis\n*/\nuniform vec4 axisLength;\nuniform vec4 axisPosition;\n\nvec4 sampleData(vec2 uv) {\n  return axisLength * uv.x + axisPosition;\n}\n\nvec3 getViewPos(vec4 position) {\n  return (modelViewMatrix * vec4(position.xyz, 1.0)).xyz;\n}\n\nuniform float lineWidth;\n\nattribute vec2 line;\n\nvoid getLineGeometry(vec2 xy, float edge, inout vec4 left, inout vec4 center, inout vec4 right) {\n  vec2 step = vec2(1.0, 0.0);\n\n  center = sampleData(xy);\n  left = (edge < -0.5) ? center : sampleData(xy - step);\n  right = (edge > 0.5) ? center : sampleData(xy + step);\n}\n\nvec3 getLineJoin(float edge, vec3 left, vec3 center, vec3 right) {\n  vec3 bitangent;\n  vec3 normal = center;\n\n  vec3 legLeft = center - left;\n  vec3 legRight = right - center;\n\n  if (edge > 0.5) {\n    bitangent = normalize(cross(normal, legLeft));\n  }\n  else if (edge < -0.5) {\n    bitangent = normalize(cross(normal, legRight));\n  }\n  else {\n    vec3 joinLeft = normalize(cross(normal, legLeft));\n    vec3 joinRight = normalize(cross(normal, legRight));\n    float scale = min(4.0, tan(acos(dot(joinLeft, joinRight) * .999) * .5) * .5);\n    bitangent = normalize(joinLeft + joinRight) * sqrt(1.0 + scale * scale);\n  }\n  \n  return bitangent;\n}\n\nvoid main() {\n  float edge = line.x;\n  float offset = line.y;\n\n  vec4 left, center, right;\n  getLineGeometry(position.xy, edge, left, center, right);\n\n  vec3 viewLeft = getViewPos(left);\n  vec3 viewRight = getViewPos(right);\n	vec3 viewCenter = getViewPos(center);\n\n  vec3 lineJoin = getLineJoin(edge, viewLeft, viewCenter, viewRight);\n\n	vec4 glPosition = projectionMatrix * vec4(viewCenter + lineJoin * offset * lineWidth, 1.0);\n\n  gl_Position = glPosition;\n}\n";

fragmentShader = "uniform vec3 lineColor;\nuniform float lineOpacity;\n\nvoid main() {\n	gl_FragColor = vec4(lineColor, lineOpacity);\n}";

Renderable = require('../renderable');

LineGeometry = require('../geometry').LineGeometry;

Line = (function(_super) {
  __extends(Line, _super);

  function Line(gl, options) {
    var buffer, uniforms, _ref;
    Line.__super__.constructor.call(this, gl);
    uniforms = (_ref = options.uniforms) != null ? _ref : {};
    buffer = options.buffer;
    this._adopt(uniforms);
    this.geometry = new LineGeometry({
      samples: options.samples || 2,
      strips: options.strips || 1,
      ribbons: options.ribbons || 1
    });
    this.material = new THREE.ShaderMaterial({
      attributes: this.geometry.shaderAttributes(),
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      defaultAttributeValues: null
    });
    this.object = new THREE.Mesh(this.geometry, this.material);
    this.object.frustumCulled = false;
  }

  Line.prototype.dispose = function() {
    this.geometry.dispose();
    this.material.dispose();
    this.object = this.geometry = this.material = null;
    return Line.__super__.dispose.apply(this, arguments);
  };

  return Line;

})(Renderable);

module.exports = Line;


},{"../geometry":23,"../renderable":28}],28:[function(require,module,exports){
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
    var key, value;
    for (key in uniforms) {
      value = uniforms[key];
      this.uniforms[key] = value;
    }
  };

  Renderable.prototype._set = function(uniforms) {
    var key, value;
    for (key in uniforms) {
      value = uniforms[key];
      if (this.uniforms[key] != null) {
        this.uniforms[key].value = value;
      }
    }
  };

  return Renderable;

})();

module.exports = Renderable;


},{}],29:[function(require,module,exports){
var Scene,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Scene = (function() {
  function Scene(scene) {
    var MathBox;
    this.scene = scene;
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


},{}],30:[function(require,module,exports){
var Classes;

Classes = {
  line: require('./meshes').Line,
  databuffer: require('./buffer').DataBuffer,
  linebuffer: require('./buffer').LineBuffer,
  surfacebuffer: require('./buffer').SurfaceBuffer
};

exports.Classes = Classes;


},{"./buffer":17,"./meshes":26}],31:[function(require,module,exports){
var Animator;

Animator = (function() {
  function Animator(model) {
    this.model = model;
  }

  Animator.prototype.update = function() {};

  return Animator;

})();

module.exports = Animator;


},{}],32:[function(require,module,exports){
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


},{}],33:[function(require,module,exports){
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
    target = primitive.parent || this.model.getRoot();
    target.remove(primitive);
    primitive.off('render', this.render);
    return primitive.off('unrender', this.unrender);
  };

  return Controller;

})();

module.exports = Controller;


},{}],34:[function(require,module,exports){
var Director;

Director = (function() {
  function Director(model, script) {
    this.model = model;
    this.script = script;
  }

  return Director;

})();

module.exports = Director;


},{}],35:[function(require,module,exports){
exports.Animator = require('./animator');

exports.API = require('./api');

exports.Controller = require('./controller');

exports.Director = require('./director');

exports.Model = require('./model');


},{"./animator":31,"./api":32,"./controller":33,"./director":34,"./model":36}],36:[function(require,module,exports){
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


},{}],37:[function(require,module,exports){
exports.Ticks = require('./ticks');


},{"./ticks":38}],38:[function(require,module,exports){

/*
 Generate equally spaced ticks in a range at sensible positions.
 
 @param min/max - Minimum and maximum of range
 @param n - Desired number of ticks in range
 @param unit - Base unit of scale (e.g. 1 or π).
 @param scale - Division scale (e.g. 2 = binary division, or 10 = decimal division).
 @param inclusive - Whether to add ticks at the edges
 @param bias - Integer to bias divisions one or more levels up or down (to create nested scales)
 */
var linear, log, make;

linear = function(min, max, n, unit, base, inclusive, bias) {
  var distance, edge, factor, factors, i, ideal, ref, span, step, steps, _i, _j, _len, _results;
  n || (n = 10);
  bias || (bias = 0);
  span = max - min;
  ideal = span / n;
  unit || (unit = 1);
  base || (base = 10);
  ref = unit * (bias + Math.pow(base, Math.floor(Math.log(ideal / unit) / Math.log(base))));
  factors = base % 2 === 0 ? [base / 2, 1, 1 / 2] : base % 3 === 0 ? [base / 3, 1, 1 / 3] : [1];
  for (_i = 0, _len = factors.length; _i < _len; _i++) {
    factor = factors[_i];
    steps = ref * factor;
  }
  distance = Infinity;
  step = steps.reduce(function(ref, step) {
    var d;
    d = Math.abs(step - ideal);
    if (d < distance) {
      distance = d;
      return step;
    } else {
      return ref;
    }
  }, ref);
  edge = +(!inclusive);
  min = (Math.ceil(min / step) + edge) * step;
  max = (Math.floor(max / step) - edge) * step;
  n = Math.ceil((max - min) / step);
  _results = [];
  for (i = _j = 0; 0 <= n ? _j <= n : _j >= n; i = 0 <= n ? ++_j : --_j) {
    _results.push(min + x * step);
  }
  return _results;
};


/*
 Generate logarithmically spaced ticks in a range at sensible positions.
 */

log = function(min, max, n, unit, base, inclusive, bias) {
  throw "Log ticks not yet implemented.";

  /*
  base = Math.log(base)
  ibase = 1 / base
  l = (x) -> Math.log(x) * ibase
  
   * Generate linear scale in log space at (base - 1) divisions
  ticks = Linear(l(min), l(max), n, unit, Math.max(2, scale - 1), inclusive, bias)
  
   * Remap ticks within each order of magnitude
  for tick in ticks
    floor = Math.floor tick
    frac = tick - floor
  
    ref = Math.exp floor * base
    value = ref * Math.round 1 + (base - 1) * frac
   */
};

make = function(type, min, max, ticks, unit, base, inclusive, bias) {
  switch (scale) {
    case 'linear':
      return Ticks.linear(min, max, ticks, unit, base, inclusive, bias);
    case 'log':
      return Ticks.log(min, max, ticks, unit, base, inclusive, bias);
  }
};

exports.make = make;

exports.linear = linear;

exports.log = log;


},{}]},{},[2])